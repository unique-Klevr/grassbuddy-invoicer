import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, BadgeDollarSign, Check, Copy, Download, Leaf, Plus, Settings, Wallet } from "lucide-react";
import type { BrandingSettings, DemoUser, Invoice, InvoiceStatus, LineItem, PaymentSettings } from "./types";
import { blankInvoice } from "./lib/demoData";
import { store } from "./lib/storage";
import { money, subtotal, taxAmount, total } from "./lib/money";
import { supabase, usingDemoStorage } from "./lib/supabase";

const input = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-100";
const label = "space-y-1.5 text-sm font-medium text-ink";
const button = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition";
const primary = button + " bg-pine-700 text-white hover:bg-pine-800";
const secondary = button + " border border-line bg-white text-ink hover:border-pine-300 hover:bg-pine-50";
const founderCta = button + " bg-pine-300 text-ink shadow-soft hover:bg-white hover:text-ink";
const paypalCta = button + " bg-[#ffc439] text-[#111820] shadow-soft hover:bg-[#ffb703]";
const paypalCheckoutUrl = import.meta.env.VITE_PAYPAL_FOUNDER_CHECKOUT_URL || "https://www.paypal.com/ncp/payment/Z2TLRXLMMF57S";

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------
function Shell({ children, user, onLogout }: { children: React.ReactNode; user: DemoUser | null; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-mist">
      <header className="no-print sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pine-800 text-white"><Leaf size={18} /></span>
            GrassBuddy
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <Link to="/pricing">Pricing</Link>
            {user && <><Link to="/dashboard">Dashboard</Link><Link to="/settings/payments">Payments</Link></>}
          </nav>
          <div className="flex items-center gap-2">
            {user
              ? <button className={secondary} onClick={onLogout}>Log out</button>
              : <><Link className={secondary} to="/login">Login</Link><Link className={founderCta} to="/checkout">Get $49 Deal</Link></>
            }
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Landing
// ---------------------------------------------------------------------------
function Landing() {
  return (
    <main className="bg-white">
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1fr_0.9fr] md:py-24">
          <div className="flex flex-col justify-center">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Send professional lawn care invoices in under 60 seconds.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-300">GrassBuddy helps service businesses create clean invoices, add payment links, and get paid faster.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={founderCta} to="/checkout">Get Lifetime Access for $49 <ArrowRight size={16} /></Link>
              <Link className={button + " border border-white/20 text-white hover:bg-white/10"} to="/login">View demo</Link>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white p-3 text-ink shadow-lift">
            <InvoicePreview invoice={store.getInvoices("demo")[0]} payments={store.getPayments("demo")} compact />
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-3">
        <DealCard title="Founder Lifetime" price="$49 one time" active />
        <DealCard title="Future Pro Plan" price="$19/month" />
        <DealCard title="Future Business Plan" price="$49/month" />
      </section>
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold">Early founder pricing ends soon. Get lifetime access before monthly pricing launches.</h2>
            <p className="mt-3 text-gray-600">Lifetime access to Version 1, unlimited invoices, residential and commercial templates, PDF downloads, payment link support, and future updates for founder users.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function DealCard({ title, price, active }: { title: string; price: string; active?: boolean }) {
  return (
    <div className={(active ? "border-pine-700 bg-pine-900 text-white" : "border-line bg-white") + " rounded-lg border p-6 shadow-soft"}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-3xl font-semibold">{price}</p>
      <ul className={(active ? "text-pine-50" : "text-gray-600") + " mt-5 space-y-2 text-sm"}>
        <li>Unlimited invoices</li><li>Residential + commercial templates</li>
        <li>PDF downloads</li><li>Stripe/PayPal payment links</li>
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pricing & Checkout
// ---------------------------------------------------------------------------
function Pricing() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14">
      <h1 className="text-4xl font-semibold">Founders Lifetime Deal</h1>
      <p className="mt-3 max-w-2xl text-gray-600">$49 one time for lifetime access to Version 1 and future founder updates.</p>
      <div className="mt-6"><Link className={paypalCta} to="/checkout"><Wallet size={16} /> Checkout with PayPal</Link></div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <DealCard title="Founder Lifetime" price="$49 one time" active />
        <DealCard title="Future Pro Plan" price="$19/month" />
        <DealCard title="Future Business Plan" price="$49/month" />
      </div>
    </main>
  );
}

function Checkout() {
  const [email, setEmail] = useState("");
  const href = paypalCheckoutUrl;
  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-[1fr_0.85fr]">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-semibold">Founder Lifetime Deal</h1>
        <p className="mt-2 text-gray-600">Pay once through PayPal and get lifetime access to GrassBuddy Version 1.</p>
        <div className="mt-6 rounded-lg bg-pine-50 p-5">
          <div className="text-sm text-gray-600">Today</div>
          <div className="mt-1 text-5xl font-semibold">$49</div>
          <div className="mt-2 text-sm text-pine-900">One-time founder purchase</div>
        </div>
        <label className={label + " mt-5 block"}>
          Founder email
          <input className={input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
        </label>
        <a className={paypalCta + " mt-5 w-full"} href={href} target="_blank" rel="noreferrer">
          <Wallet size={18} /> Continue to PayPal checkout
        </a>
        <p className="mt-3 text-sm text-gray-500">After payment, use the same email to create your account and get access.</p>
      </section>
      <section className="rounded-lg border border-line bg-ink p-6 text-white shadow-soft">
        <h2 className="text-xl font-semibold">Included for founders</h2>
        <ul className="mt-5 space-y-3 text-sm text-gray-200">
          <li>Lifetime access to Version 1</li>
          <li>Unlimited invoices</li>
          <li>Residential + commercial invoice templates</li>
          <li>PDF downloads</li>
          <li>Stripe/PayPal payment link support</li>
          <li>Future updates for founder users</li>
        </ul>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Auth — real Supabase auth when connected, demo fallback otherwise
// ---------------------------------------------------------------------------
function Auth({ mode, setUser }: { mode: "login" | "signup"; setUser: (u: DemoUser) => void }) {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (supabase) {
      // Real Supabase auth
      const { data, error: authError } = mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const sbUser = data.user;
      if (sbUser) {
        setUser({ id: sbUser.id, email: sbUser.email ?? email, name: sbUser.email ?? email });
        nav("/dashboard");
      } else if (mode === "signup") {
        setError("Check your email to confirm your account, then log in.");
      }
    } else {
      // Demo fallback (no Supabase keys)
      const user = { id: "demo-founder", email: email || "founder@grassbuddy.app", name: "GrassBuddy Founder" };
      setUser(user);
      nav("/dashboard");
    }

    setLoading(false);
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-semibold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
        {usingDemoStorage && (
          <p className="mt-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-2">Demo mode — add Supabase keys for real accounts.</p>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className={label}>
            Email
            <input className={input} value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@company.com" />
          </label>
          <label className={label}>
            Password
            <input className={input} value={password} onChange={e => setPassword(e.target.value)} type="password" required minLength={6} placeholder="••••••••" />
          </label>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className={primary + " w-full"} disabled={loading}>
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          {mode === "signup"
            ? <><Link className="text-pine-700 underline" to="/login">Already have an account? Log in</Link></>
            : <><Link className="text-pine-700 underline" to="/signup">No account? Sign up</Link></>
          }
        </p>
      </div>
    </main>
  );
}

function Require({ user, children }: { user: DemoUser | null; children: React.ReactNode }) {
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function Dashboard({ user, invoices, setInvoices }: { user: DemoUser; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void }) {
  const revenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + total(i), 0);
  const counts = (s: InvoiceStatus) => invoices.filter(i => i.status === s).length;
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-gray-600">Track invoices, payment status, and recent work.</p>
        </div>
        <Link className={primary} to="/invoices/new"><Plus size={16} /> New invoice</Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Total revenue" value={money(revenue)} />
        <Metric title="Paid invoices" value={counts("paid")} />
        <Metric title="Unpaid invoices" value={counts("unpaid")} />
        <Metric title="Overdue invoices" value={counts("overdue")} />
      </div>
      <section className="mt-6 rounded-lg border border-line bg-white shadow-soft">
        <div className="border-b border-line p-4 font-semibold">Recent invoices</div>
        {invoices.length === 0 && <p className="p-6 text-sm text-gray-500">No invoices yet. Create your first one!</p>}
        {invoices.map(inv => (
          <div key={inv.id} className="grid gap-3 border-b border-line p-4 last:border-0 md:grid-cols-[1fr_auto_auto]">
            <Link to={"/invoices/" + inv.id}>
              <b>{inv.invoiceNumber}</b>
              <div className="text-sm text-gray-600">{inv.customer.name || "Unnamed customer"} · {inv.kind}</div>
            </Link>
            <span className="font-semibold">{money(total(inv))}</span>
            <StatusSelect invoice={inv} setInvoices={setInvoices} invoices={invoices} userId={user.id} />
          </div>
        ))}
      </section>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function StatusSelect({ invoice, invoices, setInvoices, userId }: { invoice: Invoice; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; userId: string }) {
  return (
    <select className={input + " max-w-36"} value={invoice.status} onChange={e => {
      const next = invoices.map(i => i.id === invoice.id ? { ...i, status: e.target.value as InvoiceStatus } : i);
      store.setInvoices(userId, next);
      setInvoices(next);
    }}>
      <option value="paid">Paid</option>
      <option value="unpaid">Unpaid</option>
      <option value="overdue">Overdue</option>
    </select>
  );
}

// ---------------------------------------------------------------------------
// Invoice editor
// ---------------------------------------------------------------------------
function InvoiceEditor({ user, invoices, setInvoices, payments, branding }: { user: DemoUser; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; payments: PaymentSettings; branding: BrandingSettings }) {
  const nav = useNavigate();
  const [invoice, setInvoice] = useState<Invoice>({ ...blankInvoice(), businessName: branding.businessName, businessLogo: branding.logo });
  const update = (patch: Partial<Invoice>) => setInvoice({ ...invoice, ...patch });
  const save = () => {
    const next = [invoice, ...invoices.filter(i => i.id !== invoice.id)];
    store.setInvoices(user.id, next);
    setInvoices(next);
    nav("/invoices/" + invoice.id);
  };
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_0.9fr]">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-semibold">Create invoice</h1>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className={label}>Business name<input className={input} value={invoice.businessName} onChange={e => update({ businessName: e.target.value })} /></label>
          <LogoUpload onLogo={logo => update({ businessLogo: logo })} />
          <label className={label}>Customer name<input className={input} value={invoice.customer.name} onChange={e => update({ customer: { ...invoice.customer, name: e.target.value } })} /></label>
          <label className={label}>Customer phone/email<input className={input} value={invoice.customer.email || invoice.customer.phone} onChange={e => update({ customer: { ...invoice.customer, email: e.target.value } })} /></label>
          <label className={label + " md:col-span-2"}>Customer address<input className={input} value={invoice.customer.address} onChange={e => update({ customer: { ...invoice.customer, address: e.target.value } })} /></label>
          <label className={label}>Invoice number<input className={input} value={invoice.invoiceNumber} onChange={e => update({ invoiceNumber: e.target.value })} /></label>
          <label className={label}>Due date<input className={input} type="date" value={invoice.dueDate} onChange={e => update({ dueDate: e.target.value })} /></label>
        </div>
        <div className="mt-4 flex rounded-lg bg-mist p-1">
          <button className={(invoice.kind === "residential" ? "bg-white shadow-soft " : "") + "flex-1 rounded-lg px-3 py-2 text-sm font-semibold"} onClick={() => update({ kind: "residential" })}>Residential</button>
          <button className={(invoice.kind === "commercial" ? "bg-white shadow-soft " : "") + "flex-1 rounded-lg px-3 py-2 text-sm font-semibold"} onClick={() => update({ kind: "commercial" })}>Commercial</button>
        </div>
        <LineItems invoice={invoice} setInvoice={setInvoice} />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className={label}>Tax %<input className={input} type="number" value={invoice.taxRate} onChange={e => update({ taxRate: Number(e.target.value) })} /></label>
          <label className={label}>Discount<input className={input} type="number" value={invoice.discount} onChange={e => update({ discount: Number(e.target.value) })} /></label>
          <label className={label}>Notes<textarea className={input} value={invoice.notes} onChange={e => update({ notes: e.target.value })} /></label>
          <label className={label}>Terms<textarea className={input} value={invoice.terms} onChange={e => update({ terms: e.target.value })} /></label>
        </div>
        <button className={primary + " mt-5 w-full"} onClick={save}><Check size={16} /> Save invoice</button>
      </section>
      <InvoicePreview invoice={invoice} payments={payments} />
    </main>
  );
}

function LogoUpload({ onLogo }: { onLogo: (logo: string) => void }) {
  return (
    <label className={label}>
      Business logo upload
      <input className={input} type="file" accept="image/*" onChange={e => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => onLogo(String(reader.result));
        reader.readAsDataURL(file);
      }} />
    </label>
  );
}

function LineItems({ invoice, setInvoice }: { invoice: Invoice; setInvoice: (i: Invoice) => void }) {
  const item = (id: string, patch: Partial<LineItem>) =>
    setInvoice({ ...invoice, items: invoice.items.map(it => it.id === id ? { ...it, ...patch } : it) });
  return (
    <div className="mt-5 space-y-3">
      <div className="font-semibold">Line items</div>
      {invoice.items.map(it => (
        <div key={it.id} className="grid gap-2 md:grid-cols-[1fr_90px_110px]">
          <input className={input} value={it.description} onChange={e => item(it.id, { description: e.target.value })} />
          <input className={input} type="number" value={it.quantity} onChange={e => item(it.id, { quantity: Number(e.target.value) })} />
          <input className={input} type="number" value={it.price} onChange={e => item(it.id, { price: Number(e.target.value) })} />
        </div>
      ))}
      <button className={secondary} onClick={() => setInvoice({ ...invoice, items: [...invoice.items, { id: crypto.randomUUID(), description: "", quantity: 1, price: 0 }] })}>
        <Plus size={16} /> Add item
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Invoice view
// ---------------------------------------------------------------------------
function InvoicePage({ user, invoices, setInvoices, payments }: { user: DemoUser; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; payments: PaymentSettings }) {
  const { id } = useParams();
  const invoice = invoices.find(i => i.id === id);
  if (!invoice) return <main className="p-8">Invoice not found.</main>;
  const copy = () => navigator.clipboard.writeText(location.origin + "/invoices/" + invoice.id);
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <button className={secondary} onClick={() => window.print()}><Download size={16} /> Download PDF</button>
        <button className={secondary} onClick={copy}><Copy size={16} /> Copy shareable invoice link</button>
        <StatusSelect invoice={invoice} invoices={invoices} setInvoices={setInvoices} userId={user.id} />
      </div>
      <InvoicePreview invoice={invoice} payments={payments} />
    </main>
  );
}

function InvoicePreview({ invoice, payments, compact }: { invoice: Invoice; payments: PaymentSettings; compact?: boolean }) {
  const payLink = payments.preferredProvider === "stripe" ? payments.stripeLink : payments.paypalLink;
  return (
    <section className={(compact ? "" : "print-sheet ") + "rounded-lg border border-line bg-white p-6 shadow-soft"}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          {invoice.businessLogo
            ? <img src={invoice.businessLogo} className="h-12 w-12 rounded-lg object-cover" />
            : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pine-800 text-white"><Leaf size={20} /></div>
          }
          <div><h2 className="text-xl font-semibold">{invoice.businessName}</h2><p className="text-sm capitalize text-gray-500">{invoice.kind} invoice</p></div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Invoice</div>
          <div className="font-semibold">{invoice.invoiceNumber}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-gray-500">{invoice.status}</div>
        </div>
      </div>
      <div className="mt-8 grid gap-4 text-sm md:grid-cols-2">
        <div>
          <div className="font-semibold">Bill to</div>
          <p className="mt-1 text-gray-600">{invoice.customer.name || "Customer name"}<br />{invoice.customer.email || invoice.customer.phone}<br />{invoice.customer.address}</p>
        </div>
        <div className="md:text-right">
          <div>Invoice date: {invoice.invoiceDate}</div>
          <div>Due date: {invoice.dueDate}</div>
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left">
            <tr><th className="p-3">Service</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Amount</th></tr>
          </thead>
          <tbody>
            {invoice.items.map(it => (
              <tr key={it.id} className="border-t border-line">
                <td className="p-3">{it.description}</td>
                <td className="p-3 text-right">{it.quantity}</td>
                <td className="p-3 text-right">{money(it.price)}</td>
                <td className="p-3 text-right">{money(it.quantity * it.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 ml-auto max-w-xs space-y-2 text-sm">
        <Row label="Subtotal" value={money(subtotal(invoice))} />
        <Row label="Tax" value={money(taxAmount(invoice))} />
        <Row label="Discount" value={"-" + money(invoice.discount)} />
        <div className="border-t border-line pt-2"><Row label="Total" value={money(total(invoice))} strong /></div>
      </div>
      <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
        <p><b>Notes</b><br />{invoice.notes}</p>
        <p><b>Terms</b><br />{invoice.terms}</p>
      </div>
      {payLink && <a className={primary + " no-print mt-6 w-full"} href={payLink} target="_blank"><Wallet size={16} /> Pay Invoice</a>}
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className={(strong ? "text-lg font-semibold" : "") + " flex justify-between gap-4"}><span>{label}</span><span>{value}</span></div>;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
function Payments({ user, settings, setSettings }: { user: DemoUser; settings: PaymentSettings; setSettings: (s: PaymentSettings) => void }) {
  const [draft, setDraft] = useState(settings);
  return (
    <SettingsPanel title="Payment settings" icon={<BadgeDollarSign />}>
      <label className={label}>Stripe Payment Link<input className={input} value={draft.stripeLink} onChange={e => setDraft({ ...draft, stripeLink: e.target.value })} /></label>
      <label className={label}>PayPal link<input className={input} value={draft.paypalLink} onChange={e => setDraft({ ...draft, paypalLink: e.target.value })} /></label>
      <label className={label}>
        Preferred payment button
        <select className={input} value={draft.preferredProvider} onChange={e => setDraft({ ...draft, preferredProvider: e.target.value as PaymentSettings["preferredProvider"] })}>
          <option value="stripe">Stripe</option>
          <option value="paypal">PayPal</option>
        </select>
      </label>
      <button className={primary} onClick={() => { store.setPayments(user.id, draft); setSettings(draft); }}>Save payment settings</button>
    </SettingsPanel>
  );
}

function Branding({ user, branding, setBranding }: { user: DemoUser; branding: BrandingSettings; setBranding: (b: BrandingSettings) => void }) {
  const [draft, setDraft] = useState(branding);
  return (
    <SettingsPanel title="Branding" icon={<Settings />}>
      <label className={label}>Business name<input className={input} value={draft.businessName} onChange={e => setDraft({ ...draft, businessName: e.target.value })} /></label>
      <LogoUpload onLogo={logo => setDraft({ ...draft, logo })} />
      <button className={primary} onClick={() => { store.setBranding(user.id, draft); setBranding(draft); }}>Save branding</button>
    </SettingsPanel>
  );
}

function SettingsPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="mb-5 flex items-center gap-3"><span className="text-pine-700">{icon}</span><h1 className="text-2xl font-semibold">{title}</h1></div>
        <div className="space-y-4">{children}</div>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Root app — session management
// ---------------------------------------------------------------------------
export default function App() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [authReady, setAuthReady] = useState(!supabase); // if no supabase, skip loading

  // Supabase session management
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const sbUser = data.session?.user;
      if (sbUser) setUser({ id: sbUser.id, email: sbUser.email ?? "", name: sbUser.email ?? "" });
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sbUser = session?.user;
      setUser(sbUser ? { id: sbUser.id, email: sbUser.email ?? "", name: sbUser.email ?? "" } : null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const [invoices, setInvoicesState] = useState<Invoice[]>([]);
  const [payments, setPaymentsState] = useState(store.getPayments("demo"));
  const [branding, setBrandingState] = useState(store.getBranding("demo"));

  // Load per-user data when user changes
  useEffect(() => {
    if (!user) return;
    setInvoicesState(store.getInvoices(user.id));
    setPaymentsState(store.getPayments(user.id));
    setBrandingState(store.getBranding(user.id));
  }, [user?.id]);

  const setInvoices = (i: Invoice[]) => { if (user) store.setInvoices(user.id, i); setInvoicesState(i); };
  const setPayments = (s: PaymentSettings) => { if (user) store.setPayments(user.id, s); setPaymentsState(s); };
  const setBranding = (b: BrandingSettings) => { if (user) store.setBranding(user.id, b); setBrandingState(b); };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  if (!authReady) return <div className="flex min-h-screen items-center justify-center text-gray-500">Loading…</div>;

  return (
    <Shell user={user} onLogout={logout}>
      {usingDemoStorage && (
        <div className="no-print bg-pine-50 px-4 py-2 text-center text-xs text-pine-900">
          Demo mode: local storage is active. Add Supabase keys for real accounts.
        </div>
      )}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/signup" element={<Auth mode="signup" setUser={setUser} />} />
        <Route path="/login" element={<Auth mode="login" setUser={setUser} />} />
        <Route path="/dashboard" element={<Require user={user}><Dashboard user={user!} invoices={invoices} setInvoices={setInvoices} /></Require>} />
        <Route path="/invoices/new" element={<Require user={user}><InvoiceEditor user={user!} invoices={invoices} setInvoices={setInvoices} payments={payments} branding={branding} /></Require>} />
        <Route path="/invoices/:id" element={<Require user={user}><InvoicePage user={user!} invoices={invoices} setInvoices={setInvoices} payments={payments} /></Require>} />
        <Route path="/settings/payments" element={<Require user={user}><Payments user={user!} settings={payments} setSettings={setPayments} /></Require>} />
        <Route path="/settings/branding" element={<Require user={user}><Branding user={user!} branding={branding} setBranding={setBranding} /></Require>} />
      </Routes>
    </Shell>
  );
}
