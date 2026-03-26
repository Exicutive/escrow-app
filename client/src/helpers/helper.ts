const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = `${BASE_URL}/apps/account`;

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface RegisterData {
  username: string;
  password?: string;
  email?: string;
  role: "buyer" | "seller" | string;
}

export interface InitiatePaymentData {
  buyer_email: string;
  buyer_phone: string;
  delivery_address: string;
  payment_method: string;
}

export interface InitiatePaymentData {
  buyer_email: string;
  buyer_phone: string;
  delivery_address: string;
  payment_method: string;
}

export const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
};

export const getFormHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
};

export const api = {
  login: async (credentials: LoginCredentials) => {
    const res = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      let message = "Login failed";

      try {
        const data = await res.json();
        if (res.status === 400) {
          // Invalid credentials
          message = "Incorrect username or password.";
        } else if (typeof data === "object" && data !== null) {
          if (typeof data.detail === "string") {
            message = data.detail;
          } else {
            const collected = Object.values(data)
              .flat() // handle arrays
              .filter((v) => typeof v === "string") as string[];
            if (collected.length) message = collected.join(" ");
          }
        }
      } catch {
        if (res.status === 400) {
          message = "Incorrect username or password.";
        }
      }

      throw new Error(message);
    }

    return res.json();
  },

  register: async (data: RegisterData) => {
    const res = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let message = "Registration failed. Please try again.";

      try {
        const body = await res.json();
        // 400/403 -> show validation-style messages
        if (res.status === 400 || res.status === 403) {
          if (typeof body === "object" && body !== null) {
            if (typeof body.detail === "string") {
              message = body.detail;
            } else {
              const collected = Object.values(body)
                .flat()
                .filter((v) => typeof v === "string") as string[];
              if (collected.length) message = collected.join(" ");
            }
          }
        }
      } catch {
        // keep default message
      }

      throw new Error(message);
    }

    return res.json();
  },

  getAuthUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth-user/`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  },

  getSellerDashboard: async () => {
    const res = await fetch(`${BASE_URL}/apps/sellerdashboard/dashboard/`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard summary");
    return res.json();
  },

  createInvoice: async (formData: FormData) => {
    const res = await fetch(`${BASE_URL}/apps/invoice/create/`, {
      method: "POST",
      headers: getFormHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("Django Validation Errors:", errorData);
      throw new Error("Failed to create invoice: " + JSON.stringify(errorData));
    }
    return res.json();
  },

  getInvoiceDetail: async (accessToken: string) => {
    const res = await fetch(`${BASE_URL}/apps/invoice/detail/${accessToken}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to load invoice details.");
    return res.json();
  },

  initiatePayment: async (invoiceId: string, payload: InitiatePaymentData) => {
    const res = await fetch(`${BASE_URL}/apps/payment/pay/${invoiceId}/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || "Failed to initiate payment");
    }
    return res.json();
  },

  getPaymentDetails: async (invoiceId: string) => {
    const res = await fetch(`${BASE_URL}/apps/payment/pay/${invoiceId}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to load invoice details.");
    return res.json();
  },

  getBuyerDashboard: async () => {
    const res = await fetch(`${BASE_URL}/apps/buyerdashboard/dashboard/`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch buyer dashboard");
    return res.json();
  },

  confirmDelivery: async (invoiceId: string) => {
    const res = await fetch(`${BASE_URL}/apps/buyerdashboard/buyer/confirm-delivery/${invoiceId}/`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || "Failed to confirm delivery");
    }
    return res.json();
  },

  withdrawFunds: async (payoutDetails: { bank_name: string; account_number: string }) => {
    const res = await fetch(`${BASE_URL}/apps/sellerdashboard/seller/withdraw-funds/`, {
      method: "POST",
      headers: { ...getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payoutDetails),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || "Failed to withdraw funds");
    }
    return res.json();
  }
};