from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils import timezone


class User(AbstractUser):
    ROLES = (
        ("buyer", "Buyer"),
        ("seller", "Seller"),
        ("admin", "Admin"),
    )

    role = models.CharField(max_length=10, choices=ROLES, default="buyer")

    role_changed_by = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="role_changes")

    role_changed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        permissions = [("can_change_user_role", "Can change user roles"),]

    def role_change(self, new_role, admin_user):
        if not admin_user.has_perm("accounts.can_change_user_role"):
            raise ValidationError("Admin doesn't have permission to change role")

        valid_roles = dict(self.ROLES).keys()

        if new_role not in valid_roles:
            raise ValidationError("Invalid role selected.")

        if self.role == new_role:
            raise ValidationError("User already has this role.")

        self.role = new_role
        self.role_changed_by = admin_user
        self.role_changed_at = timezone.now()

        self.save(update_fields=["role", "role_changed_by", "role_changed_at"])