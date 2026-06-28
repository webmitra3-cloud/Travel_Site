from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_reference', 'user', 'room', 'check_in', 'check_out', 'booking_status', 'payment_status', 'total_amount', 'created_at')
    search_fields = ('booking_reference', 'user__email', 'user__full_name', 'room__room_name')
    list_filter = ('booking_status', 'payment_status', 'created_at')
    date_hierarchy = 'check_in'
    readonly_fields = ('booking_reference', 'total_nights', 'total_amount', 'created_at')
