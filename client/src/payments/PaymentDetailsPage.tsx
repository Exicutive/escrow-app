const PaymentDetailsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-purple-600 uppercase mb-1">
              Payment Details
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Review Payment</h1>
            <p className="text-sm text-gray-500 mt-1">
              Summary of the amount, platform fee, and total to be charged.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Item price</span>
            <span className="text-sm font-semibold text-gray-900">₦1,000.00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Platform fee</span>
            <span className="text-sm font-semibold text-gray-900">₦15.00</span>
          </div>
          <div className="border-t border-dashed border-gray-200 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-800 font-semibold">Total amount</span>
            <span className="text-base sm:text-lg font-bold text-gray-900">₦1,015.00</span>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Currency: <span className="font-semibold text-gray-800">NGN</span> • Methods: card, bank
            transfer, USSD.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;
