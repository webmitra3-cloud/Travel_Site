from rest_framework import serializers
from .models import Booking
from rooms.models import Room
from rooms.serializers import RoomSerializer
from users.serializers import UserSerializer
from django.utils import timezone
from datetime import timedelta

class BookingSerializer(serializers.ModelSerializer):
    room_detail = RoomSerializer(source='room', read_only=True)
    user_detail = UserSerializer(source='user', read_only=True)
    customer_email = serializers.ReadOnlyField(source='user.email')
    customer_name = serializers.ReadOnlyField(source='user.full_name')

    class Meta:
        model = Booking
        fields = (
            'id', 'booking_reference', 'user', 'room', 'check_in', 'check_out', 
            'guests', 'total_nights', 'total_amount', 'booking_status', 
            'payment_status', 'rejection_reason', 'reviewed_by', 'reviewed_at',
            'cancelled_at', 'cancellation_reason', 'created_at', 'updated_at', 
            'room_detail', 'user_detail', 'customer_email', 'customer_name'
        )
        read_only_fields = (
            'id', 'booking_reference', 'user', 'total_nights', 'total_amount', 
            'booking_status', 'payment_status', 'rejection_reason', 
            'reviewed_by', 'reviewed_at', 'cancelled_at', 'cancellation_reason', 
            'created_at', 'updated_at'
        )

    def validate(self, attrs):
        room = attrs['room']
        check_in = attrs['check_in']
        check_out = attrs['check_out']
        guests = attrs['guests']

        # Date validations
        today = timezone.localdate()
        if check_in < today:
            raise serializers.ValidationError({"check_in": "Check-in date cannot be in the past."})
        if check_out <= check_in:
            raise serializers.ValidationError({"check_out": "Check-out date must be after check-in date."})
        
        # Room capacity check
        if guests > room.capacity:
            raise serializers.ValidationError({"guests": f"Guests exceed maximum room capacity of {room.capacity}."})

        # Availability/Overlap validation
        # Blocked if booking is CONFIRMED, PAYMENT_SUBMITTED, VERIFICATION_PENDING, ADMIN_REVIEW
        active_bookings = Booking.objects.filter(
            room=room,
            booking_status__in=['CONFIRMED', 'PAYMENT_SUBMITTED', 'VERIFICATION_PENDING', 'ADMIN_REVIEW'],
            check_in__lt=check_out,
            check_out__gt=check_in
        )

        # Count overlapping bookings for each night
        nights = (check_out - check_in).days
        occupied_dates = {}
        curr_date = check_in
        while curr_date < check_out:
            occupied_dates[curr_date] = 0
            curr_date += timedelta(days=1)

        for b in active_bookings:
            b_date = max(b.check_in, check_in)
            b_end = min(b.check_out, check_out)
            while b_date < b_end:
                if b_date in occupied_dates:
                    occupied_dates[b_date] += 1
                b_date += timedelta(days=1)

        for d, count in occupied_dates.items():
            if count >= room.total_units:
                raise serializers.ValidationError({"room": f"Room is fully booked for the night of {d}."})

        return attrs
