import type { BrandingSettings, DemoUser, Invoice, PaymentSettings } from "../types";
import { defaultBranding, defaultPaymentSettings, demoUser, seedInvoices } from "./demoData";
const keys = { user: "grassbuddy:user", invoices: "grassbuddy:invoices", payments: "grassbuddy:payments", branding: "grassbuddy:branding" };
const read = <T,>(key: string, fallback: T): T => { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; };
const write = <T,>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value));
export const store = { getUser: () => read<DemoUser | null>(keys.user, demoUser), setUser: (user: DemoUser | null) => write(keys.user, user), getInvoices: () => read<Invoice[]>(keys.invoices, seedInvoices), setInvoices: (invoices: Invoice[]) => write(keys.invoices, invoices), getPayments: () => read<PaymentSettings>(keys.payments, defaultPaymentSettings), setPayments: (settings: PaymentSettings) => write(keys.payments, settings), getBranding: () => read<BrandingSettings>(keys.branding, defaultBranding), setBranding: (settings: BrandingSettings) => write(keys.branding, settings) };
