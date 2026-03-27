from rest_framework import serializers
from decimal import Decimal
from .models import Payment
import uuid

# Handles payment creation
class PaymentSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()

    item_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    platform_fee = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    txn_ref = serializers.CharField(read_only=True)
    payment_status = serializers.CharField(read_only=True)

    class Meta:
        model = Payment
        fields = ("item_name", "item_price", 
                  "buyer_email", "buyer_phone", 
                  "delivery_address", "payment_method",  
                  "platform_fee", "total_amount", 
                  "txn_ref", "payment_status"
        )
        extra_kwargs = {
            "buyer_email": {"required": True},
            "buyer_phone": {"required": True},
            "delivery_address": {"required": True},
            "payment_method": {"required": True},
        }

    # Return the name of the item from the related invoice
    def get_item_name(self, obj):
        return obj.invoice.item_name if obj.invoice else None

    # Prevent paying an invoice that already has a successful payment
    def validate(self, attrs):

        invoice = self.context.get("invoice")

        # Safety check (context must include invoice)
        if not invoice:
            raise serializers.ValidationError("Invoice context is required")

        # Prevent duplicate successful payment
        if invoice.payments.filter(payment_status="successful").exists():
            raise serializers.ValidationError("This invoice has already been paid.")
        return attrs

    # Create a Payment object with calculated platform_fee and total_amount
    def create(self, validated_data):
        invoice = self.context["invoice"]

        # Example platform fee 
        PLATFORM_PERCENTAGE = Decimal("0.015")

        item_price = invoice.amount

        platform_fee = invoice.amount * PLATFORM_PERCENTAGE
        total_amount = invoice.amount + platform_fee

        payment = Payment.objects.create(
            invoice=invoice,
            txn_ref=f"INV-{uuid.uuid4().hex[:12]}",
            item_price=item_price,
            platform_fee=platform_fee,
            total_amount=total_amount,
            payment_status="pending",  
            **validated_data
        )

        return payment