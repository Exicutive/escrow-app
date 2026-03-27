# users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Custom Admin panel for User model
@admin.register(User)
class CustomUserAdmin(UserAdmin):

    list_display = ("username", "email", "role",  "is_active", "is_staff",)
    list_filter = ("role", "is_staff", "is_active",)

    search_fields = ("username", "email")
    ordering = ("username",)

    fieldsets = UserAdmin.fieldsets + (
        (
            "Escrow Platform Fields",
            {
                "fields": ("role", "role_changed_by", "role_changed_at",)
            },
        ),
    )

    readonly_fields = ("role_changed_by", "role_changed_at",)