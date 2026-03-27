from rest_framework import serializers
from .models import User

# Return user details
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role",]

# Allows signup as buyer or seller only.
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role",]

    # Validate username strength
    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if " " in value:
            raise serializers.ValidationError("Username cannot contain spaces.")
        return value

    # Validate password strength
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not any(c.islower() for c in value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value

    # Prevent public signup as admin.
    def validate_role(self, value):
        allowed_roles = ["buyer", "seller"]

        if value not in allowed_roles:
            raise serializers.ValidationError("Role must be either buyer or seller.")
        return value

    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            role=validated_data["role"],
        )
        user.set_password(validated_data["password"])
        user.save()
        return user