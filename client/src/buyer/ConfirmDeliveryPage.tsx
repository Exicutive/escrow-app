import { useState } from "react";
import { validateConfirmDeliveryPayload } from "../validation";

const ConfirmDeliveryPage = () => {
  const [invoiceId, setInvoiceId] = useState("");
  const [errors, setErrors] = useState<{ invoiceId?: string }>({});
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const result = validateConfirmDeliveryPayload({ invoiceId });
    setErrors(result.errors);

    if (!result.isValid || !result.data) return;

    // Demo only – in the real app we would call POST /apps/buyerdashboard/buyer/confirm-delivery/{invoice_id}/
    setMessage(
      `Delivery confirmation would be sent for ${result.data.invoiceId}. (Demo only, no API call yet.)`,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-purple-600 uppercase mb-1">
            Buyer Action
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Confirm Delivery</h1>
          <p className="text-gray-500 text-sm mt-1">
            Confirm that you&apos;ve received your item so escrow can be released.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Invoice ID
            </label>
            <input
              type="text"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              placeholder="INV-12345678"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${
                errors.invoiceId
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-200 focus:ring-purple-500"
              }`}
            />
            {errors.invoiceId && (
              <p className="mt-1 text-xs text-red-500">{errors.invoiceId}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-xl text-sm sm:text-base transition-colors active:scale-[0.98]"
          >
            Confirm Delivery
          </button>
        </form>

        {message && (
          <p className="mt-4 text-xs text-center text-gray-500">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ConfirmDeliveryPage;
