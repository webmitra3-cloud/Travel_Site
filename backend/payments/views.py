from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import PaymentMethod, PaymentProof
from .serializers import PaymentMethodSerializer, PaymentProofSerializer
from users.views import IsAdminOrManager
from users.models import AuditLog
from bookings.voucher import generate_booking_voucher_pdf
from Travel.emails import (
    send_payment_submitted_email,
    send_payment_approved_email,
    send_payment_rejected_email
)

class PaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentMethodSerializer

    def get_queryset(self):
        is_admin = self.request.user.is_authenticated and (
            self.request.user.role in ['ADMIN', 'MANAGER'] or self.request.user.is_staff
        )
        if is_admin and self.request.query_params.get('include_deleted') == 'true':
            return PaymentMethod.objects.all_with_deleted()
        return PaymentMethod.objects.all() # Default returns alive()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrManager()]

    def perform_destroy(self, instance):
        instance.delete()
        
        # Audit log
        AuditLog.objects.create(
            user=self.request.user,
            action="PAYMENT_METHOD_DELETE",
            object_type="PaymentMethod",
            object_id=str(instance.id),
            description=f"Soft deleted payment method: {instance.method_name}."
        )


class PaymentProofViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentProofSerializer

    def get_queryset(self):
        user = self.request.user
        is_admin = user.role in ['ADMIN', 'MANAGER'] or user.is_staff
        
        if is_admin:
            return PaymentProof.objects.all().order_by('-submitted_at')
        return PaymentProof.objects.filter(booking__user=user).order_by('-submitted_at')

    def get_permissions(self):
        if self.action in ['approve', 'reject']:
            return [IsAdminOrManager()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        with transaction.atomic():
            proof = serializer.save()
            booking = proof.booking
            
            # Update booking status
            booking.booking_status = 'PAYMENT_SUBMITTED'
            booking.payment_status = 'VERIFICATION_PENDING'
            booking.save()

            # Audit log
            AuditLog.objects.create(
                user=self.request.user,
                action="PAYMENT_PROOF_SUBMIT",
                object_type="Booking",
                object_id=str(booking.id),
                description=f"Submitted payment proof for booking {booking.booking_reference}."
            )
            
            # Send Notification Email safely
            try:
                send_payment_submitted_email(booking)
            except Exception:
                pass

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        proof = self.get_object()
        booking = proof.booking

        if booking.booking_status == 'CONFIRMED':
            return Response({"error": "Booking is already confirmed."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Update status
            booking.booking_status = 'CONFIRMED'
            booking.payment_status = 'VERIFIED'
            booking.reviewed_by = request.user
            booking.reviewed_at = timezone.now()
            booking.save()

            # Generate voucher PDF
            pdf_data = None
            try:
                pdf_data = generate_booking_voucher_pdf(booking)
            except Exception as e:
                # Log error but don't block approval
                pass

            # Audit log
            AuditLog.objects.create(
                user=request.user,
                action="PAYMENT_PROOF_APPROVE",
                object_type="Booking",
                object_id=str(booking.id),
                description=f"Approved payment for booking {booking.booking_reference}."
            )

            # Send Approved Email (with PDF attachment if generated)
            try:
                send_payment_approved_email(booking, pdf_content=pdf_data)
            except Exception:
                pass

        return Response({"status": "approved", "booking_reference": booking.booking_reference})

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        proof = self.get_object()
        booking = proof.booking
        
        reason = request.data.get('reason')
        if not reason:
            return Response({"reason": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Update status
            booking.booking_status = 'PENDING_PAYMENT'
            booking.payment_status = 'REJECTED'
            booking.rejection_reason = reason
            booking.reviewed_by = request.user
            booking.reviewed_at = timezone.now()
            booking.save()

            # Delete the payment proof record so they can upload a new screenshot
            # This is cleaner as it resets the OneToOne relationship
            proof.delete()

            # Audit log
            AuditLog.objects.create(
                user=request.user,
                action="PAYMENT_PROOF_REJECT",
                object_type="Booking",
                object_id=str(booking.id),
                description=f"Rejected payment for booking {booking.booking_reference}. Reason: {reason}"
            )

            # Send Rejection Email
            try:
                send_payment_rejected_email(booking, reason)
            except Exception:
                pass

        return Response({
            "status": "rejected", 
            "booking_status": booking.booking_status,
            "payment_status": booking.payment_status,
            "reason": reason
        })
