from django.contrib import admin
from .models import Payment

# Register your models here.

# Admin configuration for Payment model
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = ("invoice_id", "item_name", "buyer_email", "payment_method", "txn_ref", "payment_status", "total_amount", "created_at",)

    list_filter = ("payment_method", "payment_status", "created_at",)

    search_fields = ("buyer_email", "buyer_phone", "txn_ref", "invoice__invoice_id", "invoice__item_name")

    readonly_fields = ("platform_fee", "item_price", "total_amount", "txn_ref", "created_at")

    ordering = ("-created_at",)

    # Show invoice ID
    def invoice_id(self, obj):
        return obj.invoice.invoice_id
    invoice_id.short_description = "Invoice ID"

    # Show the item name from the related invoice
    def item_name(self, obj):
        return obj.invoice.item_name
    item_name.short_description = "Item Name"

    # Prevent editing successful payments
    def has_change_permission(self, request, obj=None):
        if obj and obj.payment_status == "successful":
            return False
        return super().has_change_permission(request, obj)
    
    # Prevent deleting payment records
    def has_delete_permission(self, request, obj=None):
        return False