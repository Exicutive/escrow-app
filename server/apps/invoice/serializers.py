from rest_framework import serializers
from .models import Invoice, InvoiceImage, EscrowPeriod, DeliveryTimeframe

class InvoiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceImage
        fields = ("id", "image", "uploaded_at")
        read_only_fields = ("id", "uploaded_at")

class InvoiceSerializer(serializers.ModelSerializer):
    # Accept a list of uploaded files directly
    images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False)

    escrow_period = serializers.PrimaryKeyRelatedField(
        queryset=EscrowPeriod.objects.filter(is_active=True))
    
    delivery_timeframe = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryTimeframe.objects.filter(is_active=True))

    invoice_link = serializers.SerializerMethodField(read_only=True)
    invoice_id = serializers.CharField(read_only=True)
    seller = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "seller", "buyer_email", "buyer_phone", "item_name",
            "item_description", "amount", "escrow_period", "delivery_timeframe",
            "images", "invoice_id", "invoice_link", "is_paid", "created_at",
        ]
        read_only_fields = ["invoice_id", "invoice_link", "is_paid", "created_at"]

    # Ensure seller is verified and role is correct
    def validate(self, attrs):
        seller = self.context["request"].user
        if seller.role != "seller":
            raise serializers.ValidationError("Only sellers can create invoices")
        return attrs

    # Create invoice and attach uploaded images
    def create(self, validated_data):
        images_files = validated_data.pop("images", [])

        if len(images_files) > 5:
            raise serializers.ValidationError("Maximum 5 images allowed per invoice.")

        seller = self.context["request"].user
        validated_data["seller"] = seller

        invoice = Invoice.objects.create(**validated_data)

        # Attach images
        for f in images_files:
            InvoiceImage.objects.create(invoice=invoice, image=f)

        return invoice

    def get_invoice_link(self, obj):
        return obj.get_invoice_link()
    
class ImageDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceImage
        fields = ["image"]

class InvoiceDetailSerializer(serializers.ModelSerializer):
    seller = serializers.CharField(source="seller.username")
    escrow_days = serializers.IntegerField(source="escrow_period.days")
    delivery_days = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            "item_name", "item_description",
            "amount", "escrow_days",
            "images", "buyer_email",
            "buyer_phone", "delivery_days",
            "seller", 
        ]
        
    def get_images(self, obj):
        return [img.image.url for img in obj.images.all()]
    
    def get_delivery_days(self, obj):
        if obj.delivery_timeframe:
            return f"{obj.delivery_timeframe.min_days} - {obj.delivery_timeframe.max_days} days"
        return None