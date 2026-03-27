# payments/models.py

import uuid
from django.db import models
from django.conf import settings
from apps.invoice.models import Invoice
from django.db.models import Q


class Payment(models.Model):
    
    PAYMENT_METHOD_CHOICES = (("card", "Card"), ("bank_transfer", "Bank Transfer"), ("ussd", "USSD"),)

    PAYMENT_STATUS_CHOICES = (("pending", "Pending"), ("successful", "Successful"), ("failed", "Failed"),)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Link payment to invoice
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")

    # Buyer details (collected at checkout)
    buyer_email = models.EmailField()
    buyer_phone = models.CharField(max_length=20)
    delivery_address = models.TextField()
    
    item_price = models.DecimalField(max_digits=12, decimal_places=2)
    # Financials
    platform_fee = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

    # Payment method
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)

    # Interswitch reference
    txn_ref = models.CharField(max_length=255, blank=True, null=True)

    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)

    gateway_reference = models.CharField(max_length=255, blank=True, null=True)
    
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ["-created_at"]

        # enforce database constraint for only one successful payment per invoice
        constraints = [
            models.UniqueConstraint(fields=["invoice"],
                condition=Q(payment_status="successful"), name="unique_successful_payment_per_invoice")]

    def __str__(self):
        return f"Payment for {self.invoice.invoice_id}"