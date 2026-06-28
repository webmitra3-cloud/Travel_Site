from datetime import datetime, time
from decimal import Decimal
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer
from services.booking_reference import generate_booking_reference
from Travel.emails import send_booking_created_email
from users.models import AuditLog
from bookings.management.commands.expire_bookings import expire_old_bookings

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Trigger dynamic auto-expiry check
        try:
            expire_old_bookings()
        except Exception:
            pass

        user = self.request.user
        is_admin = user.role in ['ADMIN', 'MANAGER'] or user.is_staff
        
        if is_admin:
            queryset = Booking.objects.all().order_by('-created_at')
        else:
            queryset = Booking.objects.filter(user=user).order_by('-created_at')


        # Apply search and filtering
        status_filter = self.request.query_params.get('booking_status')
        if status_filter:
            queryset = queryset.filter(booking_status=status_filter)

        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(booking_reference__icontains=search_query) |
                Q(user__full_name__icontains=search_query) |
                Q(user__email__icontains=search_query)
            )

        return queryset

    def perform_create(self, serializer):
        try:
            expire_old_bookings()
        except Exception:
            pass

        room = serializer.validated_data['room']
        check_in = serializer.validated_data['check_in']
        check_out = serializer.validated_data['check_out']

        nights = (check_out - check_in).days
        total_amount = room.price_per_night * Decimal(nights)

        with transaction.atomic():
            # Generate unique booking reference
            ref = generate_booking_reference()
            
            booking = serializer.save(
                user=self.request.user,
                booking_reference=ref,
                total_nights=nights,
                total_amount=total_amount,
                booking_status='PENDING_PAYMENT',
                payment_status='NOT_SUBMITTED'
            )
            
            # Audit log
            AuditLog.objects.create(
                user=self.request.user,
                action="BOOKING_CREATE",
                object_type="Booking",
                object_id=str(booking.id),
                description=f"Created booking {booking.booking_reference} for room {room.room_name}."
            )
            
            # Send Email (handled safely in case email fails)
            try:
                send_booking_created_email(booking)
            except Exception:
                pass


    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = self.get_object()
        
        # Check if already cancelled
        if booking.booking_status == 'CANCELLED':
            return Response({"error": "Booking is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = request.user
        is_admin = user.role in ['ADMIN', 'MANAGER'] or user.is_staff
        reason = request.data.get('reason', 'Cancelled by user')

        if not is_admin:
            # Check-in date COMBINED with min time to represent start of checkin day
            check_in_datetime = datetime.combine(booking.check_in, time.min)
            # Make timezone aware
            check_in_datetime = timezone.make_aware(check_in_datetime, timezone.get_current_timezone())
            
            # Check if within 24 hours of checkin
            now = timezone.now()
            if check_in_datetime - now < timezone.timedelta(hours=24):
                return Response(
                    {"error": "Cancellations are only allowed up to 24 hours before the check-in date."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        with transaction.atomic():
            booking.booking_status = 'CANCELLED'
            booking.cancelled_at = timezone.now()
            booking.cancellation_reason = reason
            booking.save()

            # Audit log
            AuditLog.objects.create(
                user=user,
                action="BOOKING_CANCEL",
                object_type="Booking",
                object_id=str(booking.id),
                description=f"Cancelled booking {booking.booking_reference}. Reason: {reason}"
            )

        return Response({"status": "cancelled", "booking_reference": booking.booking_reference})
