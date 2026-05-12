import type { BrandingSettings, Invoice, PaymentSettings } from "../types";
import { defaultBranding, defaultPaymentSettings, seedInvoices } from "./demoData";

// Keys are namespaced by userId so each account has its own data
const keys = (uid: string) => ({
  invoices: `grassbuddy:${uid}:invoices`,
  payments: `grassbuddy:${uid}:payments`,
  branding: `grassbuddy:${uid}:branding`,
});

const read = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
};
const write = <T,>(key: string, value: T) =>
  localStorage.setItem(key, JSON.stringify(value));

export const store = {
  getInvoices: (uid: string) =>
    read<Invoice[]>(keys(uid).invoices, seedInvoices),
  setInvoices: (uid: string, invoices: Invoice[]) =>
    write(keys(uid).invoices, invoices),
  getPayments: (uid: string) =>
    read<PaymentSettings>(keys(uid).payments, defaultPaymentSettings),
  setPayments: (uid: string, settings: PaymentSettings) =>
    write(keys(uid).payments, settings),
  getBranding: (uid: string) =>
    read<BrandingSettings>(keys(uid).branding, defaultBranding),
  setBranding: (uid: string, settings: BrandingSettings) =>
    write(keys(uid).branding, settings),
};
