from rest_framework import serializers
from apps.invoice.models import Invoice

# Serializer for seller dashboard recent transactions
class RecentTransactionSerializer(serializers.ModelSerializer):
    status_badge = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = ["id", "item_name", "amount", "status", "status_badge", "created_at",]

    # Helps frontend render colors easily
    def get_status_badge(self, obj):

        badge_map = {"created": "warning", "funded": "info",
            "shipped": "primary", "completed": "success",
            "cancelled": "danger"}

        return badge_map.get(obj.status, "secondary")