import logging
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)

def send_html_email(subject, html_content, to_email, pdf_attachment_content=None, pdf_filename="booking_voucher.pdf"):
    """
    Utility function to send HTML emails with optional PDF attachment.
    """
    text_content = strip_tags(html_content)
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@booking-luxury.com')
    
    email = EmailMultiAlternatives(
        subject,
        text_content,
        from_email,
        [to_email]
    )
    email.attach_alternative(html_content, "text/html")
    
    if pdf_attachment_content:
        email.attach(pdf_filename, pdf_attachment_content, "application/pdf")
        
    try:
        email.send()
        logger.info(f"Email sent successfully to {to_email} with subject: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def get_luxury_email_wrapper(content):
    """
    Wrapper for email HTML layout with Gold (#D4AF37) and Charcoal (#111827) colors.
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
                background-color: #f4f4f5;
                margin: 0;
                padding: 0;
                color: #1f2937;
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border: 1px solid #e4e4e7;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background-color: #111827;
                color: #d4af37;
                padding: 30px;
                text-align: center;
                border-bottom: 3px solid #d4af37;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
                letter-spacing: 2px;
                text-transform: uppercase;
            }}
            .content {{
                padding: 30px;
                line-height: 1.6;
            }}
            .footer {{
                background-color: #f9fafb;
                color: #6b7280;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                border-top: 1px solid #e5e7eb;
            }}
            .gold-btn {{
                display: inline-block;
                padding: 12px 24px;
                background-color: #d4af37;
                color: #111827 !important;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                text-transform: uppercase;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>BOOKING</h1>
                <p style="margin: 5px 0 0; color: #a1a1aa; font-style: italic;">Luxury Stays. Exceptional Experiences.</p>
            </div>
            <div class="content">
                {content}
            </div>
            <div class="footer">
                <p>&copy; 2026 Regal Rivulet Retreat Hotel Singapore. All rights reserved.</p>
                <p>10 Bayfront Avenue, Singapore 018956</p>
            </div>
        </div>
    </body>
    </html>
    """


def send_booking_created_email(booking):
    subject = f"Booking Received: {booking.booking_reference}"
    html_content = get_luxury_email_wrapper(f"""
        <h2>Dear {booking.user.full_name or 'Valued Guest'},</h2>
        <p>Thank you for choosing <strong>BOOKING</strong>. We have received your reservation request and it is currently held under reference: <strong>{booking.booking_reference}</strong>.</p>
        
        <table style="width:100%; border-collapse:collapse; margin: 20px 0; border: 1px solid #e4e4e7;">
            <tr style="background:#f9fafb;"><th style="padding:10px; text-align:left; border: 1px solid #e4e4e7;">Room</th><td style="padding:10px; border: 1px solid #e4e4e7;">{booking.room.room_name}</td></tr>
            <tr><th style="padding:10px; text-align:left; border: 1px solid #e4e4e7;">Check-In</th><td style="padding:10px; border: 1px solid #e4e4e7;">{booking.check_in}</td></tr>
            <tr style="background:#f9fafb;"><th style="padding:10px; text-align:left; border: 1px solid #e4e4e7;">Check-Out</th><td style="padding:10px; border: 1px solid #e4e4e7;">{booking.check_out}</td></tr>
            <tr><th style="padding:10px; text-align:left; border: 1px solid #e4e4e7;">Total Amount</th><td style="padding:10px; font-weight:bold; color:#d4af37; border: 1px solid #e4e4e7;">${booking.total_amount}</td></tr>
        </table>

        <p><strong>Action Required:</strong> To secure and confirm your booking, please submit payment proof within 24 hours. Follow the link below to select your payment method (eSewa, Khalti, FonePay, or Bank Transfer) and upload your payment screenshot.</p>
        <p style="text-align:center;">
            <a href="http://localhost:5173/dashboard/bookings/{booking.id}" class="gold-btn">Submit Payment Proof</a>
        </p>
        <p>If you have any questions, please contact our support desk.</p>
    """)
    return send_html_email(subject, html_content, booking.user.email)


def send_payment_submitted_email(booking):
    # Send to Customer
    subject_cust = f"Payment Verification Pending: {booking.booking_reference}"
    html_cust = get_luxury_email_wrapper(f"""
        <h2>Dear {booking.user.full_name or 'Valued Guest'},</h2>
        <p>Thank you for submitting your payment proof for reservation <strong>{booking.booking_reference}</strong>.</p>
        <p>Our administrator is currently verifying the payment transaction. This manual process typically takes between 1-3 hours.</p>
        <p>We will notify you immediately once the booking status is updated to <strong>CONFIRMED</strong>.</p>
    """)
    send_html_email(subject_cust, html_cust, booking.user.email)
    
    # Send to Admin notification
    logger.info(f"Payment proof submitted for {booking.booking_reference}. Awaiting Admin manual review.")


def send_payment_approved_email(booking, pdf_content=None):
    subject = f"Booking CONFIRMED: {booking.booking_reference}"
    html_content = get_luxury_email_wrapper(f"""
        <h2>Dear {booking.user.full_name or 'Valued Guest'},</h2>
        <p>We are delighted to inform you that your payment for booking <strong>{booking.booking_reference}</strong> has been verified and approved!</p>
        <p>Your reservation status is now updated to <strong>CONFIRMED</strong>.</p>
        
        <div style="background-color:#f0fdf4; border: 1px solid #bbf7d0; color:#15803d; padding:15px; border-radius:4px; margin:20px 0;">
            <strong>Status: CONFIRMED</strong><br>
            Please present the attached booking voucher upon check-in at the hotel.
        </div>

        <table style="width:100%; border-collapse:collapse; margin: 20px 0; border: 1px solid #e4e4e7;">
            <tr style="background:#f9fafb;"><th style="padding:10px; text-align:left; border: 1px solid #e4e4e7;">Room</th><td style="padding:10px; border: 1px solid #e4e4e7;">{booking.room.room_name}</td></tr>
            <tr><th style="padding:10px; text-align:left; border: 1px solid #e4e4e7;">Check-In</th><td style="padding:10px; border: 1px solid #e4e4e7;">{booking.check_in}</td></tr>
            <tr style="background:#f9fafb;"><th style="padding:10px; text-align:left; border: 1px solid #e4e4e7;">Check-Out</th><td style="padding:10px; border: 1px solid #e4e4e7;">{booking.check_out}</td></tr>
        </table>
        
        <p>We look forward to welcoming you for an exceptional luxury experience.</p>
    """)
    return send_html_email(subject, html_content, booking.user.email, pdf_attachment_content=pdf_content)


def send_payment_rejected_email(booking, reason):
    subject = f"Payment Rejected - Re-submission Required: {booking.booking_reference}"
    html_content = get_luxury_email_wrapper(f"""
        <h2>Dear {booking.user.full_name or 'Valued Guest'},</h2>
        <p>We were unable to verify the payment proof submitted for booking <strong>{booking.booking_reference}</strong>.</p>
        
        <div style="background-color:#fef2f2; border: 1px solid #fecaca; color:#b91c1c; padding:15px; border-radius:4px; margin:20px 0;">
            <strong>Rejection Reason: {reason}</strong>
        </div>

        <p>Your booking status remains <strong>PENDING_PAYMENT</strong>. Please ensure the amount matches, the transaction ID is correct, the screenshot is readable, and try re-submitting your payment details.</p>
        
        <p style="text-align:center;">
            <a href="http://localhost:5173/dashboard/bookings/{booking.id}" class="gold-btn">Re-submit Payment Proof</a>
        </p>
        
        <p>If you believe this is an error, please reach out directly with your transaction receipt.</p>
    """)
    return send_html_email(subject, html_content, booking.user.email)
