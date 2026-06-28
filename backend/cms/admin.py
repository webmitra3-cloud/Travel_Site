from django.contrib import admin
from .models import HomepageSlide, Gallery, Testimonial, ContactInformation, RestaurantContent, SpaContent, ContactMessage, SEOPage

@admin.register(HomepageSlide)
class HomepageSlideAdmin(admin.ModelAdmin):
    list_display = ('title', 'subtitle', 'active')
    list_filter = ('active',)
    search_fields = ('title', 'subtitle')

@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_deleted')
    list_filter = ('category', 'is_deleted')
    search_fields = ('title',)

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'rating', 'is_deleted')
    list_filter = ('rating', 'is_deleted')
    search_fields = ('customer_name', 'review')

@admin.register(ContactInformation)
class ContactInformationAdmin(admin.ModelAdmin):
    list_display = ('email', 'phone')

@admin.register(RestaurantContent)
class RestaurantContentAdmin(admin.ModelAdmin):
    list_display = ('title',)

@admin.register(SpaContent)
class SpaContentAdmin(admin.ModelAdmin):
    list_display = ('title',)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at')
    readonly_fields = ('name', 'email', 'phone', 'subject', 'message', 'created_at')
    search_fields = ('name', 'email', 'subject')

@admin.register(SEOPage)
class SEOPageAdmin(admin.ModelAdmin):
    list_display = ('page_name', 'meta_title')
    search_fields = ('page_name', 'meta_title')

from .models import GalleryCategory, HomepageContent, HotelAmenity, AboutPageContent, ExecutiveTeamMember, Facility

@admin.register(GalleryCategory)
class GalleryCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(HomepageContent)
class HomepageContentAdmin(admin.ModelAdmin):
    list_display = ('heritage_title', 'heritage_subtitle')

@admin.register(HotelAmenity)
class HotelAmenityAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon_name')

@admin.register(AboutPageContent)
class AboutPageContentAdmin(admin.ModelAdmin):
    list_display = ('story_title',)

@admin.register(ExecutiveTeamMember)
class ExecutiveTeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'role')

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon_name')
