from django.db.models import Q
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from .models import Vacancy, Announcement
from .serializers import VacancySerializer, AnnouncementSerializer
from users.views import IsAdminOrManager

class PublicVacancyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoints for vacancies.
    """
    serializer_class = VacancySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Public users can only see published and open vacancies
        queryset = Vacancy.objects.filter(published=True, status='OPEN')

        # Filters
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department__iexact=department)

        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__iexact=location)

        employment_type = self.request.query_params.get('employment_type')
        if employment_type:
            queryset = queryset.filter(employment_type__iexact=employment_type)

        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(job_title__icontains=search) |
                Q(department__icontains=search) |
                Q(description__icontains=search) |
                Q(requirements__icontains=search)
            )

        # Sorting
        ordering = self.request.query_params.get('ordering', 'latest')
        if ordering == 'latest':
            queryset = queryset.order_by('-created_at')
        else:
            queryset = queryset.order_by('created_at')

        return queryset


class AdminVacancyViewSet(viewsets.ModelViewSet):
    """
    Admin endpoints for managing vacancies.
    """
    queryset = Vacancy.objects.all()
    serializer_class = VacancySerializer
    permission_classes = [IsAdminOrManager]

    def get_queryset(self):
        queryset = Vacancy.objects.all()

        # Sorting
        ordering = self.request.query_params.get('ordering', 'latest')
        if ordering == 'latest':
            queryset = queryset.order_by('-created_at')
        else:
            queryset = queryset.order_by('created_at')

        return queryset


class ActiveAnnouncementListView(generics.ListAPIView):
    """
    Public endpoint to get active announcements.
    """
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        open_vacancies = Vacancy.objects.filter(published=True, status='OPEN')
        existing_vacancy_ids = Announcement.objects.filter(
            vacancy__in=open_vacancies
        ).values_list('vacancy_id', flat=True)

        missing_vacancies = open_vacancies.exclude(id__in=existing_vacancy_ids)
        for vacancy in missing_vacancies:
            Announcement.objects.create(
                vacancy=vacancy,
                title=f'We are hiring: {vacancy.job_title}!',
                message=f'Apply now for the position of {vacancy.job_title} in our {vacancy.department} department at {vacancy.location}.',
                active=True,
            )

        # Return announcements where active=True and the associated vacancy is still published and open
        return Announcement.objects.filter(active=True, vacancy__published=True, vacancy__status='OPEN')
