import mercadopago from "mercadopago";
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
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

export default async function handler(req, res) {
  // MP puede pegar por POST, pero respondemos OK siempre para evitar reintentos infinitos
  if (req.method !== "POST") return res.status(200).send("ok");

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) return res.status(200).send("missing_token");

    mercadopago.configure({ access_token: accessToken });
    initFirebaseAdmin();

    const type = req.body?.type || req.query?.type;

    // MP puede mandar: data.id, query["data.id"], query.id
    const paymentId =
      req.body?.data?.id ||
      req.query?.["data.id"] ||
      req.query?.id;

    if (type !== "payment" || !paymentId) {
      return res.status(200).send("ignored");
    }

    const paymentResp = await mercadopago.payment.findById(paymentId);
    const payment = paymentResp?.body;

    const mpStatus = payment?.status; // approved | pending | rejected | cancelled | in_process
    const mpStatusDetail = payment?.status_detail || "";
    const orderId = payment?.external_reference; // tu Firestore docId

    if (!orderId) return res.status(200).send("no_order_ref");

    let nextStatus = "pending_payment";
    if (mpStatus === "approved") nextStatus = "paid";
    else if (mpStatus === "rejected" || mpStatus === "cancelled") nextStatus = "payment_failed";

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
          transaction_amount: payment?.transaction_amount || null,
          paid_amount: payment?.transaction_details?.total_paid_amount || null,
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
    return res.status(200).send("ok");
  }
}
