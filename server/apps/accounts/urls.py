from django.urls import path
from .views import RegisterView, AuthUser
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    # Register new user
    path("register/", RegisterView.as_view(), name="register"),

    # Login (returns auth token)
    path("login/", obtain_auth_token, name="login"),

    # Get authenticated user details
    path("auth-user/", AuthUser.as_view(), name="auth-user"),
]