from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentMethodViewSet, PaymentProofViewSet

router = DefaultRouter()
router.register(r'methods', PaymentMethodViewSet, basename='paymentmethod')
router.register(r'proofs', PaymentProofViewSet, basename='paymentproof')

urlpatterns = [
    path('', include(router.urls)),
]
