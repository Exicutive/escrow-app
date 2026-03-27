from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from apps.accounts.models import User
from .models import Invoice, EscrowPeriod, DeliveryTimeframe, InvoiceImage
from django.core.files.uploadedfile import SimpleUploadedFile

from io import BytesIO
from PIL import Image


def create_test_image(filename="test.png"):
    # Create a 1x1 white PNG image in memory
    img_io = BytesIO()
    image = Image.new("RGB", (1, 1), color="white")
    image.save(img_io, format="PNG")
    img_io.seek(0)
    return SimpleUploadedFile(filename, img_io.read(), content_type="image/png")

class InvoiceAPITestCase(APITestCase):
    def setUp(self):
        # Verified seller
        self.seller = User.objects.create_user(
            username="seller1", email="seller@example.com",
            password="password123", role="seller", kyc_status="approved"
        )
        # Unverified seller
        self.unverified_seller = User.objects.create_user(
            username="seller2", email="seller2@example.com",
            password="password123", role="seller", kyc_status="pending"
        )
        # Buyer
        self.buyer = User.objects.create_user(
            username="buyer1", email="buyer@example.com",
            password="password123", role="buyer"
        )
        # Admin options
        self.escrow_period = EscrowPeriod.objects.create(name="3 Days", days=3)
        self.delivery_timeframe = DeliveryTimeframe.objects.create(
            name="1-2 Days", min_days=1, max_days=2
        )
        self.url = reverse("create-invoice")

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    # Verified seller can create invoice with 1 image
    def test_invoice_creation_success(self):
        self.authenticate(self.seller)
        payload = {
            "buyer_email": "buyer@example.com",
            "buyer_phone": "+2348012345678",
            "item_name": "MacBook Pro",
            "item_description": "16-inch 2023",
            "amount": "350000",
            "escrow_period": self.escrow_period.id,
            "delivery_timeframe": self.delivery_timeframe.id,
        }

        # Single image test
        files = [create_test_image("test.png")]

        response = self.client.post(
            self.url, data={**payload, "images": files}, format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        invoice = Invoice.objects.first()
        self.assertEqual(invoice.images.count(), 1)
        self.assertEqual(invoice.seller, self.seller)

    # Cannot upload more than 5 images
    def test_invoice_max_images_limit(self):
        self.authenticate(self.seller)
        payload = {
            "buyer_email": "buyer@example.com",
            "buyer_phone": "+2348012345678",
            "item_name": "MacBook Pro",
            "item_description": "16-inch 2023",
            "amount": "350000",
            "escrow_period": self.escrow_period.id,
            "delivery_timeframe": self.delivery_timeframe.id,
        }

        # Max images test
        files = [create_test_image(f"test{i}.png") for i in range(6)]
        response = self.client.post(
            self.url, data={**payload, "images": files}, format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Maximum 5 images allowed per invoice", str(response.data))