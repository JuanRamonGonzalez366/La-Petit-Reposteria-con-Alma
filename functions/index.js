import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import mercadopago from "mercadopago";

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ===== Stripe =====
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const toStripeLines = (items=[]) =>
  items.map(i => ({
    price_data: {
      currency: "mxn",
      product_data: { name: i.title, images: i.img ? [i.img] : [] },
      unit_amount: Math.round(Number(i.price)*100),
    },
    quantity: i.qty,
  }));

app.post("/create-checkout/stripe", async (req, res) => {
  try {
    const { items=[], shipping={}, customer={} } = req.body;

    const line_items = toStripeLines(items);
    if (shipping?.amount) line_items.push({
      price_data: { currency:"mxn", product_data:{ name:"Envío" }, unit_amount: Math.round(shipping.amount*100) },
      quantity: 1
    });
    if (shipping?.express) line_items.push({
      price_data: { currency:"mxn", product_data:{ name:"Servicio Express" }, unit_amount: Math.round((shipping.expressFee||0)*100) },
      quantity: 1
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: customer.email,
      success_url: `${process.env.PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_URL}/checkout/cancel`,
      billing_address_collection: "auto",
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "stripe_failed" });
  }
});

// Webhook Stripe (opcional: completa para escribir orders)
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook verify failed", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await admin.firestore().collection("orders").add({
      provider: "stripe",
      sessionId: session.id,
      status: "pagado",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  res.json({ received: true });
});

// ===== Mercado Pago =====
mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

app.post("/create-checkout/mp", async (req, res) => {
  try {
    const { items=[], shipping={} } = req.body;

    const preference = {
      items: items.map(i => ({
        title: i.title,
        quantity: i.qty,
        unit_price: Number(i.price),
        currency_id: "MXN"
      })),
      back_urls: {
        success: `${process.env.PUBLIC_URL}/checkout/success`,
        failure: `${process.env.PUBLIC_URL}/checkout/cancel`,
        pending: `${process.env.PUBLIC_URL}/checkout/pending`,
      },
      auto_return: "approved",
    };

    if (shipping?.amount) preference.items.push({ title:"Envío", quantity:1, unit_price:Number(shipping.amount), currency_id:"MXN" });
    if (shipping?.express) preference.items.push({ title:"Servicio Express", quantity:1, unit_price:Number(shipping.expressFee||0), currency_id:"MXN" });

    const { body } = await mercadopago.preferences.create(preference);
    res.json({ url: body.init_point });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "mp_failed" });
  }
});

export const api = functions.https.onRequest(app);
