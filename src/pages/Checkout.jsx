import React, { useMemo, useState } from "react";
import AddressForm from "../components/AddressForm";
import ShippingPicker from "../components/ShippingPicker";
import { useCart } from "../context/CartContext";
import { mxn } from "../utils/money";
import { createStripeCheckout, createMPCheckout } from "../api/payments";
import { useAuth } from "../auth/AuthProvider";

export default function Checkout() {
  const { cart, subtotal } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState(null); // objeto completo de AddressForm
  const [shipping, setShipping] = useState(null); // objeto de ShippingPicker: { amount, distanceKm, branchId, ... }
  const [loadingPay, setLoadingPay] = useState(false);
  const [error, setError] = useState("");

  const grandTotal = useMemo(() => {
    if (!shipping) return subtotal;
    return subtotal + (shipping.amount || 0) + (shipping.express ? (shipping.expressFee || 0) : 0);
  }, [subtotal, shipping]);

  const canPay = cart.length > 0 && address && shipping && !loadingPay;

  const payloadBase = () => ({
    items: cart.map(i => ({
      id: i.id,
      title: i.title,
      qty: i.qty,
      price: Number(i.price),
      img: i.img || "",
      options: i.options || null,
    })),
    address,
    shipping: {
      amount: shipping.amount || 0,
      distanceKm: shipping.distanceKm || 0,
      branchId: shipping.branchId,
      branchName: shipping.branchName,
      express: !!shipping.express,
      expressFee: shipping.express ? (shipping.expressFee || 0) : 0,
      notes: shipping.notes || [],
    },
    totals: {
      subtotal,
      total: grandTotal,
    },
    // si tienes user, inclúyelo para pre-orden
    user: user ? { uid: user.uid, email: user.email || "" } : null
  });

  async function payStripe() {
    try {
      setLoadingPay(true);
      setError("");
      const res = await createStripeCheckout(payloadBase());
      if (res?.url) window.location.href = res.url;
      else throw new Error("Sin URL de Stripe");
    } catch (e) {
      console.error(e);
      setError("No se pudo iniciar el pago con Stripe.");
      setLoadingPay(false);
    }
  }

  async function payMP() {
    try {
      setLoadingPay(true);
      setError("");
      const res = await createMPCheckout(payloadBase());
      if (res?.url) window.location.href = res.url;
      else throw new Error("Sin URL de Mercado Pago");
    } catch (e) {
      console.error(e);
      setError("No se pudo iniciar el pago con Mercado Pago.");
      setLoadingPay(false);
    }
  }

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] px-4 sm:px-6 lg:px-12 pb-10">
      <h1 className="font-display text-3xl text-wine mb-6">Centro de pago y direcciones</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Dirección + Envío */}
        <div className="lg:col-span-2 space-y-6">
          <AddressForm onSelected={setAddress} />

          <div className="bg-white rounded-xl border border-rose/30 p-4 shadow-sm">
            <h3 className="text-wine text-lg font-semibold mb-3">Envío</h3>
            <ShippingPicker onChange={setShipping} />
          </div>
        </div>

        {/* Columna derecha: Resumen y pagos */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-rose/30 p-4 shadow-sm">
            <h3 className="text-wine text-lg font-semibold mb-3">Resumen</h3>
            {cart.length === 0 ? (
              <p className="text-wineDark/70">Tu carrito está vacío.</p>
            ) : (
              <>
                <ul className="divide-y divide-rose/20 max-h-72 overflow-y-auto pr-2">
                  {cart.map((i) => (
                    <li key={`${i.id}${i.options ? JSON.stringify(i.options) : ""}`} className="py-2 flex items-center gap-3">
                      <img src={i.img} alt={i.title} className="w-12 h-12 rounded object-cover border border-rose/30" />
                      <div className="flex-1">
                        <div className="text-wine text-sm font-medium truncate">{i.title}</div>
                        <div className="text-xs text-wineDark/60">
                          {i.qty} x {mxn(i.price)}
                        </div>
                      </div>
                      <div className="text-sm text-wine font-semibold">{mxn(i.qty * i.price)}</div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 space-y-1 text-sm text-wineDark/80">
                  <div className="flex justify-between"><span>Subtotal</span><span>{mxn(subtotal)}</span></div>
                  {shipping?.amount ? <div className="flex justify-between"><span>Envío</span><span>{mxn(shipping.amount)}</span></div> : null}
                  {shipping?.express ? <div className="flex justify-between"><span>Express</span><span>{mxn(shipping.expressFee || 0)}</span></div> : null}
                  <div className="flex justify-between font-semibold text-wine mt-2">
                    <span>Total</span><span>{mxn(grandTotal)}</span>
                  </div>
                </div>

                {error && <p className="text-red text-sm mt-3">{error}</p>}

                <div className="mt-4 grid gap-3">
                  <button
                    disabled={!canPay}
                    onClick={payStripe}
                    className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loadingPay ? "Redirigiendo…" : "Pagar con Stripe"}
                  </button>
                  <button
                    disabled={!canPay}
                    onClick={payMP}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loadingPay ? "Redirigiendo…" : "Pagar con Mercado Pago"}
                  </button>
                  
                </div>

                {!address && <p className="text-xs text-wineDark/60 mt-2">* Agrega/selecciona una dirección para habilitar el pago.</p>}
                {!shipping && <p className="text-xs text-wineDark/60">* Calcula el envío con tu ubicación.</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
