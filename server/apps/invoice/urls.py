# invoices/urls.py
from django.urls import path
from .views import CreateInvoice, InvoiceDetail

urlpatterns = [
    path("create/", CreateInvoice.as_view(), name="create-invoice"),
    path("detail/<uuid:access_token>/", InvoiceDetail.as_view(), name="invoice-detail"),
]