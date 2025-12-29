import mercadopago from "mercadopago";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  try {
    const MP_ACCESS_TOKEN = mustEnv("MP_ACCESS_TOKEN");
    const PUBLIC_URL = mustEnv("PUBLIC_URL");

    mercadopago.configure({ access_token: MP_ACCESS_TOKEN });

    const { items = [], shipping = {}, orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "missing_orderId" });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "empty_items" });

    const preferenceItems = items.map((i) => ({
      title: String(i.title || "Producto"),
      quantity: Number(i.qty || 1),
      unit_price: Number(i.price || 0),
      currency_id: "MXN",
    }));

    // Agrega envío como línea extra (opcional)
    if (shipping?.amount) {
      preferenceItems.push({
        title: "Envío",
        quantity: 1,
        unit_price: Number(shipping.amount),
        currency_id: "MXN",
      });
    }
    if (shipping?.express) {
      preferenceItems.push({
        title: "Servicio Express",
        quantity: 1,
        unit_price: Number(shipping.expressFee || 0),
        currency_id: "MXN",
      });
    }

    const preference = {
      items: preferenceItems,

      // CLAVE: liga tu pago con tu orderId
      external_reference: orderId,
      metadata: { orderId },

      back_urls: {
        success: `${PUBLIC_URL}/checkout/success`,
        failure: `${PUBLIC_URL}/checkout/cancel`,
        pending: `${PUBLIC_URL}/checkout/pending`,
      },
      auto_return: "approved",

      notification_url: `${PUBLIC_URL}/api/mp/webhook`,
    };

    const { body } = await mercadopago.preferences.create(preference);
    return res.status(200).json({
      url: body?.init_point,
      preferenceId: body?.id,
    });
  } catch (e) {
    console.error("create-checkout error:", e);
    return res.status(500).json({ error: "mp_failed" });
  }
}
