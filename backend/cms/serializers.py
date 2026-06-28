from rest_framework import serializers
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

class HomepageSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageSlide
        fields = '__all__'


class GalleryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryCategory
        fields = '__all__'

class GallerySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Gallery
        fields = '__all__'
        read_only_fields = ('id', 'is_deleted', 'deleted_at')


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'
        read_only_fields = ('id', 'is_deleted', 'deleted_at')


class ContactInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInformation
        fields = '__all__'


class RestaurantContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantContent
        fields = '__all__'


class SpaContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaContent
        fields = '__all__'


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class SEOPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SEOPage
        fields = '__all__'

class HomepageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageContent
        fields = '__all__'

class HotelAmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelAmenity
        fields = '__all__'

class AboutPageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPageContent
        fields = '__all__'

class ExecutiveTeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutiveTeamMember
        fields = '__all__'

class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = '__all__'
