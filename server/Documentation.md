# API Documentation

## Authentication
Most endpoints require authentication using Django REST Framework's Token Authentication. Include the token in the `Authorization` header:
```
Authorization: Token <your_token_here>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
**Endpoint:** `POST /apps/account/register/`  
**Permissions:** None (public)  
**Description:** Register a new user as either buyer or seller.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "buyer" | "seller"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "role": "buyer" | "seller"
}
```

**Validation:**
- Role must be either "buyer" or "seller"
- Username and email must be unique

### 1.2 Login
**Endpoint:** `POST /apps/account/login/`  
**Permissions:** None (public)  
**Description:** Authenticate user and get auth token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "token": "string"
}
```

### 1.3 Get Authenticated User Details
**Endpoint:** `GET /apps/account/auth-user/`  
**Permissions:** Authenticated user  
**Description:** Get details of the currently authenticated user.

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "role": "buyer" | "seller" | "admin"
}
```

---

## 2. Buyer Dashboard Endpoints

### 2.1 Get Buyer Dashboard Summary
**Endpoint:** `GET /apps/buyerdashboard/dashboard/`  
**Permissions:** Authenticated buyer  
**Description:** Get buyer's current purchases with progress tracking.

**Response (200 OK):**
```json
{
  "current_purchases": [
    {
      "invoice_id": "string",
      "item_name": "string",
      "item_price": 1000.00,
      "current_status": "created" | "paid" | "shipped" | "delivered",
      "order_steps": [
        {"name": "created", "completed": true},
        {"name": "paid", "completed": false},
        {"name": "shipped", "completed": false},
        {"name": "delivered", "completed": false}
      ],
      "seller": "string",
      "expected_delivery": "January 15, 2024"
    }
  ]
}
```

### 2.2 Get All Buyer Purchases
**Endpoint:** `GET /apps/buyerdashboard/buyer/purchases/`  
**Permissions:** Authenticated user  
**Description:** Get all purchases for the authenticated buyer.

**Response (200 OK):**
```json
{
  "other_purchases": [
    {
      "item_name": "string",
      "invoice_id": "string",
      "purchase_amount": 1000.00,
      "status_badge": "created" | "funded" | "shipped" | "completed",
      "info": "string"
    }
  ]
}
```

### 2.3 Confirm Delivery
**Endpoint:** `POST /apps/buyerdashboard/buyer/confirm-delivery/{invoice_id}/`  
**Permissions:** Authenticated buyer  
**Description:** Confirm delivery of an item and initiate escrow release.

**Response (200 OK):**
```json
{
  "message": "Delivery confirmed successfully.",
  "invoice_id": "string",
  "new_status": "delivered",
  "escrow_release_date": "2024-01-20T10:00:00Z"
}
```

**Error Responses:**
- 404: Invoice not found
- 400: Delivery already confirmed or cannot be confirmed at current stage

---

## 3. Invoice Endpoints

### 3.1 Create Invoice
**Endpoint:** `POST /apps/invoice/create/`  
**Permissions:** Authenticated seller  
**Description:** Create a new escrow invoice.

**Request Body:**
```json
{
  "buyer_email": "string",
  "buyer_phone": "string",
  "item_name": "string",
  "item_description": "string",
  "amount": 1000.00,
  "escrow_period": 1,
  "delivery_timeframe": 1,
  "images": ["file1.jpg", "file2.jpg"]  // Optional, max 5 images
}
```

**Response (201 Created):**
```json
{
  "invoice_id": "string",
  "invoice_link": "string"
}
```

### 3.2 Get Invoice Details
**Endpoint:** `GET /apps/invoice/detail/{access_token}/`  
**Permissions:** None (public)  
**Description:** Get public invoice details by access token.

**Response (200 OK):**
```json
{
  "item_name": "string",
  "item_description": "string",
  "amount": 1000.00,
  "escrow_days": 7,
  "images": ["url1", "url2"],
  "buyer_email": "string",
  "buyer_phone": "string",
  "delivery_days": "3 - 5 days",
  "seller": "string"
}
```

---

## 4. Payment Endpoints

### 4.1 Get Payment Details
**Endpoint:** `GET /apps/payment/pay/{access_token}/`  
**Permissions:** Authenticated buyer  
**Description:** Get payment details and fees for an invoice.

**Response (200 OK):**
```json
{
  "invoice_id": "string",
  "item_name": "string",
  "item_price": 1000.00,
  "platform_fee": 15.00,
  "total_amount": 1015.00,
  "currency": "NGN",
  "is_paid": false,
  "payment_methods": ["card", "bank_transfer", "ussd"]
}
```

### 4.2 Initiate Payment
**Endpoint:** `POST /apps/payment/pay/{access_token}/`  
**Permissions:** Authenticated buyer  
**Description:** Create a payment and get checkout data.

**Request Body:**
```json
{
  "buyer_email": "string",
  "buyer_phone": "string",
  "delivery_address": "string",
  "payment_method": "card" | "bank_transfer" | "ussd"
}
```

**Response (201 Created):**
```json
{
  "payment": {
    "item_name": "string",
    "item_price": 1000.00,
    "buyer_email": "string",
    "buyer_phone": "string",
    "delivery_address": "string",
    "payment_method": "string",
    "platform_fee": 15.00,
    "total_amount": 1015.00,
    "txn_ref": "string",
    "payment_status": "pending"
  },
  "checkout_data": {
    "merchant_code": "string",
    "pay_item_id": "string",
    "site_redirect_url": "string",
    "txn_ref": "string",
    "amount": 101500,
    "currency": 566
  },
  "checkout_url": "string"
}
```

### 4.3 Payment Response Handler
**Endpoint:** `GET /apps/payment/response/`  
**Permissions:** None  
**Description:** Handle redirect from payment gateway.

**Query Parameters:**
- `txn_ref`: Transaction reference
- `resp`: Response code
- `pay_ref`: Payment reference

**Response (200 OK):**
```json
{
  "message": "Payment successful" | "Payment failed",
  "invoice_id": "string"  // Only on success
}
```

### 4.4 Payment Webhook
**Endpoint:** `POST /apps/payment/webhook/interswitch/`  
**Permissions:** None (webhook)  
**Description:** Receive payment notifications from Interswitch.

**Request Body:**
```json
{
  "txn_ref": "string",
  "resp": "string",
  "pay_ref": "string"
}
```

---

## 5. Seller Dashboard Endpoints

### 5.1 Get Seller Dashboard Summary
**Endpoint:** `GET /apps/sellerdashboard/dashboard/`  
**Permissions:** Authenticated seller  
**Description:** Get seller's dashboard summary.

**Response (200 OK):**
```json
{
  "total_transferable_funds": 5000.00,
  "pending_transactions_count": 3,
  "completed_transactions_this_month": 12,
  "recent_transactions": [
    {
      "id": 1,
      "item_name": "string",
      "amount": 1000.00,
      "status": "created",
      "status_badge": "warning",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 5.2 Withdraw Funds
**Endpoint:** `POST /apps/sellerdashboard/seller/withdraw-funds/`  
**Permissions:** Authenticated seller  
**Description:** Withdraw all available escrow funds.

**Response (200 OK):**
```json
{
  "message": "Withdrawal request successful.",
  "total_released": 5000.00,
  "escrows_released": ["INV-123", "INV-456"]
}
```

### 5.3 Get All Seller Transactions
**Endpoint:** `GET /apps/sellerdashboard/seller/transactions/`  
**Permissions:** Authenticated seller  
**Description:** Get paginated list of all seller transactions.

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10)

**Response (200 OK):**
```json
{
  "count": 50,
  "next": "http://example.com?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "item_name": "string",
      "amount": 1000.00,
      "status": "created",
      "status_badge": "warning",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in the following format:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error