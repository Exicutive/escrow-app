import React, { useEffect, useState } from "react";
import { api } from "../helpers/helper";

// 1. Define the exact structure of what the backend returns
interface InvoiceDetails {
  invoice_id: string;
  created_at: string;
  item_name: string;
  item_description: string;
  item_images?: string[];
  escrow_duration: string;
  delivery_timeframe: string;
  buyer_email: string;
  item_price: number | string;
  platform_fee: number | string;
  total_amount: number | string;
  is_paid: boolean;
}

export default function InitiatePaymentPage() {
  // 2. Replace <any> with <InvoiceDetails>
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    buyer_phone: "",
    delivery_address: "",
    payment_method: "card"
  });

  useEffect(() => {
    // 3. Wrap logic in an async function to fix the "synchronous setState" and cascading render errors
    const fetchInvoiceDetails = async () => {
      const params = new URLSearchParams(window.location.search);
      const invoiceId = params.get("id");
      
      if (!invoiceId) {
        setError("Invalid or missing payment link.");
        setLoading(false);
        return;
      }

      try {
        const data = await api.getPaymentDetails(invoiceId);
        setInvoice(data);
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    try {
      const params = new URLSearchParams(window.location.search);
      const invoiceId = params.get("id");
      if (!invoiceId) return;

      const payload = {
        buyer_email: invoice.buyer_email,
        buyer_phone: formData.buyer_phone,
        delivery_address: formData.delivery_address,
        payment_method: formData.payment_method
      };

      const response = await api.initiatePayment(invoiceId, payload);

      if (response.checkout_url && response.checkout_data) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = response.checkout_url; 

        for (const key in response.checkout_data) {
          const hiddenField = document.createElement("input");
          hiddenField.type = "hidden";
          hiddenField.name = key;
          hiddenField.value = response.checkout_data[key];
          form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
      }
    // 4. Safely type error as unknown instead of any
    } catch (err: unknown) {
      alert("Failed to initiate: " + (err as Error).message);
    }
  };

  if (loading) return <div className="p-10 text-center text-lg">Loading transaction details...</div>;
  if (error) return <div className="p-10 text-center text-red-500 text-lg">{error}</div>;
  if (invoice?.is_paid) return <div className="p-10 text-center text-green-600 text-2xl font-bold">This invoice has already been paid!</div>;
  if (!invoice) return null;

  return (
    // Changed to 'flex justify-center' so the single form is centered on the screen
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex justify-center gap-8">

      {/* RIGHT SIDE: Form details below remain identical */}
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xl flex flex-col justify-center">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
          <p className="text-gray-500 mt-2 text-sm">Your funds will be held securely in escrow until you confirm delivery of the item.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input 
              type="text" 
              name="buyer_phone"
              required
              value={formData.buyer_phone}
              onChange={handleChange}
              placeholder="e.g. 08012345678"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Address</label>
            <textarea 
              name="delivery_address"
              required
              value={formData.delivery_address}
              onChange={handleChange}
              rows={3}
              placeholder="Enter full delivery address"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
            <select 
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            >
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="ussd">USSD</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl text-lg transition duration-200 shadow-md active:scale-[0.98]"
          >
            Pay ₦{Number(invoice.total_amount).toLocaleString()} Securely
          </button>
          
          <div className="flex justify-center items-center gap-3 text-gray-400 text-xs mt-5">
             <span>🔒 Secured by Interswitch</span>
             <span>|</span>
             <span>100% Escrow Protection</span>
          </div>
        </form>
      </div>

    </div>
  );
}
