import hmac
import hashlib
from django.conf import settings
from django.utils import timezone
from apps.escrow.models import Escrow

# Verify that webhook request came from Interswitch
def interswitch_signature(request):
    signature = request.headers.get("X-Interswitch-Signature")

    if not signature:
        return False

    body = request.body

    expected_signature = hmac.new(
        settings.INTERSWITCH_WEBHOOK_SECRET.encode(),
        body, hashlib.sha256).hexdigest()

    return hmac.compare_digest(signature, expected_signature)


def interswitch_ip(request):

    ip = request.META.get("REMOTE_ADDR")

    return ip in settings.INTERSWITCH_WEBHOOK_IPS


# Marks payment as successful and updates related invoice.
def mark_payment_success(payment, pay_ref=None):
    if payment.payment_status == "successful":
        return payment.invoice

    payment.payment_status = "successful"

    if hasattr(payment, "gateway_reference"):
        payment.gateway_reference = pay_ref

    if hasattr(payment, "paid_at"):
        payment.paid_at = timezone.now()

    payment.save()

    invoice = payment.invoice
    invoice.status = "funded"
    invoice.order_status = "paid"
    invoice.is_paid = True
    invoice.save()

    Escrow.objects.get_or_create(
        invoice=invoice,
        defaults={
            "amount": payment.item_price,
            "escrow_days": invoice.escrow_period.days,
            "release_date": None,
        }
    )

    return invoice

# Marks payment as failed
def mark_payment_failed(payment, pay_ref=None):
    payment.payment_status = "failed"

    if hasattr(payment, "gateway_reference"):
        payment.gateway_reference = pay_ref

    payment.save()
    return payment