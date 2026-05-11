import type { Invoice } from "../types";
export const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
export const subtotal = (invoice: Pick<Invoice, "items">) => invoice.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
export const taxAmount = (invoice: Pick<Invoice, "items" | "taxRate">) => subtotal(invoice) * (Number(invoice.taxRate || 0) / 100);
export const total = (invoice: Pick<Invoice, "items" | "taxRate" | "discount">) => Math.max(0, subtotal(invoice) + taxAmount(invoice) - Number(invoice.discount || 0));
