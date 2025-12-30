import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCart } from "../context/CartContext";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderId = useMemo(() => params.get("orderId"), [params]);
  const { clearCart } = useCart();

  const [status, setStatus] = useState("checking");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    // limpia carrito apenas llegas a success (si prefieres, hazlo cuando status === 'paid')
    clearCart();

    const ref = doc(db, "orders", orderId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setStatus("not_found");
        return;
      }
      const data = snap.data();
      setOrder(data);

      // Si webhook ya pegó, aquí lo verás
      if (data?.status === "paid") setStatus("paid");
      else if (data?.status === "pending_payment") setStatus("pending");
      else if (data?.status === "payment_failed") setStatus("failed");
      else setStatus(data?.status || "checking");
    });

    return () => unsub();
  }, [orderId, clearCart]);

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] px-4 sm:px-6 lg:px-12 pb-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-rose/30 p-6 shadow-sm">
        <h1 className="font-display text-3xl text-wine mb-2">Pago recibido</h1>

        {!orderId && (
          <p className="text-wineDark/70">Falta el parámetro <b>orderId</b> en la URL.</p>
        )}

        {orderId && status === "checking" && (
          <p className="text-wineDark/70">Validando pago… (esperando confirmación)</p>
        )}

        {orderId && status === "paid" && (
          <>
            <p className="text-wineDark/80">
              Tu pago fue <b>aprobado</b>. El pedido quedó registrado correctamente.
            </p>
            <p className="text-sm text-wineDark/60 mt-2">
              Número de pedido: <b>{orderId}</b>
            </p>
          </>
        )}

        {orderId && status === "pending" && (
          <>
            <p className="text-wineDark/80">
              El pago está <b>pendiente</b>. En cuanto Mercado Pago lo confirme, el sistema actualizará el pedido.
            </p>
            <p className="text-sm text-wineDark/60 mt-2">
              Número de pedido: <b>{orderId}</b>
            </p>
          </>
        )}

        {orderId && status === "failed" && (
          <>
            <p className="text-wineDark/80">
              El pago no se pudo confirmar. Si se te cobró, revisa en Mercado Pago o contacta soporte.
            </p>
            <p className="text-sm text-wineDark/60 mt-2">
              Número de pedido: <b>{orderId}</b>
            </p>
          </>
        )}

        {orderId && status === "not_found" && (
          <p className="text-wineDark/80">
            No encontré el pedido en la base de datos. Revisa el número.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Link to="/" className="bg-wine text-cream px-4 py-2 rounded-lg hover:opacity-90 transition">
            Ir al inicio
          </Link>
          <Link to="/checkout" className="bg-red text-cream px-4 py-2 rounded-lg hover:opacity-90 transition">
            Volver a checkout
          </Link>
        </div>

        {order?.mp?.paymentId && (
          <p className="text-xs text-wineDark/60 mt-4">
            MP Payment ID: {order.mp.paymentId}
          </p>
        )}
      </div>
    </main>
  );
}
