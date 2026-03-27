from rest_framework import serializers
from apps.invoice.models import Invoice

class BuyerDashboardInvoiceSerializer(serializers.ModelSerializer):
    # Step-based progress for frontend
    order_steps = serializers.SerializerMethodField()
    current_status = serializers.CharField(source='status')
    seller = serializers.CharField(source='seller.username')
    expected_delivery = serializers.DateField(source='expected_delivery_date', format="%B %d, %Y")  # nicely formatted

    class Meta:
        model = Invoice
        fields = [
            'invoice_id',
            'item_name',
            'item_price',
            'current_status',
            'order_steps',
            'seller',
            'expected_delivery'
        ]

    def get_order_steps(self, obj):
        steps_order = ["created", "paid", "shipped", "delivered"]
        current_index = steps_order.index(obj.status)
        steps = []
        for i, step in enumerate(steps_order):
            steps.append({
                "name": step,
                "completed": i <= current_index
            })
        return steps