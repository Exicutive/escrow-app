import { useState, useRef } from "react";

export interface CreateInvoicePayload {
  itemName: string;
  description: string;
  amount: string;
  escrowPeriod: string;
  deliveryTimeframe: string;
  buyerEmail: string;
  buyerPhone: string;
  images: File[];
}

interface CreateInvoicePageProps {
  onCancel: () => void;
  onCreateInvoice: (payload: CreateInvoicePayload) => Promise<string>;
}

const ESCROW_PERIOD_OPTIONS = [
  "1 day after delivery",
  "3 days after delivery",
  "7 days after delivery",
  "14 days after delivery",
  "30 days after delivery",
];

const DELIVERY_TIMEFRAME_OPTIONS = [
  "Same day",
  "1-2 days",
  "3-5 days",
  "1-2 weeks",
  "2-4 weeks",
];

const CreateInvoicePage = ({
  onCancel,
  onCreateInvoice,
}: CreateInvoicePageProps) => {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [escrowPeriod, setEscrowPeriod] = useState("7 days after delivery");
  const [images, setImages] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [deliveryTimeframe, setDeliveryTimeframe] = useState("3-5 days");

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleImageClick = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const handleImageChange = (index: number, file: File | null) => {
    const updated = [...images];
    updated[index] = file;
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const link = await onCreateInvoice({
        itemName,
        description,
        amount,
        escrowPeriod,
        deliveryTimeframe,
        buyerEmail,
        buyerPhone,
        images: images.filter((image): image is File => image !== null),
      });

      setGeneratedLink(link);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Something went wrong creating the invoice.", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const filledCount = images.filter(Boolean).length;
  const slots = Math.min(5, filledCount + 1);
  const visibleSlots = images.slice(0, Math.max(slots, 3));

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create Escrow Invoice
            </h1>
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details below to create a secure escrow transaction
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Details Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900">Item Details</h2>

            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. iPhone 13 Pro Max 256GB"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item condition, specifications, included accessories..."
                required
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Amount (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="450,000"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Escrow Period <span className="text-red-500">*</span>
                </label>
                <select
                  value={escrowPeriod}
                  onChange={(e) => setEscrowPeriod(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white appearance-none cursor-pointer"
                >
                  {ESCROW_PERIOD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Max 5)
              </label>
              <div className="flex gap-3 flex-wrap">
                {visibleSlots.map((img, i) => (
                  <div key={i} className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => {
                        fileInputRefs.current[i] = el;
                      }}
                      onChange={(e) =>
                        handleImageChange(i, e.target.files?.[0] ?? null)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleImageClick(i)}
                      className="w-[90px] h-[90px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition-colors duration-150 overflow-hidden"
                    >
                      {img ? (
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`upload-${i}`}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : i === 0 ? (
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      ) : (
                        <span className="text-2xl text-gray-400 font-light">
                          +
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buyer Information Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900">
              Buyer Information
            </h2>

            {/* Buyer Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Buyer Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="buyer@email.com"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Buyer Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="080XXXXXXXX"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Expected Delivery Timeframe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Expected Delivery Timeframe{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={deliveryTimeframe}
                onChange={(e) => setDeliveryTimeframe(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white appearance-none cursor-pointer"
              >
                {DELIVERY_TIMEFRAME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-900 text-white font-semibold py-3.5 px-6 rounded-xl active:scale-[0.98] transition-all duration-150 text-sm sm:text-base shadow-md"
            >
              {isSubmitting ? "Creating..." : "Create Invoice & Get Link"}
            </button>
          </div>
        </form>
      </main>

      {/* SUCCESS MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl border-4 border-green-50">
              ✓
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Invoice Created!
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Your secure escrow link is ready. Send this to the buyer so they
              can review the details and make a payment.
            </p>

            <div className="flex items-center gap-2 mb-8 bg-gray-50 p-2 rounded-xl border border-gray-200">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 bg-transparent border-none text-sm text-gray-700 focus:outline-none px-2 text-ellipsis overflow-hidden whitespace-nowrap"
              />
              <button
                onClick={handleCopy}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors active:scale-95"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            <button
              onClick={onCancel}
              className="w-full text-indigo-600 font-semibold py-2 hover:text-indigo-800 transition-colors text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInvoicePage;
