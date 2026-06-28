import uuid
from django.db import models
from django.conf import settings
from rooms.models import Room

class Booking(models.Model):
    STATUS_CHOICES = (
        ('PENDING_PAYMENT', 'Pending Payment'),
        ('PAYMENT_SUBMITTED', 'Payment Submitted'),
        ('VERIFICATION_PENDING', 'Verification Pending'),
        ('ADMIN_REVIEW', 'Admin Review'),
        ('CONFIRMED', 'Confirmed'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('NOT_SUBMITTED', 'Not Submitted'),
        ('VERIFICATION_PENDING', 'Verification Pending'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_reference = models.CharField(max_length=30, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings', db_index=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, related_name='bookings', db_index=True)
    check_in = models.DateField()
    check_out = models.DateField()
    guests = models.PositiveIntegerField()
    total_nights = models.PositiveIntegerField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    booking_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING_PAYMENT', db_index=True)
    payment_status = models.CharField(max_length=50, choices=PAYMENT_STATUS_CHOICES, default='NOT_SUBMITTED', db_index=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Audit tracking fields
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_bookings')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Cancellation tracking fields
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking {self.booking_reference} - {self.user.email}"
