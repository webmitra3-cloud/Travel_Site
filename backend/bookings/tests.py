from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta, date
from decimal import Decimal
from rooms.models import Room
from bookings.models import Booking
from payments.models import PaymentMethod, PaymentProof
from bookings.management.commands.expire_bookings import expire_old_bookings

User = get_user_model()

class BookingSystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create user accounts
        self.customer = User.objects.create_user(
            email='guest@luxury.com',
            password='guestpassword123',
            full_name='John Guest',
            phone_number='1234567890'
        )
        self.admin = User.objects.create_superuser(
            email='admin@luxury.com',
            password='adminpassword123',
            full_name='Leon Noe'
        )
        
        # Create a Room
        self.room = Room.objects.create(
            room_name='Presidential Suite',
            slug='presidential-suite',
            room_type='Suite',
            description='Splendid room with scenic views',
            price_per_night=Decimal('500.00'),
            capacity=4,
            total_units=1,
            availability_status='AVAILABLE'
        )
        
        # Create a Payment Method
        self.payment_method = PaymentMethod.objects.create(
            method_name='FonePay',
            account_name='BOOKING HOTEL',
            account_number='9876543210'
        )
        
        # Retrieve JWT Token for customer
        response = self.client.post('/api/users/login/', {
            'email': 'guest@luxury.com',
            'password': 'guestpassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer_token = response.data['access']
        
        # Retrieve JWT Token for admin
        response = self.client.post('/api/users/login/', {
            'email': 'admin@luxury.com',
            'password': 'adminpassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.admin_token = response.data['access']

    def test_booking_creation_and_overlap_protection(self):
        # Authenticate customer
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.customer_token}')
        
        # Create a valid booking
        payload = {
            'room': str(self.room.id),
            'check_in': '2026-07-10',
            'check_out': '2026-07-15',
            'guests': 2
        }
        response = self.client.post('/api/bookings/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['booking_reference'].startswith('BK-2026-'))
        self.assertEqual(response.data['booking_status'], 'PENDING_PAYMENT')
        self.assertEqual(float(response.data['total_amount']), 2500.0) # 5 nights * 500.00
        
        # Attempt another booking for overlapping dates (July 12 to 14)
        overlap_payload = {
            'room': str(self.room.id),
            'check_in': '2026-07-12',
            'check_out': '2026-07-14',
            'guests': 2
        }
        
        # Make another booking with payment submitted to block the date
        booking_id = response.data['id']
        booking_obj = Booking.objects.get(id=booking_id)
        booking_obj.booking_status = 'PAYMENT_SUBMITTED'
        booking_obj.save()
        
        overlap_response = self.client.post('/api/bookings/', overlap_payload)
        self.assertEqual(overlap_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('room', overlap_response.data)

    def test_booking_expiry(self):
        # Create a booking
        booking = Booking.objects.create(
            booking_reference='BK-2026-TESTEXP',
            user=self.customer,
            room=self.room,
            check_in=date(2026, 7, 20),
            check_out=date(2026, 7, 22),
            guests=2,
            total_nights=2,
            total_amount=Decimal('1000.00'),
            booking_status='PENDING_PAYMENT',
            payment_status='NOT_SUBMITTED'
        )
        
        # Manually alter created_at using update (since auto_now_add locks save)
        Booking.objects.filter(id=booking.id).update(
            created_at=timezone.now() - timedelta(hours=25)
        )
        
        # Execute expiry logic
        count = expire_old_bookings()
        self.assertEqual(count, 1)
        
        booking.refresh_from_db()
        self.assertEqual(booking.booking_status, 'EXPIRED')

    def test_payment_verification_workflow(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.customer_token}')
        
        # Create Booking
        booking = Booking.objects.create(
            booking_reference='BK-2026-TESTPAY',
            user=self.customer,
            room=self.room,
            check_in=date(2026, 8, 1),
            check_out=date(2026, 8, 3),
            guests=2,
            total_nights=2,
            total_amount=Decimal('1000.00'),
            booking_status='PENDING_PAYMENT',
            payment_status='NOT_SUBMITTED'
        )
        
        # Upload Payment proof
        # Simulate screenshot file
        import tempfile
        from PIL import Image
        image = Image.new('RGB', (100, 100))
        tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        image.save(tmp_file, 'JPEG')
        tmp_file.seek(0)
        
        with open(tmp_file.name, 'rb') as img_f:
            payload = {
                'booking': str(booking.id),
                'payment_method': str(self.payment_method.id),
                'screenshot': img_f,
                'transaction_id': 'TXN123456',
                'notes': 'Paid via FonePay.'
            }
            response = self.client.post('/api/payments/proofs/', payload, format='multipart')
            
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify status transitions
        booking.refresh_from_db()
        self.assertEqual(booking.booking_status, 'PAYMENT_SUBMITTED')
        self.assertEqual(booking.payment_status, 'VERIFICATION_PENDING')
        
        proof_id = response.data['id']
        
        # Test Admin Approval
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        approve_response = self.client.post(f'/api/payments/proofs/{proof_id}/approve/')
        self.assertEqual(approve_response.status_code, status.HTTP_200_OK)
        
        booking.refresh_from_db()
        self.assertEqual(booking.booking_status, 'CONFIRMED')
        self.assertEqual(booking.payment_status, 'VERIFIED')
        self.assertEqual(booking.reviewed_by, self.admin)
        self.assertIsNotNone(booking.reviewed_at)
