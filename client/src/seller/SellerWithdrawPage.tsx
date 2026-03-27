import { useState, useEffect } from "react";
import { api } from "../helpers/helper";

const SellerWithdrawPage = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  
  // New States for Bank Details
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await api.getSellerDashboard();
        setBalance(data.total_transferable_funds || 0);
      } catch (err) {
        console.error("Failed to load balance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  const handleWithdraw = async () => {
    if (balance <= 0) {
      setMessage("No funds available to withdraw.");
      return;
    }
    
    if (!bankName || !accountNumber) {
      setMessage("Please fill in your bank details.");
      return;
    }

    setActionLoading(true);
    setMessage(null);
    
    try {
      const res = await api.withdrawFunds({ bank_name: bankName, account_number: accountNumber });
      setMessage(`${res.message} Total amount: ₦${Number(res.total_released).toLocaleString()}`);
      setBalance(0); 
      setBankName("");
      setAccountNumber("");
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-purple-600 uppercase mb-1">
            Seller Action
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Withdraw Funds</h1>
          <p className="text-gray-500 text-sm mt-1">
            Transfer available escrow funds directly to your bank account.
          </p>
        </div>

        <div className="space-y-3 text-sm mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Transferable funds</span>
            <span className="text-xl font-bold text-gray-900">
              {loading ? "Loading..." : `₦${Number(balance).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`}
            </span>
          </div>
          {balance === 0 && !loading && (
            <p className="text-xs text-orange-500 mt-2">
              You currently have no funds ready for withdrawal. Wait for buyers to confirm delivery.
            </p>
          )}
        </div>

        {/* BANK DETAILS FORM */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              disabled={balance <= 0}
              placeholder="e.g. Guarantee Trust Bank"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              disabled={balance <= 0}
              placeholder="e.g. 0123456789"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleWithdraw}
          disabled={loading || actionLoading || balance <= 0 || !bankName || !accountNumber}
          className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm sm:text-base transition-colors active:scale-[0.98]"
        >
          {actionLoading ? "Processing..." : "Withdraw Funds"}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerWithdrawPage;
