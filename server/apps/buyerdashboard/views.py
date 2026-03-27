from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsBuyer
from apps.invoice.models import Invoice
from apps.escrow.models import Escrow
from .serializers import BuyerDashboardInvoiceSerializer

from rest_framework import status
from django.utils import timezone



# Create your views here.
class BuyerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]

    def get(self, request):
        # The FIX: Find all invoices where the email matches the logged-in user's email
        # This acts as a bridge to catch all Guest Checkout purchases!
        user_email = request.user.email

        # Fetch the invoices
        user_invoices = Invoice.objects.filter(buyer_email=user_email)

        # Build the response data matching your React component's expected fields
        purchases_data = []
        for invoice in user_invoices:
            purchases_data.append({
                "invoice_id": invoice.invoice_id,
                "item_name": invoice.item_name,
                "amount": str(invoice.amount),
                "order_status": invoice.order_status,
                "seller_email": invoice.seller.email if invoice.seller else "Unknown Seller",
                "expected_delivery_date": invoice.expected_delivery_date.strftime("%B %d, %Y") if invoice.expected_delivery_date else "Pending"
            })

        return Response({
            "current_purchases": purchases_data
        })
    
# Confirm delivery button
class ConfirmDelivery(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]

    def post(self, request, invoice_id):
        try:
            # Look for the invoice using the buyer_email to support Guest Checkouts
            invoice = Invoice.objects.get(invoice_id=invoice_id, buyer_email=request.user.email)
        except Invoice.DoesNotExist:
            return Response(
                {"error": "Invoice not found or you don't have permission."}, status=status.HTTP_404_NOT_FOUND)

        #  BLOCK UNPAID CONFIRMATIONS
        is_paid = invoice.is_paid or invoice.payments.filter(payment_status="successful").exists()
        if not is_paid:
            return Response(
                {"error": "Cannot confirm delivery. This item has not been paid for yet."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent confirming delivery twice
        if invoice.delivery_confirmed:
            return Response(
                {"error": "Delivery already confirmed."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update Invoice status
        invoice.order_status = "delivered"
        invoice.status = "completed" 
        invoice.delivery_confirmed = True
        invoice.delivered_at = timezone.now()
        invoice.save()

        # FIX: Find the EXISTING Escrow record and instantly release it!
        try:
            escrow = Escrow.objects.get(invoice=invoice)
            escrow.release_date = timezone.now()
            escrow.save()
        except Escrow.DoesNotExist:
            # Fallback if somehow it wasn't created during payment
            escrow_days = getattr(invoice.escrow_period, 'days', 0) if invoice.escrow_period else 0
            Escrow.objects.create(
                invoice=invoice,
                amount=invoice.amount,
                escrow_days=escrow_days,
                release_date=timezone.now()
            )

        return Response(
            {
                "message": "Delivery confirmed successfully. Funds released.",
                "invoice_id": invoice.invoice_id,
                "new_status": invoice.order_status
            },
            status=status.HTTP_200_OK
        )

# Other Purchases
class BuyerOtherPurchases(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        buyer = request.user

        invoices = Invoice.objects.filter(buyer=buyer).order_by("-created_at")

        purchases = []

        for invoice in invoices:

            # Purchase info message
            if invoice.status == "created":
                info = "Waiting for payment"

            elif invoice.status == "funded":
                info = "Waiting for seller to ship"

            elif invoice.status == "shipped":
                info = "Item shipped"

            elif invoice.status == "completed":
                if invoice.updated_at:
                    delivered_date = invoice.updated_at.strftime("%b %d, %Y")
                    info = f"Delivered on {delivered_date}"
                else:
                    info = "Delivered"

            else:
                info = invoice.status

            purchases.append({
                "item_name": invoice.item_name,
                "invoice_id": invoice.invoice_id,
                "purchase_amount": invoice.amount,
                "status_badge": invoice.status,
                "info": info
            })

        return Response({
            "other_purchases": purchases
        })