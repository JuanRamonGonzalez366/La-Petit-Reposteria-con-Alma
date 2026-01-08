import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import mercadopago from "mercadopago";

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ===== Mercado Pago =====
mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

app.post("/create-checkout/mp", async (req, res) => {
  try {
    const { items = [], shipping = {} } = req.body;

    const preference = {
      items: items.map((i) => ({
        title: i.title,
        quantity: i.qty,
        unit_price: Number(i.price),
        currency_id: "MXN",
      })),
      back_urls: {
        success: `${process.env.PUBLIC_URL}/0NcCoYMCZ9bmJqits3+o5Z+emkUHfVRJaiUvORJZP8TzXO6cQy5nDxfTwRcWZjhn`,
        failure: `${process.env.PUBLIC_URL}/HjYqq8/EN5361YMLgUtnh/9DIImr+9P4viv80ztopWy05SUi2hUiBEkmMWGU5FJB`,
        pending: `${process.env.PUBLIC_URL}/eW+S7H8Amt+oNl+RBNgW8ON218Y499nUkFUp9mtJYvwKcyOgmQJkRJ7HqEZ3VGH`,
      },
      auto_return: "approved",
    };

    // Envío y express como líneas extra (solo para pago con MP)
    if (shipping?.amount) {
      preference.items.push({
        title: "Envío",
        quantity: 1,
        unit_price: Number(shipping.amount),
        currency_id: "MXN",
      });
    }
    if (shipping?.express) {
      preference.items.push({
        title: "Servicio Express",
        quantity: 1,
        unit_price: Number(shipping.expressFee || 0),
        currency_id: "MXN",
      });
    }

    const { body } = await mercadopago.preferences.create(preference);
    res.json({ url: body.init_point });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "mp_failed" });
  }
});

// Export principal del API (Express)
export const api = functions.https.onRequest(app);
