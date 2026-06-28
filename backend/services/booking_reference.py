from datetime import datetime
from bookings.models import Booking

def generate_booking_reference():
    """
    Generate a unique, sequential booking reference.
    Format: BK-YYYY-XXXXXX (e.g., BK-2026-000001)
    """
    current_year = datetime.now().year
    prefix = f"BK-{current_year}-"
    
    # Retrieve the most recent booking starting with prefix
    last_booking = Booking.objects.filter(
        booking_reference__startswith=prefix
    ).order_by('-created_at').first()
    
    if last_booking:
        try:
            parts = last_booking.booking_reference.split('-')
            last_num = int(parts[-1])
            next_num = last_num + 1
        except (ValueError, IndexError):
            next_num = 1
    else:
        next_num = 1
        
    return f"{prefix}{next_num:06d}"
