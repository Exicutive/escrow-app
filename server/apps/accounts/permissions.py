from rest_framework.permissions import BasePermission

# Allows access only to users with seller role
class IsSeller(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "seller"

# Allows access only to users with buyer role
class IsBuyer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "buyer"