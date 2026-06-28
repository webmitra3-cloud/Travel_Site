import uuid
from django.db import models
from bookings.models import Booking
from Travel.utils import SoftDeleteModel

class PaymentMethod(SoftDeleteModel):
    method_name = models.CharField(max_length=100)
    qr_image = models.ImageField(upload_to='payments/qrs/', blank=True, null=True)
    account_name = models.CharField(max_length=150)
    account_number = models.CharField(max_length=150)
    instructions = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.method_name


class PaymentProof(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment_proof', db_index=True)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True)
    screenshot = models.ImageField(upload_to='payments/proofs/')
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Proof for {self.booking.booking_reference}"
