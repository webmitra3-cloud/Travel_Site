from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from bookings.models import Booking
from users.models import AuditLog

def expire_old_bookings():
    """
    Query and transition all bookings pending payment for >24 hours to EXPIRED.
    """
    cutoff = timezone.now() - timedelta(hours=24)
    expired_bookings = Booking.objects.filter(
        booking_status='PENDING_PAYMENT',
        created_at__lte=cutoff
    )
    count = expired_bookings.count()
    for booking in expired_bookings:
        booking.booking_status = 'EXPIRED'
        booking.save()
        
        # Log to audit trail
        AuditLog.objects.create(
            user=None,
            action="BOOKING_EXPIRE",
            object_type="Booking",
            object_id=str(booking.id),
            description=f"System auto-expired booking {booking.booking_reference} due to non-payment within 24 hours."
        )
    return count


class Command(BaseCommand):
    help = 'Expires bookings pending payment for more than 24 hours'

    def handle(self, *args, **options):
        count = expire_old_bookings()
        self.stdout.write(self.style.SUCCESS(f'Successfully expired {count} bookings.'))
