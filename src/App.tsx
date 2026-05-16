import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { 
  ArrowRight, 
  BadgeDollarSign, 
  Check, 
  ChevronDown,
  Copy, 
  Download, 
  ExternalLink,
  Leaf, 
  Plus, 
  Settings, 
  Wallet, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Clock,
  Star,
  Users,
  Menu,
  X
} from "lucide-react";
import type { BrandingSettings, DemoUser, Invoice, InvoiceStatus, LineItem, PaymentSettings } from "./types";
import { blankInvoice } from "./lib/demoData";
import { store } from "./lib/storage";
import { money, subtotal, taxAmount, total } from "./lib/money";
import { supabase, usingDemoStorage } from "./lib/supabase";

const BASE = import.meta.env.BASE_URL;
const asset = (path: string) => `${BASE}${path.replace(/^\//, "")}`;

const input = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-100";
const label = "space-y-1.5 text-xs font-bold uppercase tracking-wider text-pine-950";
const button = "pill-button transition-all duration-300 active:scale-95";
const primary = button + " pill-button-primary";
const secondary = button + " pill-button-secondary";
const paypalCta = button + " bg-[#ffc439] text-[#111820] hover:bg-[#ffb703]";
const paypalCheckoutUrl = import.meta.env.VITE_PAYPAL_FOUNDER_CHECKOUT_URL || "https://www.paypal.com/ncp/payment/Z2TLRXLMMF57S";

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------
function Shell({ children, user, onLogout }: { children: React.ReactNode; user: DemoUser | null; onLogout: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="no-print hidden bg-pine-950 py-2 text-white/80 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Mail size={12} className="text-lime-400" /> info@grassbuddypro.com</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Follow Us:</span>
            <div className="flex items-center gap-2 text-white hover:text-lime-400"><Facebook size={12} /></div>
            <div className="flex items-center gap-2 text-white hover:text-lime-400"><Twitter size={12} /></div>
            <div className="flex items-center gap-2 text-white hover:text-lime-400"><Instagram size={12} /></div>
          </div>
        </div>
      </div>

      <header className="no-print sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-pine-950">
            <img src={asset("logo.png")} alt="GrassBuddy Pro" className="h-12 w-12 rounded-xl object-contain" />
            GrassBuddy
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-bold uppercase tracking-wider text-pine-950/70 md:flex">
            <Link to="/" className="hover:text-pine-950">Home</Link>
            <Link to="/pricing" className="hover:text-pine-950">Pricing</Link>
            {user && (
              <>
                <Link to="/dashboard" className="hover:text-pine-950">Dashboard</Link>
                <Link to="/settings/payments" className="hover:text-pine-950">Payments</Link>
              </>
            )}
            <ProductsDropdown />
          </nav>
          <div className="flex items-center gap-4">
            {user
              ? <button className={secondary} onClick={onLogout}>Log out</button>
              : <div className="hidden items-center gap-2 md:flex">
                  <Link className="px-4 text-sm font-bold uppercase tracking-wider text-pine-950 hover:text-lime-600" to="/login">Login</Link>
                  <Link className={primary} to="/checkout">Get $9.99 Deal</Link>
                </div>
            }
            <button className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-pine-950" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="border-t border-line px-6 py-4 md:hidden">
            <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-wider text-pine-950/70">
              <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/pricing" onClick={() => setMobileOpen(false)}>Pricing</Link>
              {user && <><Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link><Link to="/settings/payments" onClick={() => setMobileOpen(false)}>Payments</Link></>}
              <a href="https://grassbuddy-saas.vercel.app/" target="_blank" rel="noreferrer" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>Leads <ExternalLink size={14} /></a>
              {!user && <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link className={primary + " text-center"} to="/checkout" onClick={() => setMobileOpen(false)}>Get $9.99 Deal</Link>
              </>}
            </nav>
          </div>
        )}
      </header>
      {children}
      
      {/* Footer */}
      <footer className="no-print bg-pine-950 pt-20 pb-10 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="col-span-2">
              <div className="flex items-center gap-3 text-2xl font-black tracking-tighter">
                <img src={asset("logo.png")} alt="GrassBuddy Pro" className="h-14 w-14 rounded-xl object-contain" />
                GrassBuddy
              </div>
              <p className="mt-6 max-w-md text-lg font-medium leading-relaxed text-white/70">
                Safe, Fast & Affordable Professional Invoicing for Landscaping & Lawn Care Experts.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <SocialIcon icon={<Facebook size={18} />} />
                <SocialIcon icon={<Twitter size={18} />} />
                <SocialIcon icon={<Instagram size={18} />} />
                <SocialIcon icon={<Linkedin size={18} />} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-lime-400">Quick Links</h4>
              <ul className="mt-6 space-y-4 text-sm font-medium text-white/60">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><a href="https://grassbuddy-saas.vercel.app/" target="_blank" rel="noreferrer" className="hover:text-white">Leads</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-lime-400">Contact Us</h4>
              <ul className="mt-6 space-y-4 text-sm font-medium text-white/60">
                <li className="flex items-start gap-3"><Mail size={18} className="text-lime-400" /> info@grassbuddypro.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-20 border-t border-white/10 pt-10 text-center text-xs font-bold uppercase tracking-widest text-white/30">
            © 2026 GrassBuddy Pro. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/5 transition hover:bg-lime-400 hover:text-pine-950">
      {icon}
    </div>
  );
}

function ProductsDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 hover:text-pine-950" onClick={() => setOpen(!open)}>
        Other Products <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-lift">
          <a 
            href="https://grassbuddy-saas.vercel.app/" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold normal-case tracking-normal text-pine-950 transition hover:bg-lime-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine-950 text-lime-400">
              <Users size={16} />
            </div>
            <div>
              <p className="font-black">Leads</p>
              <p className="text-[10px] font-medium text-pine-950/50">CRM & Lead Management</p>
            </div>
            <ExternalLink size={14} className="ml-auto text-pine-950/30" />
          </a>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Landing
// ---------------------------------------------------------------------------
function Landing() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-pine-950/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-pine-950/60">
                <div className="h-1.5 w-1.5 rounded-full bg-lime-500" />
                #1 Invoicing Tool for Landscapers
              </div>
              <h1 className="mt-8 text-5xl font-black leading-[1.1] text-pine-950 lg:text-7xl">
                Smarter Invoicing, <br />
                <span className="text-transparent" style={{ WebkitTextStroke: '1px #14532d' }}>Faster Payments</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-pine-950/60">
                Stop chasing checks and paper trails. GrassBuddy helps lawn care professionals send clean, professional invoices and get paid instantly via Stripe or PayPal.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link className={primary + " px-8 py-4 text-lg"} to="/checkout">
                  Get Started for $9.99 <ArrowRight size={20} />
                </Link>
              </div>
              <div className="mt-12 flex items-center gap-8">
                <StatItem label="Invoices Sent" value="12K+" />
                <StatDivider />
                <StatItem label="Revenue Tracked" value="$2.4M+" />
                <StatDivider />
                <StatItem label="Happy Founders" value="1.5K+" />
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 flex justify-center">
                <div className="h-[400px] w-[400px] overflow-hidden rounded-full border-[15px] border-white shadow-lift lg:h-[500px] lg:w-[500px]">
                  <img src={asset("hero-pro.png")} alt="Lawn care professional using GrassBuddy Pro" className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-10 -left-10 z-20 h-48 w-48 overflow-hidden rounded-full border-[10px] border-white shadow-lift lg:h-64 lg:w-64">
                <img src={asset("hero-lawn.png")} alt="Perfectly manicured lawn" className="h-full w-full object-cover" />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime-400/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-pine-900/5 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="bg-pine-950 py-10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Trusted Payment Partners</p>
          <div className="flex flex-wrap items-center justify-center gap-12 text-xl font-black tracking-tight text-white/20">
            <span>PayPal</span>
            <span>Stripe</span>
            <span>QuickBooks</span>
            <span>FreshBooks</span>
            <span>Square</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-mist py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h4 className="text-sm font-black uppercase tracking-widest text-lime-600">Built for Growth</h4>
          <h2 className="mt-4 text-4xl font-black text-pine-950 lg:text-5xl">Professional Tools to Run <br />Your Lawn Care Business.</h2>
          
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <FeatureCard 
              icon={<Clock size={24} />} 
              title="Lightning Fast Invoices" 
              desc="Draft and send professional invoices from your truck or the field in under 60 seconds. No more late nights at the desk."
            />
            <FeatureCard 
              icon={<Wallet size={24} />} 
              title="Integrated Payments" 
              desc="Add Stripe or PayPal links directly to your invoices so your customers can pay you instantly with a single click."
            />
            <FeatureCard 
              icon={<Users size={24} />} 
              title="Customer Management" 
              desc="Keep a detailed history of your residential and commercial clients. Track who owes you and who's all paid up."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-3xl font-black text-pine-950">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-pine-950/50">{label}</p>
    </div>
  );
}

function StatDivider() {
  return <div className="h-8 w-px bg-pine-950/10" />;
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-3xl bg-white p-10 text-left shadow-soft transition hover:-translate-y-2 hover:shadow-lift">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pine-950 text-lime-400">
        {icon}
      </div>
      <h3 className="mt-6 text-xl font-black text-pine-950">{title}</h3>
      <p className="mt-4 leading-relaxed text-pine-950/60">{desc}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pricing & Checkout
// ---------------------------------------------------------------------------
function Pricing() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center">
        <h4 className="text-sm font-black uppercase tracking-widest text-lime-600">Our Pricing</h4>
        <h1 className="mt-4 text-5xl font-black text-pine-950 lg:text-6xl">Founders Lifetime Deal</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-pine-950/60">
          Get unlimited access to GrassBuddy Version 1 and all future founder updates for a single, small payment.
        </p>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        <DealCard title="Founder Lifetime" price="$9.99" subtitle="one time" active features={dealFeatures["Founder Lifetime"]} />
        <DealCard title="Future Pro Plan" price="$19" subtitle="per month" features={dealFeatures["Future Pro Plan"]} />
        <DealCard title="Future Business" price="$49" subtitle="per month" features={dealFeatures["Future Business Plan"]} />
      </div>

      <div className="mt-12 text-center">
        <Link className={paypalCta + " px-10 py-5 text-lg"} to="/checkout">
          <Wallet size={20} /> Checkout with PayPal
        </Link>
      </div>
    </main>
  );
}

const dealFeatures: Record<string, string[]> = {
  "Founder Lifetime": ["Unlimited invoices", "Residential + commercial templates", "PDF downloads", "Stripe/PayPal payment links", "Future founder updates"],
  "Future Pro Plan": ["Unlimited invoices", "Residential + commercial templates", "PDF downloads", "Team collaboration", "Priority support"],
  "Future Business Plan": ["Everything in Pro", "Multiple team members", "Custom branding", "Advanced reporting", "API access"],
};

function DealCard({ title, price, subtitle, active, features }: { title: string; price: string; subtitle: string; active?: boolean; features: string[] }) {
  return (
    <div className={(active ? "bg-pine-950 text-white shadow-lift ring-4 ring-lime-400" : "bg-white text-pine-950 border border-line") + " rounded-[2.5rem] p-10 transition-all duration-500"}>
      <h3 className="text-sm font-black uppercase tracking-widest text-lime-400">{title}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-black">{price}</span>
        <span className={active ? "text-white/50" : "text-pine-950/50"}>{subtitle}</span>
      </div>
      <ul className="mt-10 space-y-4">
        {features.map(f => (
          <li key={f} className="flex items-center gap-3 text-sm font-medium">
            <div className={(active ? "bg-lime-400 text-pine-950" : "bg-pine-950 text-lime-400") + " flex h-5 w-5 items-center justify-center rounded-full"}>
              <Check size={12} strokeWidth={4} />
            </div>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <Link to="/checkout" className={active ? primary + " w-full py-4" : secondary + " w-full py-4"}>
          Select Plan
        </Link>
      </div>
    </div>
  );
}

function Checkout() {
  const [email, setEmail] = useState("");
  const href = paypalCheckoutUrl;
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="rounded-[2.5rem] border border-line bg-white p-10 shadow-soft">
          <h4 className="text-sm font-black uppercase tracking-widest text-lime-600">Checkout</h4>
          <h1 className="mt-4 text-4xl font-black text-pine-950">Founder Lifetime Deal</h1>
          <p className="mt-4 text-pine-950/60">Pay once through PayPal and get lifetime access to GrassBuddy.</p>
          
          <div className="mt-8 rounded-3xl bg-pine-950 p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">Today's Price</p>
            <p className="mt-2 text-6xl font-black text-lime-400">$9.99</p>
            <p className="mt-4 text-sm font-bold text-white/80">One-time founder purchase</p>
          </div>

          <div className="mt-8 space-y-6">
            <label className={label + " block"}>
              Founder email
              <input className={input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
            </label>
            <a className={paypalCta + " w-full py-5 text-lg font-black"} href={href} target="_blank" rel="noreferrer">
              <Wallet size={20} /> Continue to PayPal
            </a>
            <p className="text-center text-xs font-medium text-pine-950/40 italic">
              After payment, use this same email to create your account.
            </p>
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-pine-950 p-10 text-white">
          <h2 className="text-2xl font-black">Included for Founders</h2>
          <p className="mt-2 text-white/50">Everything you need to run your business professionaly.</p>
          
          <div className="mt-10 space-y-6">
            {dealFeatures["Founder Lifetime"].map(f => (
              <div key={f} className="flex items-center gap-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400 text-pine-950">
                  <Check size={14} strokeWidth={4} />
                </div>
                <span className="font-bold text-white/90">{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-pine-950">
                <Star size={20} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-black">5.0 Rating</p>
                <p className="text-xs text-white/50">by 2,000+ Landscapers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      const user = { id: "demo-founder", email: email || "founder@grassbuddy.app", name: "GrassBuddy Founder" };
      setUser(user);
      nav("/dashboard");
    }

    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-24">
      <div className="rounded-[2.5rem] border border-line bg-white p-10 shadow-soft">
        <h1 className="text-4xl font-black text-pine-950 leading-tight">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        {usingDemoStorage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-700">
            <Clock size={14} /> Demo mode: add Supabase keys for real accounts.
          </div>
        )}
        <form onSubmit={submit} className="mt-8 space-y-6">
          <label className={label + " block"}>
            Email Address
            <input className={input} value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@company.com" />
          </label>
          <label className={label + " block"}>
            Password
            <input className={input} value={password} onChange={e => setPassword(e.target.value)} type="password" required minLength={6} placeholder="••••••••" />
          </label>
          {error && <p className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600">{error}</p>}
          <button className={primary + " w-full py-4 text-lg font-black"} disabled={loading}>
            {loading ? "Working..." : mode === "signup" ? "Create Account" : "Log In"}
          </button>
        </form>
        <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-pine-950/40">
          {mode === "signup"
            ? <Link className="text-pine-950 underline decoration-lime-400 decoration-2 underline-offset-4" to="/login">Already have an account? Log in</Link>
            : <Link className="text-pine-950 underline decoration-lime-400 decoration-2 underline-offset-4" to="/signup">No account? Sign up</Link>
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
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-lime-600">Overview</h4>
          <h1 className="mt-2 text-4xl font-black text-pine-950">Dashboard</h1>
          <p className="mt-2 text-pine-950/60 font-medium">Welcome back, {user.name}!</p>
        </div>
        <Link className={primary + " px-8"} to="/invoices/new"><Plus size={18} /> New Invoice</Link>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Total Revenue" value={money(revenue)} icon={<BadgeDollarSign />} color="bg-lime-400" />
        <Metric title="Paid Invoices" value={counts("paid")} icon={<Check />} color="bg-pine-100" />
        <Metric title="Unpaid Invoices" value={counts("unpaid")} icon={<Clock />} color="bg-mist" />
        <Metric title="Overdue" value={counts("overdue")} icon={<Plus size={18} className="rotate-45" />} color="bg-red-50" />
      </div>

      <section className="mt-12 overflow-hidden rounded-[2.5rem] border border-line bg-white shadow-soft">
        <div className="border-b border-line bg-mist/50 px-8 py-5 text-sm font-black uppercase tracking-widest text-pine-950/40">
          Recent Invoices
        </div>
        <div className="divide-y divide-line">
          {invoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mist text-pine-950/20">
                <Leaf size={32} />
              </div>
              <p className="mt-4 font-black text-pine-950/40">No invoices yet. Let's grow!</p>
              <Link to="/invoices/new" className="mt-4 text-sm font-bold text-lime-600 hover:underline">Create your first one</Link>
            </div>
          )}
          {invoices.map(inv => (
            <div key={inv.id} className="grid items-center gap-6 p-8 transition hover:bg-mist/30 md:grid-cols-[1fr_auto_auto_auto]">
              <Link to={"/invoices/" + inv.id} className="group">
                <p className="text-sm font-black uppercase tracking-widest text-pine-950 group-hover:text-lime-600">{inv.invoiceNumber}</p>
                <p className="mt-1 text-sm font-medium text-pine-950/50">{inv.customer.name || "Unnamed customer"} · {inv.kind}</p>
              </Link>
              <span className="text-lg font-black text-pine-950">{money(total(inv))}</span>
              <StatusSelect invoice={inv} setInvoices={setInvoices} invoices={invoices} userId={user.id} />
              <Link to={"/invoices/" + inv.id} className="flex h-10 w-10 items-center justify-center rounded-full bg-pine-950 text-white transition hover:bg-lime-400 hover:text-pine-950">
                <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-[2rem] border border-line bg-white p-8 shadow-soft transition hover:shadow-lift">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} text-pine-950`}>
        {icon}
      </div>
      <p className="mt-6 text-sm font-black uppercase tracking-widest text-pine-950/40">{title}</p>
      <p className="mt-2 text-3xl font-black text-pine-950">{value}</p>
    </div>
  );
}

function StatusSelect({ invoice, invoices, setInvoices, userId }: { invoice: Invoice; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; userId: string }) {
  const color = 
    invoice.status === "paid" ? "bg-lime-400 text-pine-950" : 
    invoice.status === "overdue" ? "bg-red-500 text-white" : 
    "bg-mist text-pine-950/60";
    
  return (
    <select className={`${color} h-10 rounded-full px-4 text-xs font-black uppercase tracking-widest outline-none transition cursor-pointer appearance-none text-center`} value={invoice.status} onChange={e => {
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
    <main className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[2.5rem] border border-line bg-white p-10 shadow-soft">
        <h1 className="text-3xl font-black text-pine-950">Create Invoice</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <label className={label}>Business Name<input className={input} value={invoice.businessName} onChange={e => update({ businessName: e.target.value })} /></label>
          <LogoUpload onLogo={logo => update({ businessLogo: logo })} />
          <label className={label}>Customer Name<input className={input} value={invoice.customer.name} onChange={e => update({ customer: { ...invoice.customer, name: e.target.value } })} /></label>
          <label className={label}>Customer Contact<input className={input} value={invoice.customer.email || invoice.customer.phone} onChange={e => update({ customer: { ...invoice.customer, email: e.target.value } })} /></label>
          <label className={label + " md:col-span-2"}>Customer Address<input className={input} value={invoice.customer.address} onChange={e => update({ customer: { ...invoice.customer, address: e.target.value } })} /></label>
          <label className={label}>Invoice Number<input className={input} value={invoice.invoiceNumber} onChange={e => update({ invoiceNumber: e.target.value })} /></label>
          <label className={label}>Due Date<input className={input} type="date" value={invoice.dueDate} onChange={e => update({ dueDate: e.target.value })} /></label>
        </div>
        
        <div className="mt-8 flex rounded-2xl bg-mist p-1.5">
          <button className={(invoice.kind === "residential" ? "bg-white shadow-soft text-pine-950" : "text-pine-950/40") + " flex-1 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition"} onClick={() => update({ kind: "residential" })}>Residential</button>
          <button className={(invoice.kind === "commercial" ? "bg-white shadow-soft text-pine-950" : "text-pine-950/40") + " flex-1 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition"} onClick={() => update({ kind: "commercial" })}>Commercial</button>
        </div>

        <LineItems invoice={invoice} setInvoice={setInvoice} />

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <label className={label}>Tax Rate (%)<input className={input} type="number" value={invoice.taxRate} onChange={e => update({ taxRate: Number(e.target.value) })} /></label>
          <label className={label}>Discount Amount<input className={input} type="number" value={invoice.discount} onChange={e => update({ discount: Number(e.target.value) })} /></label>
          <label className={label}>Notes<textarea className={input + " h-32"} value={invoice.notes} onChange={e => update({ notes: e.target.value })} /></label>
          <label className={label}>Terms<textarea className={input + " h-32"} value={invoice.terms} onChange={e => update({ terms: e.target.value })} /></label>
        </div>
        <button className={primary + " mt-10 w-full py-5 text-lg"} onClick={save}><Check size={20} /> Save Invoice</button>
      </section>
      <div className="sticky top-28 h-fit">
        <InvoicePreview invoice={invoice} payments={payments} />
      </div>
    </main>
  );
}

function LogoUpload({ onLogo }: { onLogo: (logo: string) => void }) {
  return (
    <label className={label}>
      Logo Upload
      <div className="relative group">
        <input className={input + " opacity-0 absolute inset-0 z-10 cursor-pointer"} type="file" accept="image/*" onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onLogo(String(reader.result));
          reader.readAsDataURL(file);
        }} />
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-line px-4 py-3 text-sm font-bold text-pine-950/40 group-hover:border-lime-400 group-hover:bg-lime-50 transition">
          <Leaf size={16} /> Choose Image...
        </div>
      </div>
    </label>
  );
}

function LineItems({ invoice, setInvoice }: { invoice: Invoice; setInvoice: (i: Invoice) => void }) {
  const item = (id: string, patch: Partial<LineItem>) =>
    setInvoice({ ...invoice, items: invoice.items.map(it => it.id === id ? { ...it, ...patch } : it) });
  return (
    <div className="mt-10 space-y-4">
      <h3 className="text-sm font-black uppercase tracking-widest text-pine-950">Service Details</h3>
      {invoice.items.map(it => (
        <div key={it.id} className="grid gap-3 md:grid-cols-[1fr_100px_130px]">
          <input className={input} value={it.description} placeholder="Service Description" onChange={e => item(it.id, { description: e.target.value })} />
          <input className={input} type="number" value={it.quantity} placeholder="Qty" onChange={e => item(it.id, { quantity: Number(e.target.value) })} />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-pine-950/30">$</span>
            <input className={input + " pl-8"} type="number" value={it.price} placeholder="Price" onChange={e => item(it.id, { price: Number(e.target.value) })} />
          </div>
        </div>
      ))}
      <button className={secondary + " bg-mist text-pine-950 border-none px-6 py-3"} onClick={() => setInvoice({ ...invoice, items: [...invoice.items, { id: crypto.randomUUID(), description: "", quantity: 1, price: 0 }] })}>
        <Plus size={16} /> Add Service
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
  if (!invoice) return <main className="p-20 text-center font-black">Invoice not found.</main>;
  const copy = () => {
    navigator.clipboard.writeText(location.origin + "/invoices/" + invoice.id);
    alert("Invoice link copied!");
  };
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <button className={secondary} onClick={() => window.print()}><Download size={18} /> Download PDF</button>
          <button className={secondary} onClick={copy}><Copy size={18} /> Share Link</button>
        </div>
        <StatusSelect invoice={invoice} invoices={invoices} setInvoices={setInvoices} userId={user.id} />
      </div>
      <InvoicePreview invoice={invoice} payments={payments} />
    </main>
  );
}

function InvoicePreview({ invoice, payments, compact }: { invoice: Invoice; payments: PaymentSettings; compact?: boolean }) {
  const payLink = payments.preferredProvider === "stripe" ? payments.stripeLink : payments.paypalLink;
  return (
    <section className={(compact ? "scale-[0.8] origin-top " : "print-sheet ") + "rounded-[2.5rem] border border-line bg-white p-10 shadow-lift"}>
      <div className="flex items-start justify-between gap-6 border-b border-line pb-8">
        <div className="flex items-center gap-4">
          {invoice.businessLogo
            ? <img src={invoice.businessLogo} className="h-16 w-16 rounded-2xl object-cover" />
            : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pine-950 text-lime-400"><Leaf size={32} /></div>
          }
          <div>
            <h2 className="text-2xl font-black text-pine-950 leading-none">{invoice.businessName || "Your Business"}</h2>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-lime-600">{invoice.kind} Invoice</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-black uppercase tracking-widest text-pine-950/30">Invoice</p>
          <p className="text-xl font-black text-pine-950">{invoice.invoiceNumber}</p>
          <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${invoice.status === "paid" ? "bg-lime-400" : "bg-red-50 text-red-600"}`}>
            {invoice.status}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 text-sm md:grid-cols-2">
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-pine-950/30">Bill to</h4>
          <p className="mt-4 text-lg font-black text-pine-950">{invoice.customer.name || "Customer Name"}</p>
          <p className="mt-1 font-bold text-pine-950/50">{invoice.customer.email || invoice.customer.phone}<br />{invoice.customer.address}</p>
        </div>
        <div className="md:text-right">
          <div className="mb-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-pine-950/30">Invoice Date</h4>
            <p className="mt-1 font-black text-pine-950">{invoice.invoiceDate}</p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-pine-950/30">Due Date</h4>
            <p className="mt-1 font-black text-pine-950">{invoice.dueDate}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 overflow-hidden rounded-3xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-pine-950/40">Service</th>
              <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-pine-950/40">Qty</th>
              <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-pine-950/40">Price</th>
              <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-pine-950/40">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {invoice.items.map(it => (
              <tr key={it.id}>
                <td className="px-6 py-4 font-bold text-pine-950">{it.description}</td>
                <td className="px-6 py-4 text-right font-bold text-pine-950/50">{it.quantity}</td>
                <td className="px-6 py-4 text-right font-bold text-pine-950/50">{money(it.price)}</td>
                <td className="px-6 py-4 text-right font-black text-pine-950">{money(it.quantity * it.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 ml-auto max-w-xs space-y-3">
        <Row label="Subtotal" value={money(subtotal(invoice))} />
        <Row label="Tax" value={money(taxAmount(invoice))} />
        <Row label="Discount" value={"-" + money(invoice.discount)} />
        <div className="mt-6 border-t-[3px] border-pine-950 pt-4">
          <Row label="Total Amount" value={money(total(invoice))} strong />
        </div>
      </div>

      <div className="mt-12 grid gap-10 border-t border-line pt-10 text-sm md:grid-cols-2">
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-pine-950/30">Notes</h4>
          <p className="mt-2 font-medium leading-relaxed text-pine-950/60">{invoice.notes || "Thank you for choosing GrassBuddy! We appreciate your business."}</p>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-pine-950/30">Terms</h4>
          <p className="mt-2 font-medium leading-relaxed text-pine-950/60">{invoice.terms || "Please pay by the due date. A 5.0% fee may apply to late payments."}</p>
        </div>
      </div>

      {payLink && !compact && (
        <a className={primary + " no-print mt-12 w-full py-5 text-lg"} href={payLink} target="_blank">
          <Wallet size={20} /> Pay Invoice Now
        </a>
      )}
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className={`text-xs font-black uppercase tracking-widest ${strong ? "text-pine-950" : "text-pine-950/40"}`}>{label}</span>
      <span className={strong ? "text-3xl font-black text-pine-950" : "text-lg font-bold text-pine-950"}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
function Payments({ user, settings, setSettings }: { user: DemoUser; settings: PaymentSettings; setSettings: (s: PaymentSettings) => void }) {
  const [draft, setDraft] = useState(settings);
  return (
    <SettingsPanel title="Payment settings" icon={<BadgeDollarSign size={24} />}>
      <label className={label + " block"}>Stripe Payment Link<input className={input} value={draft.stripeLink} onChange={e => setDraft({ ...draft, stripeLink: e.target.value })} /></label>
      <label className={label + " block"}>PayPal link<input className={input} value={draft.paypalLink} onChange={e => setDraft({ ...draft, paypalLink: e.target.value })} /></label>
      <label className={label + " block"}>
        Preferred payment button
        <select className={input} value={draft.preferredProvider} onChange={e => setDraft({ ...draft, preferredProvider: e.target.value as PaymentSettings["preferredProvider"] })}>
          <option value="stripe">Stripe</option>
          <option value="paypal">PayPal</option>
        </select>
      </label>
      <button className={primary + " w-full"} onClick={() => { store.setPayments(user.id, draft); setSettings(draft); }}>Save payment settings</button>
    </SettingsPanel>
  );
}

function Branding({ user, branding, setBranding }: { user: DemoUser; branding: BrandingSettings; setBranding: (b: BrandingSettings) => void }) {
  const [draft, setDraft] = useState(branding);
  return (
    <SettingsPanel title="Branding" icon={<Settings size={24} />}>
      <label className={label + " block"}>Business name<input className={input} value={draft.businessName} onChange={e => setDraft({ ...draft, businessName: e.target.value })} /></label>
      <LogoUpload onLogo={logo => setDraft({ ...draft, logo })} />
      <button className={primary + " w-full"} onClick={() => { store.setBranding(user.id, draft); setBranding(draft); }}>Save branding</button>
    </SettingsPanel>
  );
}

function SettingsPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <section className="rounded-[2.5rem] border border-line bg-white p-10 shadow-soft">
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pine-950 text-lime-400">
            {icon}
          </div>
          <h1 className="text-3xl font-black text-pine-950">{title}</h1>
        </div>
        <div className="space-y-8">{children}</div>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Root app — session management
// ---------------------------------------------------------------------------
export default function App() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);

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

  if (!authReady) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-mist border-t-lime-500" />
    </div>
  );

  return (
    <Shell user={user} onLogout={logout}>
      {usingDemoStorage && (
        <div className="no-print bg-amber-50 px-6 py-2 text-center text-[10px] font-black uppercase tracking-widest text-amber-700">
          Demo Mode: All data is saved locally. Connect Supabase for cloud sync.
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
