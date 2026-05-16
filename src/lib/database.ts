import { supabase } from "./supabase";
import type { Invoice, PaymentSettings, BrandingSettings } from "../types";

/**
 * Saves or updates an invoice in Supabase.
 */
export async function upsertInvoice(invoice: Invoice) {
  if (!supabase) return { error: "Supabase not connected" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No authenticated user" };

  const { data, error } = await supabase
    .from("invoices")
    .upsert({
      id: invoice.id,
      user_id: user.id,
      invoice_number: invoice.invoiceNumber,
      customer_json: invoice.customer,
      kind: invoice.kind,
      invoice_date: invoice.invoiceDate,
      due_date: invoice.dueDate,
      items_json: invoice.items,
      tax_rate: invoice.taxRate,
      discount: invoice.discount,
      notes: invoice.notes,
      terms: invoice.terms,
      status: invoice.status,
      updated_at: new Date().toISOString()
    })
    .select();

  return { data, error };
}

/**
 * Saves user settings (branding + payments) in Supabase.
 */
export async function saveUserSettings(branding: BrandingSettings, payments: PaymentSettings) {
  if (!supabase) return { error: "Supabase not connected" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No authenticated user" };

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      business_name: branding.businessName,
      logo_url: branding.logo,
      stripe_link: payments.stripeLink,
      paypal_link: payments.paypalLink,
      preferred_provider: payments.preferredProvider,
      updated_at: new Date().toISOString()
    })
    .select();

  return { data, error };
}
