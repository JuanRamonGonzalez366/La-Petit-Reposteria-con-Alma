import React, { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();

  // MP suele mandar cosas como: payment_id, status, merchant_order_id, external_reference
  const paymentId = params.get("payment_id") || params.get("collection_id");
  const status = params.get("status");
  const orderId = params.get("external_reference");

  useEffect(() => {
    // Tip: aquí NO marques pagado tú.
    // El webhook se encarga. Aquí solo informas.
    // Si quieres, puedes mostrar “confirmando...” unos segundos.
  }, []);

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] px-4 sm:px-6 lg:px-12 pb-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-rose/30 p-6 shadow-sm">
        <h1 className="font-display text-3xl text-wine mb-3">Pago aprobado ✅</h1>
        <p className="text-wineDark/80">
          Tu pago fue registrado correctamente. En breve se confirmará tu pedido en el sistema.
        </p>

        <div className="mt-4 text-sm text-wineDark/70 space-y-1">
          {orderId && <p><strong>Pedido:</strong> {orderId}</p>}
          {paymentId && <p><strong>Pago:</strong> {paymentId}</p>}
          {status && <p><strong>Estatus:</strong> {status}</p>}
        </div>

        <div className="mt-6 flex gap-3">
          <Link to="/" className="bg-wine text-cream px-4 py-2 rounded-lg hover:opacity-90 transition">
            Volver al inicio
          </Link>
          <Link to="/checkout" className="border border-wine/30 text-wine px-4 py-2 rounded-lg hover:bg-rose/20 transition">
            Ver resumen
          </Link>
        </div>
      </div>
    </main>
  );
}
