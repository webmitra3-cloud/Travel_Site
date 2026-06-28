import uuid
from django.db import models

class Vacancy(models.Model):
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
    )
    
    EMPLOYMENT_CHOICES = (
        ('FULL_TIME', 'Full Time'),
        ('PART_TIME', 'Part Time'),
        ('CONTRACT', 'Contract'),
        ('INTERN', 'Intern'),
        ('REMOTE', 'Remote'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_title = models.CharField(max_length=255)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=50, choices=EMPLOYMENT_CHOICES, default='FULL_TIME')
    vacancies_count = models.IntegerField(default=1)
    salary = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField()  # Job description (rich text / markdown / text)
    requirements = models.TextField()  # Requirements list or text
    benefits = models.TextField(blank=True, null=True)  # Benefits list or text
    deadline = models.DateField()
    attachment = models.FileField(upload_to='vacancies/attachments/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    published = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.published:
            # Create or reactivate announcement
            from .models import Announcement
            announcement, created = Announcement.objects.get_or_create(
                vacancy=self,
                defaults={
                    'title': f'We are hiring: {self.job_title}!',
                    'message': f'Apply now for the position of {self.job_title} in our {self.department} department at {self.location}.',
                    'active': True
                }
            )
            if not created and not announcement.active:
                announcement.active = True
                announcement.save()
        else:
            # If unpublished, deactivate existing active announcements
            from .models import Announcement
            Announcement.objects.filter(vacancy=self, active=True).update(active=False)

    def __str__(self):
        return f"{self.job_title} - {self.department} ({self.status})"

    class Meta:
        verbose_name_plural = "vacancies"
        ordering = ['-created_at']


class Announcement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name='announcements')
    title = models.CharField(max_length=255)
    message = models.TextField()
    active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Announcement: {self.title} (Active: {self.active})"

    class Meta:
        ordering = ['-created_at']
