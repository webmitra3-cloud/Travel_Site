from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicVacancyViewSet, AdminVacancyViewSet, ActiveAnnouncementListView

router = DefaultRouter()
router.register('vacancies', PublicVacancyViewSet, basename='public-vacancies')
router.register('admin/vacancies', AdminVacancyViewSet, basename='admin-vacancies')

urlpatterns = [
    path('announcements/active/', ActiveAnnouncementListView.as_view(), name='active-announcements'),
    path('', include(router.urls)),
]
