from rest_framework import serializers
from .models import PaymentMethod, PaymentProof
from bookings.serializers import BookingSerializer
import os

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'
        read_only_fields = ('id', 'is_deleted', 'deleted_at')


class PaymentProofSerializer(serializers.ModelSerializer):
    booking_detail = BookingSerializer(source='booking', read_only=True)
    payment_method_detail = PaymentMethodSerializer(source='payment_method', read_only=True)

    class Meta:
        model = PaymentProof
        fields = ('id', 'booking', 'payment_method', 'screenshot', 'transaction_id', 'notes', 'submitted_at', 'booking_detail', 'payment_method_detail')
        read_only_fields = ('id', 'submitted_at')

    def validate_screenshot(self, value):
        # File size validation (5 MB limit)
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError("Screenshot file size must not exceed 5 MB.")

        # File format validation (JPG, JPEG, PNG, WEBP)
        ext = os.path.splitext(value.name)[1].lower()
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
        if ext not in allowed_extensions:
            raise serializers.ValidationError("Screenshot must be in JPG, JPEG, PNG, or WEBP format.")

        return value
