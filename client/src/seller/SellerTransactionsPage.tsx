const SellerTransactionsPage = () => {
  const transactions = [
    {
      id: 1,
      itemName: "iPhone 13 Pro Max 256GB",
      amount: "₦450,000.00",
      status: "created",
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 2,
      itemName: "MacBook Air M2 256GB",
      amount: "₦680,000.00",
      status: "completed",
      createdAt: "2024-01-10T09:20:00Z",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-purple-600 uppercase mb-1">
              Seller Transactions
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Transactions</h1>
            <p className="text-sm text-gray-500 mt-1">
              Paginated list of escrow transactions for the seller (demo).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{tx.itemName}</p>
                <p className="text-xs text-gray-500 mt-0.5">Created at {tx.createdAt}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{tx.amount}</p>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800/5 text-gray-800">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerTransactionsPage;
