from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import (
    HomepageSlide,
    Gallery,
    Testimonial,
    ContactInformation,
    RestaurantContent,
    SpaContent,
    ContactMessage,
    SEOPage,
    GalleryCategory,
    HomepageContent,
    HotelAmenity,
    AboutPageContent,
    ExecutiveTeamMember,
    Facility
)
from .serializers import (
    HomepageSlideSerializer,
    GallerySerializer,
    TestimonialSerializer,
    ContactInformationSerializer,
    RestaurantContentSerializer,
    SpaContentSerializer,
    ContactMessageSerializer,
    SEOPageSerializer,
    GalleryCategorySerializer,
    HomepageContentSerializer,
    HotelAmenitySerializer,
    AboutPageContentSerializer,
    ExecutiveTeamMemberSerializer,
    FacilitySerializer
)
from users.views import IsAdminOrManager
from users.models import AuditLog

class ReadOnlyOrAdminMixin:
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrManager()]


class HomepageSlideViewSet(ReadOnlyOrAdminMixin, viewsets.ModelViewSet):
    serializer_class = HomepageSlideSerializer

    def get_queryset(self):
        user = self.request.user
        is_admin = user.is_authenticated and (
            user.role in ['ADMIN', 'MANAGER'] or user.is_staff
        )
        if is_admin:
            return HomepageSlide.objects.all()
        return HomepageSlide.objects.filter(active=True)


class GalleryViewSet(viewsets.ModelViewSet):
    serializer_class = GallerySerializer

    def get_queryset(self):
        is_admin = self.request.user.is_authenticated and (
            self.request.user.role in ['ADMIN', 'MANAGER'] or self.request.user.is_staff
        )
        category = self.request.query_params.get('category')
        
        if is_admin and self.request.query_params.get('include_deleted') == 'true':
            queryset = Gallery.objects.all_with_deleted()
        else:
            queryset = Gallery.objects.all() # default Manager returns alive()
            
        if category:
            queryset = queryset.filter(category__name__iexact=category)
            
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrManager()]

    def perform_destroy(self, instance):
        instance.delete()
        AuditLog.objects.create(
            user=self.request.user,
            action="CMS_GALLERY_DELETE",
            object_type="Gallery",
            object_id=str(instance.id),
            description=f"Soft deleted gallery item: {instance.title}."
        )


class TestimonialViewSet(viewsets.ModelViewSet):
    serializer_class = TestimonialSerializer

    def get_queryset(self):
        is_admin = self.request.user.is_authenticated and (
            self.request.user.role in ['ADMIN', 'MANAGER'] or self.request.user.is_staff
        )
        if is_admin and self.request.query_params.get('include_deleted') == 'true':
            return Testimonial.objects.all_with_deleted()
        return Testimonial.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrManager()]

    def perform_destroy(self, instance):
        instance.delete()
        AuditLog.objects.create(
            user=self.request.user,
            action="CMS_TESTIMONIAL_DELETE",
            object_type="Testimonial",
            object_id=str(instance.id),
            description=f"Soft deleted testimonial by: {instance.customer_name}."
        )


class ContactInformationViewSet(ReadOnlyOrAdminMixin, viewsets.ModelViewSet):
    queryset = ContactInformation.objects.all()
    serializer_class = ContactInformationSerializer


class RestaurantContentViewSet(ReadOnlyOrAdminMixin, viewsets.ModelViewSet):
    queryset = RestaurantContent.objects.all()
    serializer_class = RestaurantContentSerializer


class SpaContentViewSet(ReadOnlyOrAdminMixin, viewsets.ModelViewSet):
    queryset = SpaContent.objects.all()
    serializer_class = SpaContentSerializer


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminOrManager()]


class SEOPageViewSet(viewsets.ModelViewSet):
    queryset = SEOPage.objects.all()
    serializer_class = SEOPageSerializer
    lookup_field = 'page_name'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrManager()]

class GalleryCategoryViewSet(ReadOnlyOrAdminMixin, viewsets.ModelViewSet):
    queryset = GalleryCategory.objects.all()
    serializer_class = GalleryCategorySerializer

class HomepageContentViewSet(ReadOnlyOrAdminMixin, viewsets.ModelViewSet):
    queryset = HomepageContent.objects.all()
    serializer_class = HomepageContentSerializer

class HotelAmenityViewSet(ReadOnlyOrAdminMixin, viewsets.ModelViewSet):
    queryset = HotelAmenity.objects.all()
    serializer_class = HotelAmenitySerializer

class AboutPageContentViewSet(ReadOnlyOrAdminMixin, viewsets.ModelViewSet):
    queryset = AboutPageContent.objects.all()
    serializer_class = AboutPageContentSerializer

class ExecutiveTeamMemberViewSet(ReadOnlyOrAdminMixin, viewsets.ModelViewSet):
    queryset = ExecutiveTeamMember.objects.all()
    serializer_class = ExecutiveTeamMemberSerializer

class FacilityViewSet(ReadOnlyOrAdminMixin, viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer

