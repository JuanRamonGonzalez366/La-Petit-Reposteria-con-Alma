import React, { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function CheckoutCancel() {
  const [params] = useSearchParams();
  const orderId = useMemo(() => params.get("orderId"), [params]);

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] px-4 sm:px-6 lg:px-12 pb-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-rose/30 p-6 shadow-sm">
        <h1 className="font-display text-3xl text-wine mb-2">Pago cancelado</h1>
        <p className="text-wineDark/80">
          No se completó el pago. Puedes intentarlo de nuevo cuando gustes.
        </p>

        {orderId && (
          <p className="text-sm text-wineDark/60 mt-2">
            Número de pedido: <b>{orderId}</b>
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Link to="/checkout" className="bg-red text-cream px-4 py-2 rounded-lg hover:opacity-90 transition">
            Intentar de nuevo
          </Link>
          <Link to="/" className="bg-wine text-cream px-4 py-2 rounded-lg hover:opacity-90 transition">
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
