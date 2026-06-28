import uuid
from django.db import models
from Travel.utils import SoftDeleteModel

class HomepageSlide(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='cms/hero/')
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class GalleryCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = 'Gallery Categories'

    def __str__(self):
        return self.name

class Gallery(SoftDeleteModel):
    category = models.ForeignKey(GalleryCategory, on_delete=models.CASCADE, related_name='galleries')
    image = models.ImageField(upload_to='cms/gallery/')
    title = models.CharField(max_length=150)

    class Meta:
        verbose_name_plural = 'Galleries'

    def __str__(self):
        return f"{self.title} ({self.category.name})"


class Testimonial(SoftDeleteModel):
    customer_name = models.CharField(max_length=150)
    review = models.TextField()
    rating = models.PositiveIntegerField(default=5)

    def __str__(self):
        return self.customer_name


class ContactInformation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    address = models.TextField()
    phone = models.CharField(max_length=50)
    email = models.EmailField()
    map_url = models.TextField(blank=True, help_text="Google Maps Embed URL")

    def __str__(self):
        return "Contact Information Settings"


class RestaurantContent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='cms/restaurant/')

    def __str__(self):
        return f"Restaurant Content: {self.title}"


class SpaContent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='cms/spa/')

    def __str__(self):
        return f"Spa Content: {self.title}"


class ContactMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"


class SEOPage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page_name = models.CharField(max_length=100, unique=True, db_index=True, help_text="e.g. home, rooms, about, gallery, contact")
    meta_title = models.CharField(max_length=255)
    meta_description = models.TextField()
    meta_keywords = models.TextField(blank=True, help_text="Comma-separated keywords")
    og_image = models.ImageField(upload_to='cms/seo/', blank=True, null=True)

    def __str__(self):
        return f"SEO Settings for: {self.page_name}"

class HomepageContent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    heritage_subtitle = models.CharField(max_length=200, default="Our Heritage")
    heritage_title = models.CharField(max_length=200, default="A Sanctuary of Soul and Elegance")
    heritage_paragraph_1 = models.TextField()
    heritage_paragraph_2 = models.TextField()
    stat_1_number = models.CharField(max_length=50)
    stat_1_label = models.CharField(max_length=100)
    stat_2_number = models.CharField(max_length=50)
    stat_2_label = models.CharField(max_length=100)
    image_1 = models.ImageField(upload_to='cms/homepage/', null=True, blank=True)
    image_2 = models.ImageField(upload_to='cms/homepage/', null=True, blank=True)

    def __str__(self):
        return "Homepage Content"

class HotelAmenity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, help_text="Lucide icon name (e.g. Compass, Sparkles, Award)")

    class Meta:
        verbose_name_plural = 'Hotel Amenities'

    def __str__(self):
        return self.name

class AboutPageContent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    story_title = models.CharField(max_length=200)
    story_paragraph_1 = models.TextField()
    story_paragraph_2 = models.TextField()
    story_image = models.ImageField(upload_to='cms/about/', null=True, blank=True)
    mission_text = models.TextField()
    vision_text = models.TextField()

    def __str__(self):
        return "About Page Content"

class ExecutiveTeamMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=100)
    bio = models.TextField()
    image = models.ImageField(upload_to='cms/team/')

    def __str__(self):
        return f"{self.name} - {self.role}"

class Facility(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, help_text="Lucide icon name")

    class Meta:
        verbose_name_plural = 'Facilities'

    def __str__(self):
        return self.name

