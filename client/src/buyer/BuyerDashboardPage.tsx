import { useEffect, useState } from "react";
import { api } from "../helpers/helper";

type Purchase = {
  invoice_id: string;
  item_name: string;
  amount: number;
  order_status: "created" | "paid" | "shipped" | "delivered";
  seller_email?: string;
  expected_delivery_date?: string;
};

type BuyerDashboardResponse = {
  current_purchases: Purchase[];
};

export default function BuyerDashboardPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New states for custom Modals
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    invoiceId: string | null;
  }>({ isOpen: false, invoiceId: null });
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({ isOpen: false, message: "", type: "success" });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data: BuyerDashboardResponse = await api.getBuyerDashboard();
      setPurchases(data.current_purchases || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Opens the stylish confirmation modal instead of window.confirm
  const initiateConfirmDelivery = (invoiceId: string) => {
    setConfirmModal({ isOpen: true, invoiceId });
  };

  // 2. Executes the API call after user clicks "Yes, Confirm"
  const executeConfirmDelivery = async () => {
    if (!confirmModal.invoiceId) return;
    const invoiceId = confirmModal.invoiceId;

    setConfirmModal({ isOpen: false, invoiceId: null });
    setActionLoading(invoiceId);

    try {
      await api.confirmDelivery(invoiceId);
      setNotification({
        isOpen: true,
        message: "Delivery confirmed! Funds are being released to the seller.",
        type: "success",
      });
      await fetchDashboard();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setNotification({ isOpen: true, message: err.message, type: "error" });
      } else {
        setNotification({
          isOpen: true,
          message: "Something went wrong",
          type: "error",
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading dashboard...</div>;

  // 1. Split the data dynamically
  const activePurchases = purchases.filter(
    (p) => p.order_status !== "delivered",
  );
  const completedPurchases = purchases.filter(
    (p) => p.order_status === "delivered",
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Purchases</h1>
        <p className="text-gray-500 mt-1">
          Track your orders and confirm deliveries
        </p>
      </div>

      <div className="space-y-6">
        {activePurchases.length === 0 ? (
          <p className="text-gray-500">No active orders at the moment.</p>
        ) : (
          activePurchases.map((purchase) => (
            <div
              key={purchase.invoice_id}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
            >
              {/* Top Section */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                    📱
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {purchase.item_name}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {purchase.invoice_id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-indigo-600">
                    ₦{Number(purchase.amount).toLocaleString()}
                  </h3>
                  <span className="inline-block mt-1 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
                    {purchase.order_status}
                  </span>
                </div>
              </div>

              {/* Progress Bar (Example Layout) */}
              <div className="mb-6 py-4">
                {/* Keep your existing progress bar implementation here */}
                <div className="h-2 bg-gray-200 rounded-full w-full">
                  <div
                    className={`h-full bg-purple-500 rounded-full ${purchase.order_status === "paid" ? "w-1/2" : purchase.order_status === "shipped" ? "w-3/4" : "w-1/4"}`}
                  ></div>
                </div>
              </div>

              {/* Info Container */}
              <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center text-sm border border-gray-100 mb-6">
                <div>
                  <p className="text-gray-500">Seller</p>
                  <p className="font-semibold text-gray-900">
                    {purchase.seller_email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Expected Delivery</p>
                  <p className="font-semibold text-gray-900">
                    {purchase.expected_delivery_date || "Pending"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => initiateConfirmDelivery(purchase.invoice_id)}
                  disabled={actionLoading === purchase.invoice_id}
                  className="flex-1 bg-gray-900 hover:bg-black  text-white py-3 rounded-xl font-semibold transition"
                >
                  {actionLoading === purchase.invoice_id
                    ? "Confirming..."
                    : "✓ Confirm Delivery"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* COMPLETED ORDERS (COMPACT CARDS) */}
      {completedPurchases.length > 0 && (
        <div className="pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Other Purchases
          </h2>
          <div className="space-y-4">
            {completedPurchases.map((purchase) => (
              <div
                key={purchase.invoice_id}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {purchase.item_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {purchase.invoice_id} • Delivered
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="font-bold text-gray-900 text-lg">
                    ₦{Number(purchase.amount).toLocaleString()}
                  </h3>
                  <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                    ✓ Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ?
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Confirm Delivery
            </h3>
            <p className="text-gray-500 text-sm mb-6 px-2">
              Are you sure you have received this item? This action cannot be
              undone and will release the funds to the seller.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, invoiceId: null })
                }
                className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmDelivery}
                className="flex-1 bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-xl shadow-md transition"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {notification.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold ${notification.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
            >
              {notification.type === "success" ? "✓" : "!"}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {notification.type === "success" ? "Success" : "Action Failed"}
            </h3>
            <p className="text-gray-500 text-sm mb-6">{notification.message}</p>
            <button
              onClick={() =>
                setNotification({ ...notification, isOpen: false })
              }
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-xl shadow-md transition"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
