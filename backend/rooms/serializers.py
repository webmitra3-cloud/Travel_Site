from rest_framework import serializers
from .models import Room, Amenity, RoomImage, Review
from django.db.models import Avg

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = '__all__'


class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ('id', 'image')


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Review
        fields = ('id', 'room', 'user', 'user_name', 'user_email', 'rating', 'comment', 'is_approved', 'created_at')
        read_only_fields = ('id', 'user', 'is_approved', 'created_at')


class RoomSerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)
    gallery_images = RoomImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    amenity_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Room
        fields = (
            'id', 'room_name', 'slug', 'room_type', 'description', 
            'price_per_night', 'capacity', 'total_units', 'cover_image', 
            'amenities', 'gallery_images', 'average_rating', 'reviews',
            'availability_status', 'amenity_ids', 'is_deleted', 'deleted_at', 'created_at'
        )
        read_only_fields = ('id', 'is_deleted', 'deleted_at', 'created_at')

    def get_average_rating(self, obj):
        avg = obj.reviews.filter(is_approved=True).aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 5.0

    def get_reviews(self, obj):
        reviews = obj.reviews.filter(is_approved=True).order_by('-created_at')
        return ReviewSerializer(reviews, many=True).data

    def create(self, validated_data):
        amenity_ids = validated_data.pop('amenity_ids', [])
        room = Room.objects.create(**validated_data)
        if amenity_ids:
            room.amenities.set(amenity_ids)
        return room

    def update(self, instance, validated_data):
        amenity_ids = validated_data.pop('amenity_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if amenity_ids is not None:
            instance.amenities.set(amenity_ids)
        return instance
