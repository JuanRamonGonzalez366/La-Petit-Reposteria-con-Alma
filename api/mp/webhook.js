// /api/mp/webhook.js
import { MercadoPagoConfig, Payment } from "mercadopago";
import admin from "firebase-admin";

function initFirebaseAdmin() {
  if (admin.apps.length) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin env vars");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export default async function handler(req, res) {
  // MP suele mandar POST, pero a veces pega con query params
  if (req.method !== "POST") return res.status(200).send("ok");

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) return res.status(500).json({ error: "missing_MP_ACCESS_TOKEN" });

    initFirebaseAdmin();

    // body: { type: "payment", data: { id: "..." } }
    // query: ?type=payment&data.id=...
    const type = req.body?.type || req.query?.type;
    const paymentId = req.body?.data?.id || req.query?.["data.id"];

    if (type !== "payment" || !paymentId) return res.status(200).send("ignored");

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);

    // 1) Obtener el pago real desde MP
    const payment = await paymentClient.get({ id: String(paymentId) });

    const mpStatus = payment?.status; // approved | pending | rejected | cancelled | in_process...
    const mpStatusDetail = payment?.status_detail || "";
    const orderId = payment?.external_reference; // aquí está tu orderId
    const transactionAmount = payment?.transaction_amount ?? null;

    if (!orderId) return res.status(200).send("no_order_ref");

    // 2) Mapear a tu estado interno
    let nextStatus = "pending_payment";
    if (mpStatus === "approved") nextStatus = "paid";
    else if (mpStatus === "rejected" || mpStatus === "cancelled") nextStatus = "payment_failed";
    else nextStatus = "pending_payment";

    // 3) Actualizar Firestore
    const db = admin.firestore();
    const ref = db.collection("orders").doc(String(orderId));

    await ref.set(
      {
        provider: "mercado_pago",
        paymentMethod: "mp",
        status: nextStatus,
        mp: {
          paymentId: String(paymentId),
          status: mpStatus,
          status_detail: mpStatusDetail,
          transaction_amount: transactionAmount,
          currency_id: payment?.currency_id || "MXN",
          payer_email: payment?.payer?.email || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).send("ok");
  } catch (e) {
    console.error("webhook error:", e);
    // Importante: MP reintenta si no recibe 200 → mejor responder 200 para no saturar.
    return res.status(200).send("ok");
  }
}
