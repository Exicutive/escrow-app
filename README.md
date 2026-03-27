# Escrow Marketplace MVP

A **Django REST Framework backend** for an escrow-based marketplace where buyers and sellers can transact securely.

The system allows sellers to create invoices, buyers to pay through **Interswitch Web Checkout**, and funds to be held in **escrow until delivery confirmation**.

----

# Features

* Secure invoice links using `access_token`
* Invoice generation for seller transactions
* Payment initiation via **Interswitch Web Checkout**
* Payment verification using **redirect + webhook**
* Escrow holding system after successful payment
* Buyer order progress tracking
* Seller dashboard with transferable funds
* Manual seller withdrawals

---

# How It Works (Step-by-Step)

1. **Seller Registration:** A user creates an account and selects the **"Seller"** role.
2. **Invoice Creation:** The seller creates a new invoice, filling in the item details, price, delivery timeframe, and critically, the **Buyer's Email Address**.
3. **Share Link:** The system generates a unique, secure payment link. The seller sends this link to the buyer.
4. **Buyer Payment:** The buyer clicks the link, views the invoice details, and pays via the Interswitch Web Checkout.
5. **Buyer Registration/Login:** To track the order and confirm delivery, the buyer must sign up or log in to a **"Buyer"** account **using the exact email address the seller entered in the invoice**. 
6. **Escrow & Delivery:** The funds are held in escrow. Once the buyer confirms delivery on their dashboard, the funds are released to the seller's wallet for withdrawal.

### Testing Payments (Interswitch)
Since this is an MVP using a sandbox environment, you can test the payment gateway using Interswitch's official Test Cards.
* **Test Cards Link:** [Interswitch Test Cards Documentation](https://docs.interswitchgroup.com/docs/test-cards)
* **Standard Test OTP:** `123456`
* Use any of the Verve, Mastercard, or Visa test cards provided in the link above to simulate a successful transaction.

---

# Tech Stack

* React
* Python
* Django
* Django REST Framework
* Neon DB (PostgreSQL) (recommended)
* Cloudinary (For Images)
* Interswitch Web Checkout

---

# Installation

Clone the repository:

```
git clone https://github.com/Exicutive/testescrow.git
cd escrow-mvp-backend
```

Create a virtual environment:

```
python -m venv escrowvenv
```

Activate it:

Mac/Linux

```
source venv/bin/activate
```

Windows

```
venv\Scripts\activate
```

Install dependencies:

```
pip install -r requirements.txt
```

Run migrations:

```
python manage.py migrate
```

Start the development server:

```
python manage.py runserver
```

---

# Environment Variables

Create a `.env` file and add the following:

```
SECRET_KEY=your_django_secret_key

INTERSWITCH_MERCHANT_CODE=your_merchant_code
INTERSWITCH_PAY_ITEM_ID=your_pay_item_id

INTERSWITCH_REDIRECT_URL=http://127.0.0.1:8000/apps/payment/response/
```

---

# Payment Flow

Seller → Creates invoice
Buyer → Opens invoice link
Buyer → Pays via Interswitch checkout
Interswitch → Sends webhook to backend
Backend → Confirms payment
Escrow → Funds held until delivery confirmation

---

# Project Structure

```
apps/
 ├── accounts
 ├── buyerdashboard
 ├── escrow
 ├── invoice
 ├── payment
 └── sellerdashboard
```

# API Endpoints (Core)

For detailed information on all available endpoints, required permissions, request body formats, and sample responses, please refer to the full **[API Documentation](server/Documentation.md)**.

# License

MIT