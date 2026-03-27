import { useEffect, useState } from "react";
import { api } from "../helpers/helper";

interface SellerDashboardProps {
  onCreateInvoice: () => void;
  onWithdrawFunds: () => void
}

// 1. Define exactly what a transaction looks like
interface Transaction {
  id: string;
  name: string;
  amount: string;
  status: string;
  time: string;
  icon?: string;
  iconBg?: string;
  buyer_email?: string;
  buyer_phone?: string;
  delivery_address?: string;
}

// 2. Update the DashboardData to use the Transaction array instead of any[]
interface DashboardData {
  total_transferable_funds: number;
  pending_transactions_count: number;
  completed_transactions_this_month: number;
  recent_transactions?: Transaction[]; 
}

// Fallback styling for different backend statuses
const getStatusBadge = (status: string) => {
  const s = status?.toUpperCase();
  if (s === "COMPLETED" || s === "DELIVERED") return "bg-emerald-100 text-emerald-700";
  if (s === "FUNDED" || s === "PAID") return "bg-purple-100 text-purple-700";
  if (s === "SHIPPED") return "bg-violet-100 text-violet-700";
  return "bg-orange-100 text-orange-600"; // PENDING / CREATED
};

const SellerDashboard = ({ onCreateInvoice, onWithdrawFunds }: SellerDashboardProps) => {
  const [username, setUsername] = useState("Loading...");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  // 2. Add state for the selected transaction modal
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const user = await api.getAuthUser();
        setUsername(user.username);
        
        const data = await api.getSellerDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchDashboard();
  }, []);

  const formatCurrency = (val: number) => {
    return `₦${Number(val || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-md flex-shrink-0 uppercase">
            {username ? username.substring(0, 2) : "TG"}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Seller Dashboard
            </p>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              Welcome back,{" "}
              <span className="text-purple-600">{username}</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Transferable Fund Card */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#100825] via-[#1b0f3a] to-[#2a134f] p-6 sm:p-8 text-white shadow-[0_30px_120px_rgba(76,29,149,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]" />
          <div className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -top-20 -left-8 h-40 w-40 rounded-full bg-indigo-400/30 blur-2xl" />

          <div className="relative">
            {/* Label */}
            <div className="flex items-center gap-1.5 mb-4 text-sm font-medium text-white/70">
              <span>Transferable Fund</span>
              <svg
                className="h-4 w-4 text-emerald-300 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Amount */}
            <p className="mb-1 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {dashboardData ? formatCurrency(dashboardData.total_transferable_funds) : "₦0.00"}
            </p>
            <p className="mb-6 text-xs text-white/60 sm:text-sm">
              Last updated a few seconds ago
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onCreateInvoice}
                className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/95 py-3 px-5 text-sm font-semibold text-purple-700 shadow-lg shadow-purple-900/20 transition-all duration-150 hover:bg-white active:scale-[0.98] sm:text-base"
              >
                <span className="mr-1.5">📄</span> Create Invoice
              </button>
              <button
                onClick={onWithdrawFunds}
                className="flex-1 rounded-xl border border-amber-200/40 bg-gradient-to-r from-amber-300 via-orange-300 to-rose-400 py-3 px-5 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-500/30 transition-all duration-150 hover:brightness-105 active:scale-[0.98] sm:text-base"
              >
                <span className="mr-1.5">💸</span> Withdraw Funds
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Quick Access
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Pending */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 sm:p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-shadow duration-200 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-xl">{dashboardData?.pending_transactions_count || 0}</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">
                Pending Transactions
              </p>
            </div>

            {/* Completed */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 sm:p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-shadow duration-200 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-xl">{dashboardData?.completed_transactions_this_month || 0}</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">
                Completed This Month
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Recent Transactions
            </h2>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-semibold transition-colors flex items-center gap-1">
              View All <span className="text-base leading-none">→</span>
            </button>
          </div>

          <div className="space-y-1">
            {/* Display Real Data or empty state */}
            {!dashboardData?.recent_transactions || dashboardData.recent_transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No recent transactions found.
              </div>
            ) : (
              dashboardData.recent_transactions.map((tx: Transaction, index: number) => (
                <div
                  key={tx.id}
                  // 3. Make it clickable!
                  onClick={() => setSelectedTx(tx)}
                  className={`flex items-center gap-3 sm:gap-4 py-3.5 ${
                    index !== dashboardData.recent_transactions!.length - 1 ? "border-b border-gray-50" : ""
                  } hover:bg-gray-50/70 -mx-2 px-2 rounded-xl transition-colors duration-150 cursor-pointer`}
                >
                  {/* Icon */}
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                    {tx.icon || "📦"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                      {tx.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                      {tx.time}
                    </p>
                  </div>

                  {/* Amount + Status */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                      {tx.amount}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${getStatusBadge(tx.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* 4. ADD THE TRANSACTION DETAILS MODAL AT THE BOTTOM OF THE RENDER */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedTx.name}</h3>
                <p className="text-sm text-gray-500">{selectedTx.id}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${getStatusBadge(selectedTx.status)}`}>
                {selectedTx.status}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Buyer Email</p>
                <p className="text-gray-900 font-medium">{selectedTx.buyer_email}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Buyer Phone</p>
                <p className="text-gray-900 font-medium">{selectedTx.buyer_phone}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Delivery Address</p>
                <p className="text-gray-900 font-medium leading-relaxed">{selectedTx.delivery_address}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="mt-8 w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
