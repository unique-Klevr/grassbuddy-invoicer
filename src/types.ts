export type InvoiceStatus = "paid" | "unpaid" | "overdue";
export type InvoiceKind = "residential" | "commercial";
export type LineItem = { id: string; description: string; quantity: number; price: number; };
export type Customer = { id: string; name: string; phone: string; email: string; address: string; };
export type Invoice = { id: string; userId: string; businessName: string; businessLogo?: string; customer: Customer; kind: InvoiceKind; invoiceNumber: string; invoiceDate: string; dueDate: string; items: LineItem[]; taxRate: number; discount: number; notes: string; terms: string; status: InvoiceStatus; createdAt: string; };
export type PaymentSettings = { stripeLink: string; paypalLink: string; preferredProvider: "stripe" | "paypal"; };
export type BrandingSettings = { businessName: string; logo?: string; };
export type DemoUser = { id: string; email: string; name: string; };
