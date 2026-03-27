import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  SellerDashboard,
  CreateInvoicePage,
  SellerTransactionsPage,
  SellerWithdrawPage,
} from "./seller";

import type { DemoInvoice } from "./seller";

import { LoginPage, RegisterPage, ProfilePage } from "./auth";

import {
  BuyerDashboardPage,
  ConfirmDeliveryPage,
} from "./buyer";

import { InvoiceDetailPage } from "./invoice";

import {
  PaymentDetailsPage,
  InitiatePaymentPage,
  PaymentResultPage,
} from "./payments";

import { api } from "./helpers/helper";
import type { CreateInvoicePayload } from "./seller/CreateInvoicePage";

// Get role from storage
const getRole = () => localStorage.getItem("role");

// Protect routes
function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) {
  const role = getRole();

  if (!role) return <Navigate to="/login" replace />;

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LoginRoute() {
  const navigate = useNavigate();

  const handleLoginSuccess = (role: string) => {
    // Save role
    localStorage.setItem("role", role);

    if (role === "seller") {
      navigate("/seller/dashboard");
    } else if (role === "buyer") {
      navigate("/buyer/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onNavigateToRegister={() => navigate("/register")}
    />
  );
}

function RegisterRoute() {
  const navigate = useNavigate();

  return (
    <RegisterPage
      onRegisterSuccess={() => navigate("/login")}
      onNavigateToLogin={() => navigate("/login")}
    />
  );
}

function SellerDashboardRoute() {
  const navigate = useNavigate();

  return (
    <SellerDashboard
      onCreateInvoice={() => navigate("/seller/invoices/new")}
      onWithdrawFunds={() => navigate("/seller/withdraw")}
    />
  );
}

function CreateInvoiceRoute() {
  const navigate = useNavigate();

  const handleCreateInvoice = async (
    payload: CreateInvoicePayload 
  ): Promise<string> => {
    try {
      const formData = new FormData();

      formData.append("item_name", payload.itemName);
      formData.append("item_description", payload.description);

      const numericAmount = payload.amount.replace(/[^\d.]/g, "") || "0";
      formData.append("amount", numericAmount);

      const escrowMap: Record<string, string> = {
        "1 day after delivery": "1",
        "3 days after delivery": "2",
        "7 days after delivery": "3",
        "14 days after delivery": "4",
        "30 days after delivery": "5",
      };

      const deliveryMap: Record<string, string> = {
        "Same day": "1",
        "1-2 days": "2",
        "3-5 days": "3",
        "1-2 weeks": "4",
        "2-4 weeks": "5",
      };

      formData.append("escrow_period", escrowMap[payload.escrowPeriod] || "3");
      formData.append(
        "delivery_timeframe",
        deliveryMap[payload.deliveryTimeframe] || "3",
      );

      formData.append("buyer_email", payload.buyerEmail);

      if (payload.buyerPhone) {
        formData.append("buyer_phone", payload.buyerPhone);
      }

      payload.images.forEach((img: File) => formData.append("images", img));

      const response = await api.createInvoice(formData);

      const urlParts = response.invoice_link.split("/").filter(Boolean);
      const accessToken = urlParts[urlParts.length - 1];

      // FIX: Changed from /payment/initiate to /invoice
      const invoiceUrl = `${window.location.origin}/invoice?id=${accessToken}`;

      return invoiceUrl;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create invoice");
    }
  };

  return (
    <CreateInvoicePage
      onCancel={() => navigate("/seller/dashboard")}
      onCreateInvoice={handleCreateInvoice}
    />
  );
}

function InvoiceSuccessRoute() {
  // const navigate = useNavigate();
  const location = useLocation() as { state?: { invoice?: DemoInvoice } };

  const invoice = location.state?.invoice;

  if (!invoice) {
    return <Navigate to="/seller/dashboard" replace />;
  }

}

function App() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<RegisterRoute />} />

      {/* Profile */}
      <Route path="/account/profile" element={<ProfilePage />} />

      {/* SELLER ROUTES */}
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute allowedRole="seller">
            <SellerDashboardRoute />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/invoices/new"
        element={
          <ProtectedRoute allowedRole="seller">
            <CreateInvoiceRoute />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/invoices/success"
        element={
          <ProtectedRoute allowedRole="seller">
            <InvoiceSuccessRoute />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/transactions"
        element={
          <ProtectedRoute allowedRole="seller">
            <SellerTransactionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/withdraw"
        element={
          <ProtectedRoute allowedRole="seller">
            <SellerWithdrawPage />
          </ProtectedRoute>
        }
      />

      {/* BUYER ROUTES */}
      <Route
        path="/buyer/dashboard"
        element={
          <ProtectedRoute allowedRole="buyer">
            <BuyerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buyer/confirm-delivery"
        element={
          <ProtectedRoute allowedRole="buyer">
            <ConfirmDeliveryPage />
          </ProtectedRoute>
        }
      />

      {/* PUBLIC */}
      <Route path="/invoice" element={<InvoiceDetailPage />} />

      {/* PAYMENTS */}
      <Route path="/payment/details" element={<PaymentDetailsPage />} />
      <Route path="/payment/initiate" element={<InitiatePaymentPage />} />
      <Route path="/payment/response" element={<PaymentResultPage />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
