from django.db import models
import uuid
from django.conf import settings
from django.core.exceptions import ValidationError

# Create your models here.
class EscrowPeriod(models.Model):
    name = models.CharField(max_length=100)

    days = models.PositiveIntegerField()

    is_active = models.BooleanField(default=True)

    craeted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.days} days)"
    

class DeliveryTimeframe(models.Model):
    name = models.CharField(max_length=100)

    min_days = models.PositiveIntegerField()
    max_days = models.PositiveIntegerField()

    is_active = models.BooleanField(default = True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    



# Core escrow invoice model
class Invoice(models.Model):

    STATUS_CHOICES = (("pending", "Pending"), ("created", "Created"), ("funded", "Funded"), ("shipped", "Shipped"),
        ("completed", "Completed"), ("cancelled", "Cancelled"))

    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seller_invoices")
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="buyer_invoices", null=True, blank=True)
    buyer_email = models.EmailField()
    buyer_phone = models.CharField(max_length=20)

    item_name = models.CharField(max_length=255)
    item_description = models.TextField()

    expected_delivery_date = models.DateField(null=True, blank=True)

    amount = models.DecimalField(max_digits=12, decimal_places=2)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="created")

    ORDER_STATUS_CHOICES = (("created", "Created"), ("paid", "Paid"), ("shipped", "Shipped"), ("delivered", "Delivered"),)

    order_status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default="created"  )
    
    # Prevent deletion if invoice exists
    escrow_period = models.ForeignKey(EscrowPeriod, on_delete=models.PROTECT)

    delivery_timeframe = models.ForeignKey(DeliveryTimeframe, on_delete=models.PROTECT)

    invoice_id = models.CharField(max_length=30, unique=True, editable=False)

    access_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    
    # Secure public invoice link

    is_paid = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)



    # For the escrow implementation
    # When buyer confirms delivery
    delivered_at = models.DateTimeField(null=True, blank=True)

    # When escrow money should be released
    escrow_release_date = models.DateTimeField(null=True, blank=True)

    # Whether seller has been paid
    escrow_released = models.BooleanField(default=False)

    escrow_released_at = models.DateTimeField(null=True, blank=True)

    delivery_confirmed = models.BooleanField(default=False)

    # Auto-generate invoice ID if not set
    def save(self, *args, **kwargs):
    
        if not self.invoice_id:
            last_id = Invoice.objects.count() + 1
            self.invoice_id = f"ESC-2026-{str(last_id).zfill(5)}"
        super().save(*args, **kwargs)

    # Returns secure public link for buyer
    def invoice_link(self):
      
        return f"https://127.0.0.1/apps/invoice/detail/{self.access_token}/"

    def __str__(self):
        return self.invoice_id

# Stores images uploaded for invoice item. max 5
class InvoiceImage(models.Model):

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="images")

    image = models.ImageField(upload_to="invoice_items/")

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        
        if self.invoice.images.count() >= 5:
            raise ValidationError("Maximum 5 images")
