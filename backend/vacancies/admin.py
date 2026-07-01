from django.contrib import admin
from .models import Vacancy, Announcement

@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('job_title', 'department', 'location', 'employment_type', 'deadline', 'status', 'published')
    list_filter = ('status', 'published', 'employment_type', 'department')
    search_fields = ('job_title', 'department', 'location', 'description', 'requirements')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'vacancy', 'active', 'created_at')
    list_filter = ('active', 'created_at')
    search_fields = ('title', 'message', 'vacancy__job_title')
    readonly_fields = ('created_at', 'updated_at')
