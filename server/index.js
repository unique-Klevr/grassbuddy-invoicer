import cors from "cors";
import express from "express";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "GrassBuddy Invoicer API" });
});

app.post("/api/payment-links/stripe", (_req, res) => {
  // Future: create Stripe Payment Links with the Stripe Payment Links API.
  res.status(501).json({ message: "Stripe Payment Links API integration placeholder" });
});

app.post("/api/payment-links/paypal", (_req, res) => {
  // Future: create PayPal Checkout sessions with the PayPal Checkout API.
  res.status(501).json({ message: "PayPal Checkout API integration placeholder" });
});

app.get("/api/founder-checkout", (_req, res) => {
  const checkoutUrl = process.env.PAYPAL_FOUNDER_CHECKOUT_URL;
  if (!checkoutUrl) {
    return res.status(400).json({ message: "Set PAYPAL_FOUNDER_CHECKOUT_URL to your live PayPal checkout link." });
  }
  return res.redirect(checkoutUrl);
});

app.listen(port, () => {
  console.log(`GrassBuddy API running on http://localhost:${port}`);
});
