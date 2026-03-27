import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../helpers/helper";

interface PublicInvoice {
  item_name: string;
  item_description: string;
  amount: number | string;
  escrow_days: number;
  images: string[];
  buyer_email: string;
  buyer_phone: string;
  delivery_days: string;
  seller: string;
}

const InvoiceDetailPage = () => {
  const [params] = useSearchParams();
  const id = params.get("id");
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) {
        setError("Invalid link. No invoice ID provided.");
        setLoading(false);
        return;
      }

      try {
        const data = await api.getInvoiceDetail(id);
        setInvoice(data);
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load invoice details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">Loading invoice details...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md w-full">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invoice Not Found</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Details</h1>
          <p className="text-gray-500">Review the item details before proceeding to payment.</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          
          {/* Main Image Gallery */}
          {invoice.images && invoice.images.length > 0 ? (
            <div className="w-full bg-gray-100">
               <img 
                  src={invoice.images[0].startsWith('http') ? invoice.images[0] : `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}${invoice.images[0]}`} 
                  alt={invoice.item_name} 
                  className="w-full h-80 object-cover"
                />
                {/* Thumbnails if > 1 image */}
                {invoice.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4 bg-white border-b border-gray-100">
                    {invoice.images.slice(1).map((img, idx) => (
                       <img 
                       key={idx}
                       src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}${img}`}
                       alt={`Thumbnail ${idx}`} 
                       className="w-full h-24 object-cover rounded-xl border border-gray-200"
                     />
                    ))}
                  </div>
                )}
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center border-b border-gray-100">
               <span className="text-5xl">📦</span>
            </div>
          )}

          {/* Details Section */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{invoice.item_name}</h2>
                <p className="text-sm text-gray-500 mt-1">Sold by: <span className="font-semibold text-gray-700">{invoice.seller}</span></p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-3xl font-extrabold text-indigo-600">
                  ₦{Number(invoice.amount).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                {invoice.item_description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                 <div className="text-2xl">⏳</div>
                 <div>
                   <p className="text-xs text-gray-500 font-medium">Escrow Protected</p>
                   <p className="text-sm font-bold text-gray-900">{invoice.escrow_days} Days after delivery</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                 <div className="text-2xl">🚚</div>
                 <div>
                   <p className="text-xs text-gray-500 font-medium">Expected Delivery</p>
                   <p className="text-sm font-bold text-gray-900">{invoice.delivery_days}</p>
                 </div>
              </div>
            </div>

            {/* Proceed to Payment Button */}
            <button
              onClick={() => navigate(`/payment/initiate?id=${id}`)}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl text-lg transition duration-200 active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
            >
              Pay for Order <span>➔</span>
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Your payment will be securely held in Escrow until you confirm delivery.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceDetailPage;
