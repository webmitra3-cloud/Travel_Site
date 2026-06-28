import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.graphics.shapes import Drawing, Rect, String

def generate_booking_voucher_pdf(booking):
    """
    Generate a styled PDF voucher for a confirmed booking.
    Returns the PDF bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom luxury theme styles
    title_style = ParagraphStyle(
        'VoucherTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=30,
        textColor=colors.HexColor('#111827'),  # Charcoal
        spaceAfter=5
    )
    
    subtitle_style = ParagraphStyle(
        'VoucherSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#6B7280'),  # Muted Gray
        spaceAfter=20
    )
    
    h2_style = ParagraphStyle(
        'VoucherH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#D4AF37'),  # Gold
        spaceBefore=15,
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'VoucherBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#374151')
    )

    story = []
    
    # Header Title
    story.append(Paragraph("BOOKING", title_style))
    story.append(Paragraph("Luxury Stays. Exceptional Experiences.", subtitle_style))
    
    # Gold Horizontal Divider
    divider = Drawing(530, 3)
    divider.add(Rect(0, 0, 530, 3, fillColor=colors.HexColor('#D4AF37'), strokeColor=None))
    story.append(divider)
    story.append(Spacer(1, 20))
    
    story.append(Paragraph("CONFIRMED RESERVATION VOUCHER", h2_style))
    
    # Table of Booking Specifics
    data = [
        [Paragraph("<b>Booking Reference</b>", body_style), Paragraph(booking.booking_reference, body_style)],
        [Paragraph("<b>Guest Name</b>", body_style), Paragraph(booking.user.full_name or booking.user.email, body_style)],
        [Paragraph("<b>Room Name</b>", body_style), Paragraph(booking.room.room_name, body_style)],
        [Paragraph("<b>Room Type</b>", body_style), Paragraph(booking.room.room_type, body_style)],
        [Paragraph("<b>Check-In</b>", body_style), Paragraph(str(booking.check_in), body_style)],
        [Paragraph("<b>Check-Out</b>", body_style), Paragraph(str(booking.check_out), body_style)],
        [Paragraph("<b>Total Nights</b>", body_style), Paragraph(str(booking.total_nights), body_style)],
        [Paragraph("<b>Guests</b>", body_style), Paragraph(str(booking.guests), body_style)],
        [Paragraph("<b>Total Amount</b>", body_style), Paragraph(f"${booking.total_amount}", body_style)],
        [Paragraph("<b>Payment Status</b>", body_style), Paragraph("VERIFIED & CONFIRMED", body_style)],
    ]
    
    t = Table(data, colWidths=[150, 380])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FAFAFA')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#D4AF37')),
    ]))
    story.append(t)
    story.append(Spacer(1, 25))
    
    # Verification details and Vector drawing for QR representation
    story.append(Paragraph("Verification Code & Security", h2_style))
    
    qr_drawing = Drawing(100, 100)
    # Black QR outline
    qr_drawing.add(Rect(0, 0, 100, 100, fillColor=colors.HexColor('#111827'), strokeColor=colors.HexColor('#D4AF37'), strokeWidth=2))
    # Standard QR finder corners
    qr_drawing.add(Rect(8, 68, 24, 24, fillColor=colors.white, strokeColor=colors.HexColor('#D4AF37'), strokeWidth=2))
    qr_drawing.add(Rect(68, 68, 24, 24, fillColor=colors.white, strokeColor=colors.HexColor('#D4AF37'), strokeWidth=2))
    qr_drawing.add(Rect(8, 8, 24, 24, fillColor=colors.white, strokeColor=colors.HexColor('#D4AF37'), strokeWidth=2))
    
    # Internal pixels indicators
    qr_drawing.add(Rect(14, 74, 12, 12, fillColor=colors.HexColor('#111827'), strokeColor=None))
    qr_drawing.add(Rect(74, 74, 12, 12, fillColor=colors.HexColor('#111827'), strokeColor=None))
    qr_drawing.add(Rect(14, 14, 12, 12, fillColor=colors.HexColor('#111827'), strokeColor=None))
    
    # Visual hash pattern inside
    qr_drawing.add(Rect(44, 44, 12, 12, fillColor=colors.HexColor('#D4AF37'), strokeColor=None))
    qr_drawing.add(Rect(44, 68, 12, 12, fillColor=colors.white, strokeColor=None))
    qr_drawing.add(Rect(68, 44, 12, 12, fillColor=colors.white, strokeColor=None))
    
    story.append(qr_drawing)
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"Verification Ref: <b>{booking.booking_reference}</b>", body_style))
    story.append(Paragraph("Please display this voucher on your device or present a printed copy upon your arrival.", subtitle_style))
    
    doc.build(story)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
