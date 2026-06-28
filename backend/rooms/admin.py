from django.contrib import admin
from .models import Room, Amenity, RoomImage, Review

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_name', 'room_type', 'price_per_night', 'capacity', 'total_units', 'availability_status', 'is_deleted')
    search_fields = ('room_name', 'description')
    list_filter = ('room_type', 'availability_status', 'is_deleted')
    prepopulated_fields = {'slug': ('room_name',)}

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(RoomImage)
class RoomImageAdmin(admin.ModelAdmin):
    list_display = ('room', 'image')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('room', 'user', 'rating', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_approved')
    actions = ['approve_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Approve selected guest reviews"
