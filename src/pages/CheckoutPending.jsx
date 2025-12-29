import React from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function CheckoutPending() {
  const [params] = useSearchParams();
  const orderId = params.get("external_reference");

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] px-4 sm:px-6 lg:px-12 pb-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-rose/30 p-6 shadow-sm">
        <h1 className="font-display text-3xl text-wine mb-3">Pago pendiente ⏳</h1>
        <p className="text-wineDark/80">
          Tu pago está en proceso. Cuando Mercado Pago lo confirme, tu pedido se actualizará automáticamente.
        </p>

        {orderId && (
          <p className="mt-4 text-sm text-wineDark/70">
            <strong>Pedido:</strong> {orderId}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Link to="/" className="bg-wine text-cream px-4 py-2 rounded-lg hover:opacity-90 transition">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
