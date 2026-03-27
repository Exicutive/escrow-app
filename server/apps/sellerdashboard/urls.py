# dashboard/urls.py

from django.urls import path
from .views import (SellerDashboard, ViewAllTransactions, WithdrawFunds)

urlpatterns = [

    # Seller Dashboard Summary
    path("dashboard/", SellerDashboard.as_view(), name="seller-dashboard"),
    
    # seller withdrawal fund
    path("seller/withdraw-funds/", WithdrawFunds.as_view(), name="withdraw-funds"),

    # View All Transactions 
    path("seller/transactions/", ViewAllTransactions.as_view(), name="seller-transactions"),
]