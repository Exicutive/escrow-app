from django.urls import path
from .views import BuyerDashboardView, BuyerOtherPurchases, ConfirmDelivery

urlpatterns = [
    # Buyer dashboard summary
    path("dashboard/", BuyerDashboardView.as_view(), name="buyer-dashboard"),

    # View all buyer transactions
    path("buyer/purchases/", BuyerOtherPurchases.as_view(), name="buyer-transactions"),

    # Confirm delivery of an item
    path("buyer/confirm-delivery/<str:invoice_id>/", ConfirmDelivery.as_view(), name="confirm-delivery"),
]