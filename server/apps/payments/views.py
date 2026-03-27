from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse # <-- Add this import
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.accounts.permissions import IsBuyer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from apps.invoice.models import Invoice
from .serializers import PaymentSerializer
from .models import Payment
from django.conf import settings
from .utils import interswitch_signature, interswitch_ip, mark_payment_success, mark_payment_failed

# Handles payment page for an invoice
class PayInvoice(APIView):
    # ALLOW ANYONE with the link to access this view (Guest Checkout)
    permission_classes = [AllowAny]
    PLATFORM_PERCENTAGE = Decimal("0.015")  

    def get(self, request, access_token):
        # Just grab the invoice using the secure token
        invoice = get_object_or_404(Invoice, access_token=access_token)

        item_price = invoice.amount
        platform_fee = invoice.amount * self.PLATFORM_PERCENTAGE
        total_amount = invoice.amount + platform_fee
        is_paid = invoice.is_paid or invoice.payments.filter(payment_status="successful").exists()

        # 1. SMART IMAGE EXTRACTION (GET UP TO 5 IMAGES)
        image_urls = []
        try:
            # Check direct field
            if getattr(invoice, 'item_image', None):
                image_urls.append(request.build_absolute_uri(invoice.item_image.url))
            
            # Check related images array (since React sent multiple files)
            if hasattr(invoice, 'images') and invoice.images.exists():
                for img in invoice.images.all()[:5]: # Enforce max 5 images
                    if getattr(img, 'image', None):
                        image_urls.append(request.build_absolute_uri(img.image.url))
                    elif getattr(img, 'file', None):
                        image_urls.append(request.build_absolute_uri(img.file.url))
        except Exception:
            pass

        return Response({
            "invoice_id": invoice.invoice_id, 
            "item_name": invoice.item_name,
            "item_description": getattr(invoice, 'item_description', 'No description provided'),
            "item_price": item_price, 
            "platform_fee": platform_fee,
            "total_amount": total_amount, 
            "currency": "NGN",
            "buyer_email": invoice.buyer_email,
            "escrow_duration": invoice.escrow_period.name if getattr(invoice, 'escrow_period', None) else "N/A",
            "delivery_timeframe": invoice.delivery_timeframe.name if getattr(invoice, 'delivery_timeframe', None) else "N/A",
            "created_at": invoice.created_at.strftime("%d/%m/%Y, %H:%M:%S") if invoice.created_at else "",
            "item_images": image_urls,
            "is_paid": is_paid, 
            "payment_methods": ["card", "bank_transfer", "ussd"]
        })

    def post(self, request, access_token):
        # Just grab the invoice using the secure token
        invoice = get_object_or_404(Invoice, access_token=access_token)

        if invoice.status == "cancelled":
            return Response({"error": "This invoice has been cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        if invoice.is_paid or invoice.payments.filter(payment_status="successful").exists():
            return Response({"error": "This invoice has already been paid."}, status=status.HTTP_400_BAD_REQUEST)

        pending_payment = invoice.payments.filter(payment_status="pending").first()

        if pending_payment:
            checkout_data = {
                "merchant_code": settings.INTERSWITCH_MERCHANT_CODE,
                "pay_item_id": settings.INTERSWITCH_PAY_ITEM_ID,
                "site_redirect_url": settings.REDIRECT_URL,
                "txn_ref": pending_payment.txn_ref,
                "amount": int(pending_payment.total_amount * 100),
                "currency": 566,
            }
            return Response({
                "payment": PaymentSerializer(pending_payment).data,
                "checkout_data": checkout_data,
                "checkout_url": settings.INTERSWITCH_WEBPAY_URL
            })
            
        serializer = PaymentSerializer(data=request.data, context={"invoice": invoice})

        if serializer.is_valid():
            payment = serializer.save()
            checkout_data = {
                "merchant_code": settings.INTERSWITCH_MERCHANT_CODE,
                "pay_item_id": settings.INTERSWITCH_PAY_ITEM_ID,
                "site_redirect_url": settings.REDIRECT_URL,
                "txn_ref": payment.txn_ref,
                "amount": int(payment.total_amount * 100),
                "currency": 566,
            }
            return Response({
                "payment": PaymentSerializer(payment).data,
                "checkout_data": checkout_data,
                "checkout_url": settings.INTERSWITCH_WEBPAY_URL
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PaymentResponse(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return self.process_response(request)

    def post(self, request):
        return self.process_response(request)

    def process_response(self, request):
        txn_ref = request.data.get("txn_ref") or request.data.get("txnref") or request.GET.get("txn_ref") or request.GET.get("txnref")
        resp = request.data.get("resp") or request.GET.get("resp")
        pay_ref = request.data.get("pay_ref") or request.data.get("payRef") or request.GET.get("pay_ref") or request.GET.get("payRef")

        if not txn_ref:
            return self.render_html("Payment Failed", "Transaction reference is missing. Please contact support.", False)

        try:
            payment = Payment.objects.get(txn_ref=txn_ref)
        except Payment.DoesNotExist:
            return self.render_html("Payment Failed", "Payment record not found.", False)

        # 1. Already paid
        if payment.payment_status == "successful":
            return self.render_html("Payment Successful", "This invoice has already been paid.", True, payment.invoice.invoice_id)

        # 2. Newly paid
        if resp == "00":
            invoice = mark_payment_success(payment, pay_ref=pay_ref)
            return self.render_html("Payment Successful", "Your funds have been securely placed in escrow.", True, invoice.invoice_id)

        # 3. Failed payment
        mark_payment_failed(payment, pay_ref=pay_ref)
        return self.render_html("Payment Failed", "Your payment was declined by the provider.", False)

    # Added HTML UI directly generated by Django
    def render_html(self, title, message, is_success, invoice_id=None):
        color = "green" if is_success else "red"
        icon = "✓" if is_success else "✗"
        invoice_html = f"<p class='text-gray-600 mt-4 text-sm'>Invoice ID: <span class='font-mono font-bold'>{invoice_id}</span></p>" if invoice_id else ""
        
        dashboard_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/buyer/dashboard"

        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center max-w-md w-full mx-4">
                <div class="w-20 h-20 bg-{color}-100 text-{color}-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-6 font-bold">
                    {icon}
                </div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
                <p class="text-gray-600 text-lg">{message}</p>
                {invoice_html}
                <div class="mt-8">
                    <a href="{dashboard_url}" class="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow">
                        Continue to Dashboard
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        return HttpResponse(html)

class InterswitchWebhook(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        if not interswitch_signature(request):
            return Response({"error": "Invalid webhook signature"}, status=status.HTTP_403_FORBIDDEN)
        
        if not interswitch_ip(request):
            return Response({"error": "Unauthorized IP"}, status=403)
        
        txn_ref = request.data.get("txn_ref")
        resp = request.data.get("resp")
        pay_ref = request.data.get("pay_ref")

        if not txn_ref:
            return Response({"error": "Missing transaction reference"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(txn_ref=txn_ref)
        except Payment.DoesNotExist:
             return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

        if resp == "00":
            mark_payment_success(payment, pay_ref=pay_ref)
            return Response({"message": "Payment processed successfully"})

        mark_payment_failed(payment, pay_ref=pay_ref)
        return Response({"message": "Payment failed logged"})