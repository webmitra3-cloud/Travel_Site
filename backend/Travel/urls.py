"""
URL configuration for Travel project.
Configured for cPanel deployment with React SPA catch-all.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from Travel.dashboard_views import AdminDashboardStatsView, CustomerDashboardStatsView
import os

def health_check_view(request):
    return JsonResponse({"status": "healthy"})

urlpatterns = [
    path('admin/', admin.site.urls),
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

# React SPA catch-all: serve index.html for any non-API, non-admin, non-media route
# This enables React Router client-side routing to work on cPanel
REACT_INDEX = os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist', 'index.html')
if os.path.exists(REACT_INDEX):
    from django.views.static import serve as static_serve
    from django.http import HttpResponse

    def serve_react(request):
        with open(REACT_INDEX, 'r') as f:
            return HttpResponse(f.read(), content_type='text/html')

    REACT_DIST = os.path.dirname(REACT_INDEX)
    REACT_ASSETS = os.path.join(REACT_DIST, 'assets')

    urlpatterns += [
        re_path(r'^assets/(?P<path>.*)$', static_serve, {'document_root': REACT_ASSETS}),
        re_path(r'^(?!api/|admin/|media/|static/|assets/).*$', serve_react),
    ]
