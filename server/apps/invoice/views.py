# invoices/views.py

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Invoice
from .serializers import InvoiceSerializer, InvoiceDetailSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.accounts.permissions import IsSeller, IsBuyer
from django.shortcuts import get_object_or_404

# API endpoint for sellers to create an escrow invoice
class CreateInvoice(generics.CreateAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        invoice = serializer.save()

        return Response(
            {
                "invoice_id": invoice.invoice_id,
                "invoice_link": invoice.invoice_link(),
            },
            status=status.HTTP_201_CREATED,
        )
    
# PUBLIC INVOICE DETAIL VIEW (No Auth Required)
class InvoiceDetail(APIView):
    # EXPLICITLY ALLOW ANYONE (GUESTS) TO VIEW THIS!
    permission_classes = [AllowAny]

    def get(self, request, access_token):
        try:
            invoice = Invoice.objects.select_related(
                "seller", "escrow_period", "delivery_timeframe").prefetch_related("images").get(access_token=access_token)
        except Invoice.DoesNotExist:
            return Response(
                {"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = InvoiceDetailSerializer(invoice)
        return Response(serializer.data)

# PROTECTED INVOICE DETAIL VIEW (If needed for buyer dashboard)
class InvoiceDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]

    def get(self, request, access_token):
        if request.user.role != "buyer":
            return Response(
                {"error": "Only buyers can view invoice details."},
                status=status.HTTP_403_FORBIDDEN)
        
        invoice = get_object_or_404(Invoice, access_token=access_token)

        if invoice.buyer is None:
            if request.user.email.lower() != invoice.buyer_email.lower():
                return Response(
                    {"error": "You are not authorized to view this invoice."},
                    status=status.HTTP_403_FORBIDDEN)
            invoice.buyer = request.user
            invoice.save(update_fields=["buyer"])
        elif invoice.buyer != request.user:
            return Response(
                {"error": "You are not authorized to view this invoice."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = InvoiceDetailSerializer(invoice)
        return Response(serializer.data)