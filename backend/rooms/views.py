from datetime import datetime, timedelta, date
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Room, Amenity, RoomImage, Review
from .serializers import RoomSerializer, AmenitySerializer, ReviewSerializer
from users.views import IsAdminOrManager
from users.models import AuditLog
from bookings.management.commands.expire_bookings import expire_old_bookings

class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    lookup_field = 'slug'

    def get_object(self):
        import uuid
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        val = self.kwargs[lookup_url_kwarg]
        try:
            uuid.UUID(val)
            obj = Room.objects.all_with_deleted().get(id=val)
            self.check_object_permissions(self.request, obj)
            return obj
        except (ValueError, Room.DoesNotExist):
            self.lookup_field = 'slug'
            return super().get_object()

    def get_queryset(self):
        # Admins can view all including soft-deleted and inactive
        is_admin = self.request.user.is_authenticated and (
            self.request.user.role in ['ADMIN', 'MANAGER'] or self.request.user.is_staff
        )
        
        if is_admin and self.request.query_params.get('include_deleted') == 'true':
            queryset = Room.objects.all_with_deleted()
        else:
            queryset = Room.objects.all()  # Default Manager only returns alive()

        # Apply filtering
        room_type = self.request.query_params.get('room_type')
        if room_type:
            queryset = queryset.filter(room_type__iexact=room_type)

        capacity = self.request.query_params.get('capacity')
        if capacity:
            queryset = queryset.filter(capacity__gte=int(capacity))

        min_price = self.request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price_per_night__gte=float(min_price))

        max_price = self.request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price_per_night__lte=float(max_price))

        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(room_name__icontains=search_query) | Q(description__icontains=search_query)
            )

        # Status check
        if not is_admin:
            queryset = queryset.filter(availability_status='AVAILABLE')
        else:
            status_param = self.request.query_params.get('availability_status')
            if status_param:
                queryset = queryset.filter(availability_status=status_param)

        # Sorting
        ordering = self.request.query_params.get('ordering')
        if ordering == 'price_asc':
            queryset = queryset.order_by('price_per_night')
        elif ordering == 'price_desc':
            queryset = queryset.order_by('-price_per_night')
        elif ordering == 'popular':
            queryset = queryset.order_by('-created_at') # Or average rating
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'availability']:
            return [permissions.AllowAny()]
        return [IsAdminOrManager()]

    def perform_destroy(self, instance):
        # Perform soft delete
        instance.delete()
        
        # Log audit trail
        AuditLog.objects.create(
            user=self.request.user,
            action="ROOM_SOFT_DELETE",
            object_type="Room",
            object_id=str(instance.id),
            description=f"Soft deleted room: {instance.room_name}."
        )

    @action(detail=True, methods=['get'], url_path='availability')
    def availability(self, request, slug=None):
        """
        GET /api/rooms/{id_or_slug}/availability/
        Checks room night booking limits and blocked calendar dates
        """
        try:
            expire_old_bookings()
        except Exception:
            pass

        try:
            import uuid
            # Try UUID lookup
            uuid.UUID(slug)
            room = Room.objects.all_with_deleted().get(id=slug)
        except (ValueError, Room.DoesNotExist):
            try:
                room = Room.objects.all_with_deleted().get(slug=slug)
            except Room.DoesNotExist:
                return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        # Default range: today to next 30 days
        today = timezone.localdate()
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = today

        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = start_date + timedelta(days=30)

        if start_date >= end_date:
            return Response({"error": "Start date must be before end date"}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve active overlapping bookings
        from bookings.models import Booking
        active_bookings = Booking.objects.filter(
            room=room,
            booking_status__in=['CONFIRMED', 'PAYMENT_SUBMITTED', 'VERIFICATION_PENDING', 'ADMIN_REVIEW'],
            check_in__lt=end_date,
            check_out__gt=start_date
        )

        # Track dates
        occupied_dates = {}
        curr_date = start_date
        while curr_date < end_date:
            occupied_dates[curr_date] = 0
            curr_date += timedelta(days=1)

        for booking in active_bookings:
            b_date = max(booking.check_in, start_date)
            b_end = min(booking.check_out, end_date)
            while b_date < b_end:
                if b_date in occupied_dates:
                    occupied_dates[b_date] += 1
                b_date += timedelta(days=1)

        blocked_dates = [str(d) for d, count in occupied_dates.items() if count >= room.total_units]
        min_occupied = max(occupied_dates.values()) if occupied_dates else 0
        available_units = max(0, room.total_units - min_occupied)

        return Response({
            "room_id": str(room.id),
            "available_units": available_units,
            "blocked_dates": blocked_dates
        })


class AmenityViewSet(viewsets.ModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrManager()]


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        is_admin = self.request.user.is_authenticated and (
            self.request.user.role in ['ADMIN', 'MANAGER'] or self.request.user.is_staff
        )
        if is_admin:
            return Review.objects.all().order_by('-created_at')
        return Review.objects.filter(is_approved=True).order_by('-created_at')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [IsAdminOrManager()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrManager])
    def approve(self, request, pk=None):
        review = self.get_object()
        review.is_approved = True
        review.save()
        return Response({"status": "approved"})
