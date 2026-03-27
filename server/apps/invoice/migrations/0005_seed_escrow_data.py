from django.db import migrations

def seed_data(apps, schema_editor):
    # Use apps.get_model instead of direct imports in migrations!
    EscrowPeriod = apps.get_model('invoice', 'EscrowPeriod')
    DeliveryTimeframe = apps.get_model('invoice', 'DeliveryTimeframe')

    escrow_data = [
        ('1 day after delivery', 1),
        ('3 days after delivery', 3),
        ('7 days after delivery', 7),
        ('14 days after delivery', 14),
        ('30 days after delivery', 30),
    ]
    for name, days in escrow_data:
        EscrowPeriod.objects.get_or_create(name=name, defaults={'days': days})

    delivery_data = [
        ('Same day', 0, 1),
        ('1-2 days', 1, 2),
        ('3-5 days', 3, 5),
        ('1-2 weeks', 7, 14),
        ('2-4 weeks', 14, 28),
    ]
    for name, min_d, max_d in delivery_data:
        DeliveryTimeframe.objects.get_or_create(name=name, defaults={'min_days': min_d, 'max_days': max_d})


class Migration(migrations.Migration):

    dependencies = [
        # This will automatically have your previous migration listed here
        ('invoice', '0004_alter_invoice_buyer'), 
    ]

    operations = [
        migrations.RunPython(seed_data),
    ]