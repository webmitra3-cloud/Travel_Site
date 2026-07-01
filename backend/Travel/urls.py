"""
URL configuration for Travel project.
Configured for cPanel deployment with React SPA catch-all.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from Travel.dashboard_views import AdminDashboardStatsView, CustomerDashboardStatsView

admin.site.site_header = "Regal Rivulet Administration"
admin.site.site_title = "Regal Rivulet Admin"
admin.site.index_title = "Hotel Operations Dashboard"

def health_check_view(request):
    return JsonResponse({"status": "healthy"})

def api_root_view(request):
    return JsonResponse({
        "name": "Regal Rivulet API",
        "status": "running",
        "health": "/api/health/",
        "docs": "/api/docs/",
    })

urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('django-admin/', admin.site.urls),
    path('api/health/', health_check_view, name='health-check'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/dashboard/admin/', AdminDashboardStatsView.as_view(), name='admin-dashboard'),
    path('api/dashboard/customer/', CustomerDashboardStatsView.as_view(), name='customer-dashboard'),
    path('api/users/', include('users.urls')),
    path('api/rooms/', include('rooms.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/cms/', include('cms.urls')),
    path('api/', include('vacancies.urls')),
]

# Always serve media files (needed for cPanel where there's no separate Nginx)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
