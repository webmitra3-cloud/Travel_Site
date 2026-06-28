import uuid
from django.db import models
from django.conf import settings
from Travel.utils import SoftDeleteModel

class Amenity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=100, blank=True, help_text="CSS class or icon name")

    class Meta:
        verbose_name_plural = 'Amenities'

    def __str__(self):
        return self.name


class Room(SoftDeleteModel):
    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('MAINTENANCE', 'Maintenance'),
        ('INACTIVE', 'Inactive'),
    )

    room_name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255, db_index=True)
    room_type = models.CharField(max_length=100)
    description = models.TextField()
    price_per_night = models.DecimalField(max_digits=12, decimal_places=2)
    capacity = models.PositiveIntegerField()
    total_units = models.PositiveIntegerField(default=1)
    cover_image = models.ImageField(upload_to='rooms/covers/', blank=True, null=True)
    amenities = models.ManyToManyField(Amenity, related_name='rooms', blank=True)
    availability_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.room_name


class RoomImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, related_name='gallery_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='rooms/gallery/')
    alt_text = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.room.room_name} Image"


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, related_name='reviews', on_delete=models.CASCADE, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='reviews', on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField()
    is_approved = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.room.room_name} by {self.user.email} ({self.rating} stars)"
