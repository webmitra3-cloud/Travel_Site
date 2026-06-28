from rest_framework import serializers
from .models import Vacancy, Announcement

class VacancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacancy
        fields = '__all__'


class AnnouncementSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='vacancy.job_title', read_only=True)
    deadline = serializers.DateField(source='vacancy.deadline', read_only=True)
    attachment = serializers.FileField(source='vacancy.attachment', read_only=True)

    class Meta:
        model = Announcement
        fields = ['id', 'vacancy', 'title', 'message', 'active', 'job_title', 'deadline', 'attachment', 'created_at', 'updated_at']
