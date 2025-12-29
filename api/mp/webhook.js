import mercadopago from "mercadopago";
import admin from "firebase-admin";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function initFirebaseAdmin() {
  if (admin.apps.length) return;

  const projectId = mustEnv("FIREBASE_PROJECT_ID");
  const clientEmail = mustEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = mustEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

function mapStatus(mpStatus) {
  // Estados típicos: approved, pending, rejected, cancelled
  if (mpStatus === "approved") return "paid";
  if (mpStatus === "pending" || mpStatus === "in_process") return "pending_payment";
  if (mpStatus === "rejected") return "rejected";
  if (mpStatus === "cancelled") return "cancelled";
  return "unknown";
}

export default async function handler(req, res) {
  // MercadoPago puede llamar GET o POST dependiendo config
  try {
    const MP_ACCESS_TOKEN = mustEnv("MP_ACCESS_TOKEN");
    mercadopago.configure({ access_token: MP_ACCESS_TOKEN });

    initFirebaseAdmin();
    const db = admin.firestore();

    // 1) Extraer paymentId
    // MP suele mandar ?type=payment&data.id=123 o ?topic=payment&id=123 (varía)
    const q = req.query || {};
    const body = req.body || {};

    const paymentId =
      q["data.id"] ||
      q["id"] ||
      body?.data?.id ||
      body?.id;

    const topic = q.type || q.topic || body?.type || body?.topic;

    // Si no es pago, responde OK
    if (topic && String(topic).toLowerCase() !== "payment") {
      return res.status(200).json({ ok: true, ignored: true });
    }

    if (!paymentId) {
      // No tenemos nada que procesar, pero respondemos 200 para que MP no reintente infinito
      return res.status(200).json({ ok: true, no_payment_id: true });
    }

    // 2) Consultar pago a Mercado Pago
    const { body: payment } = await mercadopago.payment.findById(paymentId);

    const orderId = payment?.external_reference || payment?.metadata?.orderId;
    if (!orderId) {
      return res.status(200).json({ ok: true, missing_orderId: true });
    }

    const newStatus = mapStatus(payment?.status);

    // 3) Actualizar Firestore
    await db.collection("orders").doc(String(orderId)).set(
      {
        status: newStatus,
        provider: "mercado_pago",
        paymentMethod: "mp",
        mp: {
          paymentId: String(paymentId),
          status: payment?.status || null,
          status_detail: payment?.status_detail || null,
          transaction_amount: payment?.transaction_amount || null,
          currency_id: payment?.currency_id || null,
          date_approved: payment?.date_approved || null,
          payer_email: payment?.payer?.email || null,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("webhook error:", e);
    // 200 para evitar reintentos agresivos si tu servidor tuvo un bug momentáneo.
    return res.status(200).json({ ok: false });
  }
}
