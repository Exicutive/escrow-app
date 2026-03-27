from django.contrib import admin
from .models import Invoice, EscrowPeriod, DeliveryTimeframe, InvoiceImage


@admin.register(EscrowPeriod)
class EscrowPeriodAdmin(admin.ModelAdmin):
    list_display = ("name", "days", "is_active")
    list_filter = ("is_active",)


@admin.register(DeliveryTimeframe)
class DeliveryTimeframeAdmin(admin.ModelAdmin):
    list_display = ("name", "min_days", "max_days", "is_active")
    list_filter = ("is_active",)


class InvoiceImageInline(admin.TabularInline):
    model = InvoiceImage
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_id", "seller", "amount", "is_paid", "created_at")
    inlines = [InvoiceImageInline]