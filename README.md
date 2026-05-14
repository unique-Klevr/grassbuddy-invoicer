# GrassBuddy Invoicer

Demo-ready V1 micro SaaS for lawn care and home service invoice generation.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Supabase

Copy `.env.example` to `.env` and add Supabase values, then run `supabase/schema.sql` in your Supabase SQL editor. The app includes a local demo fallback, so it can be shown without live Supabase credentials.

## PayPal founder checkout

Create a PayPal checkout button or payment link for the $9.99 founder deal, then set both values before launch:

```bash
VITE_PAYPAL_FOUNDER_CHECKOUT_URL=https://www.paypal.com/ncp/payment/Z2TLRXLMMF57S
PAYPAL_FOUNDER_CHECKOUT_URL=https://www.paypal.com/ncp/payment/Z2TLRXLMMF57S
```

All founder CTAs route to `/checkout`, and the checkout button opens PayPal.
