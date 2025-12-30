import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    const publicUrl =
      process.env.PUBLIC_URL || `https://${req.headers.host}`;

    if (!accessToken) return res.status(500).json({ error: "missing_MP_ACCESS_TOKEN" });

    mercadopago.configure({ access_token: accessToken });

    const { items = [], shipping = {}, orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "missing_orderId" });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "empty_items" });

    const mpItems = items.map((i) => ({
      title: i.title,
      quantity: Number(i.qty || 1),
      unit_price: Number(i.price || 0),
      currency_id: "MXN",
    }));

    if (shipping?.amount) {
      mpItems.push({
        title: "Envío",
        quantity: 1,
        unit_price: Number(shipping.amount),
        currency_id: "MXN",
      });
    }

    if (shipping?.express) {
      mpItems.push({
        title: "Servicio Express",
        quantity: 1,
        unit_price: Number(shipping.expressFee || 0),
        currency_id: "MXN",
      });
    }

    const preference = {
      items: mpItems,

      external_reference: orderId,
      metadata: { orderId },

      back_urls: {
        success: `${publicUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}`,
        failure: `${publicUrl}/checkout/cancel?orderId=${encodeURIComponent(orderId)}`,
        pending: `${publicUrl}/checkout/pending?orderId=${encodeURIComponent(orderId)}`,
      },

      auto_return: "approved",

      notification_url: `${publicUrl}/api/mp/webhook`,
    };

    const { body } = await mercadopago.preferences.create(preference);

    return res.status(200).json({
      url: body.init_point,
      preferenceId: body.id,
    });
  } catch (e) {
    console.error("create-checkout error:", e);
    return res.status(500).json({ error: "mp_failed" });
  }
}
