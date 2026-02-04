# SecureTrade Escrow

### A secure escrow payment platform that enables buyers and sellers to transact online with confidence


## Overview

**SecureTrade Escrow** is a trust-building platform designed to solve the fundamental challenge in online gadget sales: **mutual distrust between buyers and sellers**. 

By holding funds securely until delivery is confirmed, we eliminate fraud risk for both parties and enable seamless online transactions.


## Problem Statement

In online gadget sales (phones, laptops, consoles, etc.), two critical trust issues exist:

### Buyers' Fear
- Being scammed after making payment
- Receiving fake or damaged products
- No recourse for disputes

### Sellers' Fear
- Fake "Pay on Delivery" orders
- Buyers refusing to pay after delivery
- Time and logistics wasted

### This lack of trust results in:
- Lost sales opportunities
- High transaction cancellation rates
- Increased fraud incidents
- Poor customer experience

## Solution

Our intelligent escrow system creates a **win-win situation** for both parties:
A. Seller Creates Invoice
B. Buyer Pays via Interswitch
C. Funds Held in Escrow
D. Seller Ships Item
E. Buyer Confirms Receipt
F. Funds Released to Seller

**No more risk, no more fear – just smooth, secure transactions!**

## Features


- Business registration and verification
- Create escrow invoices with item details
- Upload item images
- Track escrow transaction status 
- Mark items as shipped with tracking details
- Secure wallet system
- Withdraw funds to bank account
- Complete transaction history



<details open>
<summary><b>For Buyers (Customers)</b></summary>

<br>

- Simple registration (Email/Phone)
- Secure payment via Interswitch
  - Card payments
  - Bank transfers
  - USSD
- View invoice and payment status
- Confirm delivery
- Raise disputes when necessary

</details>

<details open>
<summary><b>For Admins</b></summary>

<br>

- Monitor all transactions
- Access reports 
- Manage user accounts

</details>

<details open>
<summary><b>System Features</b></summary>

<br>

- Automated escrow holding logic
- Auto-release mechanism (if buyer doesn't respond)
- Secure webhook integration with Interswitch
- Comprehensive audit logging
- Fraud detection and prevention


## 🛠 Tech Stack


**Frontend**
- React

**Backend**
- Node.js / FastAPI
- RESTful API
- JWT Authentication

**Database**
- PostgreSQL
- Transaction Management

**Infrastructure**
- AWS Hosting
- Redis Queue System
- Docker (Optional)


**Payment & APIs**
- Interswitch API
- Webhook Integration
- Payout System


**Security:**
- Signature validation using HMAC-SHA512
- IP whitelist verification
- Duplicate transaction prevention


## 🗺 Roadmap

### MVP - Phase 1 (Current)

**Core Escrow Platform**


**Authentication & Users**
- [x] User registration system
- [x] Role-based access

**Transaction Management**
- [x] Invoice creation
- [x] Interswitch payment integration
- [x] Escrow holding logic
- [x] Auto-release mechanism

**Operations**
- [x] Delivery confirmation
- [x] Seller wallet system
- [x] Bank payout integration


