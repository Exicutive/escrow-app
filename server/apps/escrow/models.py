from django.db import models
from django.utils import timezone
from apps.invoice.models import Invoice

# Create your models here.

class Escrow(models.Model):
 
    invoice = models.OneToOneField(Invoice, on_delete=models.CASCADE, related_name="escrow")

    amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Amount being held in escrow")

    escrow_days = models.PositiveIntegerField(
        help_text="Number of days funds should be held after delivery"
    )

    release_date = models.DateTimeField(null=True, blank=True)

    released = models.BooleanField(default=False)

    released_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    # Calculate when escrow should release
    def calculate_release_date(self, delivered_at):
        return delivered_at + timezone.timedelta(days=self.escrow_days)

    def __str__(self):
        return f"Escrow for {self.invoice.invoice_id}"