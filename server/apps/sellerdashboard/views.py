from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsSeller
from django.db.models import Sum
from apps.invoice.models import Invoice
from apps.payments.models import Payment
from django.utils import timezone
from .serializers import RecentTransactionSerializer
from rest_framework.generics import ListAPIView
from .pagination import TransactionPagination
from apps.escrow.models import Escrow


# Seller Dashboard Summary View
class SellerDashboard(APIView):

    permission_classes = [IsAuthenticated, IsSeller]

    def get(self, request):
        user = request.user

        # Get invoices that belong to this seller
        seller_invoices = Invoice.objects.filter(seller=user).select_related()

        # Transferable funds:
        transferable_payments = Payment.objects.filter(invoice__in=seller_invoices, payment_status="successful",
            invoice__status="completed")

        # Ensures the seller sees only funds they can actually withdraw.
        escrows_ready = Escrow.objects.filter(invoice__seller=user, released=False, release_date__lte=timezone.now())
        
        total_transferable = escrows_ready.aggregate(total=Sum("amount"))["total"] or 0

        # Pending Transactions

        pending_transactions_count = seller_invoices.exclude(status__in=["completed", "cancelled"]).count()

        # Completed Transactions This Month
     
        now = timezone.now()

        # First day of current month
        first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        completed_this_month = seller_invoices.filter(status="completed", updated_at__gte=first_day_of_month).count()
        
        # Recent Transactions 

        recent_invoices = seller_invoices.order_by("-created_at")[:5]

        recent_tx_data = []
        for inv in recent_invoices:
            # Try to grab the payment info if they filled the form
            successful_payment = inv.payments.filter(payment_status="successful").first()
            
            # Fetch address safely from Invoice or fallback to Payment model
            address = getattr(inv, 'delivery_address', None)
            if not address and successful_payment:
                address = getattr(successful_payment, 'delivery_address', None)
                
            # Fetch phone safely from Invoice or fallback to Payment model
            phone = getattr(inv, 'buyer_phone', None)
            if not phone and successful_payment:
                phone = getattr(successful_payment, 'buyer_phone', None)

            recent_tx_data.append({
                "id": inv.invoice_id,
                "name": inv.item_name,
                "amount": f"₦{inv.amount:,.2f}",
                "status": inv.status.upper() if inv.status else "PENDING",
                "time": inv.created_at.strftime("%I:%M %p • %d %b %Y"),
                "icon": "📦",
                "iconBg": "bg-purple-100",
                "buyer_email": inv.buyer_email,
                "buyer_phone": phone or "Not provided yet",
                "delivery_address": address or "Not provided yet"
            })

        return Response({
            "total_transferable_funds": total_transferable,
            "pending_transactions_count": pending_transactions_count,
            "completed_transactions_this_month": completed_this_month,
            "recent_transactions": recent_tx_data
        })

# Allows seller to withdraw all escrow funds that are ready for release manually
class WithdrawFunds(APIView):
    permission_classes = [IsAuthenticated, IsSeller]

    def post(self, request):
        seller = request.user
        
        # GET BANK DETAILS FROM REQUEST
        bank_name = request.data.get("bank_name")
        account_number = request.data.get("account_number")

        if not bank_name or not account_number:
            return Response(
                {"error": "Bank name and account number are required."},
                status=status.HTTP_400_BAD_REQUEST)

        # Get all Escrows ready for withdrawal
        ready_escrows = Escrow.objects.filter(
            invoice__seller=seller, released=False, release_date__lte=timezone.now())

        if not ready_escrows.exists():
            return Response(
                {"message": "No funds available for withdrawal at this time."},
                status=status.HTTP_200_OK)

        # Calculate total amount available
        total_amount = sum([e.amount for e in ready_escrows])

        # Mark them as released
        for escrow in ready_escrows:
            escrow.released = True
            escrow.released_at = timezone.now()
            escrow.save()

        # In a real app, you would trigger your Bank Transfer API here using bank_name & account_number
        
        return Response({
            "message": f"Withdrawal processing to {bank_name} ({account_number}).",
            "total_released": total_amount,
            "escrows_released": [e.invoice.invoice_id for e in ready_escrows]
        }, status=status.HTTP_200_OK)


# View all seller transactions with pagination
class ViewAllTransactions(ListAPIView):

    serializer_class = RecentTransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TransactionPagination

    # Return only invoices belonging to the seller logged in
    def get_queryset(self):
        seller = self.request.user
        return Invoice.objects.filter(seller=seller).order_by("-created_at")