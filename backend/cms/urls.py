from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HomepageSlideViewSet,
    TestimonialViewSet,
    ContactInformationViewSet,
    GalleryViewSet,
    RestaurantContentViewSet,
    SpaContentViewSet,
    ContactMessageViewSet,
    SEOPageViewSet,
    GalleryCategoryViewSet,
    HomepageContentViewSet,
    HotelAmenityViewSet,
    AboutPageContentViewSet,
    ExecutiveTeamMemberViewSet,
    FacilityViewSet
)

router = DefaultRouter()
router.register(r'slides', HomepageSlideViewSet, basename='homepageslide')
router.register(r'testimonials', TestimonialViewSet, basename='testimonial')
router.register(r'contact-info', ContactInformationViewSet, basename='contactinformation')
router.register(r'gallery', GalleryViewSet, basename='gallery')
router.register(r'restaurant', RestaurantContentViewSet, basename='restaurantcontent')
router.register(r'spa', SpaContentViewSet, basename='spacontent')
router.register(r'messages', ContactMessageViewSet, basename='contactmessage')
router.register(r'seo', SEOPageViewSet, basename='seopage')
router.register(r'gallery-categories', GalleryCategoryViewSet, basename='gallerycategory')
router.register(r'homepage-content', HomepageContentViewSet, basename='homepagecontent')
router.register(r'amenities', HotelAmenityViewSet, basename='hotelamenity')
router.register(r'about-content', AboutPageContentViewSet, basename='aboutpagecontent')
router.register(r'team', ExecutiveTeamMemberViewSet, basename='executiveteammember')
router.register(r'facilities', FacilityViewSet, basename='facility')

urlpatterns = [
    path('', include(router.urls)),
]
