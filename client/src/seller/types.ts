export interface DemoInvoice {
  id: string;
  itemName: string;
  description: string;
  amount: string;
  escrowPeriod: string;
  deliveryTimeframe: string;
  buyerEmail: string;
  buyerPhone: string;
  images: File[];
  invoiceUrl: string;
  paymentUrl: string;
  createdAt: string;
}
