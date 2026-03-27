from django.urls import path
from .views import PayInvoice, PaymentResponse, InterswitchWebhook

urlpatterns = [
    path("pay/<uuid:access_token>/", PayInvoice.as_view(), name="pay-invoice"),
    path("response/", PaymentResponse.as_view(), name="payment-response"),
    path("webhook/interswitch/", InterswitchWebhook.as_view(), name="interswitch-webhook"),
]