import { useSearchParams } from "react-router-dom";

const PaymentResultPage = () => {
  const [params] = useSearchParams();

  const txnRef = params.get("txn_ref") ?? "-";
  const resp = params.get("resp") ?? "unknown";
  const payRef = params.get("pay_ref") ?? "-";

  const isSuccess = resp === "00" || resp === "success";

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-purple-600 uppercase mb-1">
            Payment Response
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isSuccess ? "Payment Successful" : "Payment Failed"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            This mirrors the GET /apps/payment/response/ endpoint using query parameters.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Transaction Ref (txn_ref)</span>
            <span className="font-semibold text-gray-900 break-all">{txnRef}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Response Code (resp)</span>
            <span className="font-semibold text-gray-900">{resp}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Payment Ref (pay_ref)</span>
            <span className="font-semibold text-gray-900 break-all">{payRef}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
