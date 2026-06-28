from datetime import datetime, date, timedelta
from calendar import monthrange
from decimal import Decimal
from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.views import IsAdminOrManager
from bookings.models import Booking
from rooms.models import Room
from users.models import User

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminOrManager]
    
    def get(self, request):
        today = timezone.localdate()
        
        # Core Metrics
        confirmed_bookings = Booking.objects.filter(booking_status='CONFIRMED')
        
        total_revenue = confirmed_bookings.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        
        today_revenue = confirmed_bookings.filter(created_at__date=today).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        
        start_of_month = today.replace(day=1)
        monthly_revenue = confirmed_bookings.filter(created_at__date__gte=start_of_month).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        
        total_bookings = Booking.objects.count()
        pending_payments = Booking.objects.filter(booking_status='PENDING_PAYMENT').count()
        active_rooms = Room.objects.filter(availability_status='AVAILABLE').count()
        
        # New users last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        new_users = User.objects.filter(created_at__gte=thirty_days_ago, role='CUSTOMER').count()
        
        # Calculate monthly stats for the last 6 months (including current)
        monthly_analytics = []
        
        # Get all rooms total units
        total_room_units = Room.objects.aggregate(total=Sum('total_units'))['total'] or 0
        
        for i in range(5, -1, -1):
            # Calculate year and month for offset
            month_date = today - timedelta(days=i*30)
            year = month_date.year
            month = month_date.month
            month_name = month_date.strftime('%b')
            
            month_start = date(year, month, 1)
            last_day = monthrange(year, month)[1]
            month_end = date(year, month, last_day)
            
            # 1. Monthly revenue (confirmed bookings created in this month)
            rev = Booking.objects.filter(
                booking_status='CONFIRMED',
                created_at__date__range=[month_start, month_end]
            ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            
            # 2. Monthly bookings count (created in this month)
            bk_cnt = Booking.objects.filter(
                created_at__date__range=[month_start, month_end]
            ).count()
            
            # 3. Occupancy calculation
            # Available room nights
            available_nights = total_room_units * last_day
            
            # Occupied room nights
            # Overlapping bookings in this month
            active_bks = Booking.objects.filter(
                booking_status__in=['CONFIRMED', 'PAYMENT_SUBMITTED', 'VERIFICATION_PENDING', 'ADMIN_REVIEW'],
                check_in__lt=month_end + timedelta(days=1),
                check_out__gt=month_start
            )
            
            occupied_nights = 0
            for bk in active_bks:
                overlap_start = max(bk.check_in, month_start)
                overlap_end = min(bk.check_out, month_end + timedelta(days=1))
                nights = (overlap_end - overlap_start).days
                if nights > 0:
                    occupied_nights += nights
                    
            occ_rate = 0.0
            if available_nights > 0:
                occ_rate = round((occupied_nights / available_nights) * 100, 1)
                
            monthly_analytics.append({
                "month": f"{month_name} {year}",
                "revenue": float(rev),
                "bookings": bk_cnt,
                "occupancy_rate": occ_rate
            })
            
        return Response({
            "metrics": {
                "total_revenue": float(total_revenue),
                "today_revenue": float(today_revenue),
                "monthly_revenue": float(monthly_revenue),
                "total_bookings": total_bookings,
                "pending_payments": pending_payments,
                "active_rooms": active_rooms,
                "new_users": new_users
            },
            "analytics": monthly_analytics
        })


class CustomerDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        bookings = Booking.objects.filter(user=user)
        
        total_bookings = bookings.count()
        pending_payments = bookings.filter(booking_status='PENDING_PAYMENT').count()
        confirmed_bookings = bookings.filter(booking_status='CONFIRMED').count()
        
        # Active bookings: check-out in the future
        today = timezone.localdate()
        active_bookings = bookings.filter(booking_status='CONFIRMED', check_out__gte=today).count()
        
        return Response({
            "total_bookings": total_bookings,
            "pending_payments": pending_payments,
            "confirmed_bookings": confirmed_bookings,
            "active_bookings": active_bookings
        })
