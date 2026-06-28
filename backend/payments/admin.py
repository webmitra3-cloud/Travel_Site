from django.contrib import admin
from .models import PaymentMethod, PaymentProof

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('method_name', 'account_name', 'account_number', 'is_active', 'is_deleted')
    list_filter = ('is_active', 'is_deleted')
    search_fields = ('method_name', 'account_name')

@admin.register(PaymentProof)
class PaymentProofAdmin(admin.ModelAdmin):
    list_display = ('booking', 'payment_method', 'transaction_id', 'submitted_at')
    list_filter = ('payment_method', 'submitted_at')
    search_fields = ('transaction_id', 'booking__booking_reference', 'booking__user__email')
    readonly_fields = ('screenshot', 'transaction_id', 'notes')
