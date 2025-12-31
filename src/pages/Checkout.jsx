// src/pages/Checkout.jsx
import React, { useMemo, useState } from "react";
import AddressForm from "../components/AddressForm";
import ShippingPicker from "../components/ShippingPicker";
import { useCart } from "../context/CartContext";
import { mxn } from "../utils/money";
import { createMPCheckout } from "../api/payments";
import { useAuth } from "../auth/AuthProvider";

// 🔹 Firestore
import { db } from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Checkout() {
  const { cart, subtotal } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState(null); // objeto completo de AddressForm
  const [shipping, setShipping] = useState(null); // { amount, distanceKm, branchId, branchName, express, expressFee, ... }
  const [loadingPay, setLoadingPay] = useState(false);
  const [error, setError] = useState("");

  const grandTotal = useMemo(() => {
    if (!shipping) return subtotal;
    return (
      subtotal +
      (shipping.amount || 0) +
      (shipping.express ? shipping.expressFee || 0 : 0)
    );
  }, [subtotal, shipping]);

  // 🔹 Reglas de habilitación
  const canPayOnline = cart.length > 0 && address && shipping && !loadingPay && !!user;
  const canReserveStore = cart.length > 0 && !loadingPay && !!user;

  // ✅ Abrir Rappi Drawer (global)
  const openRappiDrawer = () => {
    window.dispatchEvent(new CustomEvent("open-rappi-drawer"));
  };

  // 🔹 Base común del pedido
  const payloadBase = () => ({
    items: cart.map((i) => ({
      id: i.id,
      title: i.title,
      qty: i.qty,
      price: Number(i.price),
      img: i.img || "",
      options: i.options || null,
    })),
    address: address || null,
    shipping: shipping
      ? {
          amount: shipping.amount || 0,
          distanceKm: shipping.distanceKm || 0,
          branchId: shipping.branchId || null,
          branchName: shipping.branchName || "",
          express: !!shipping.express,
          expressFee: shipping.express ? shipping.expressFee || 0 : 0,
          notes: shipping.notes || [],
        }
      : null,
    totals: {
      subtotal,
      total: grandTotal,
    },
    user: user ? { uid: user.uid, email: user.email || "" } : null,
  });

  // 🔹 Crear documento en /orders
  const createOrder = async (paymentMethod, status) => {
    if (!user) {
      throw new Error("Debes iniciar sesión para registrar tu pedido.");
    }

    const base = payloadBase();

    const docRef = await addDoc(collection(db, "orders"), {
      ...base,
      userId: user.uid,
      userEmail: user.email || "",
      paymentMethod, // "store" | "mp"
      status, // "pending_store_payment" | "pending_payment" | etc.
      provider: paymentMethod === "mp" ? "mercado_pago" : "store",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, base };
  };

  // ==========================
  // 1) Apartar y pagar en sucursal
  // ==========================
  const reserveInStore = async () => {
    try {
      setLoadingPay(true);
      setError("");

      if (!user) {
        setError("Debes iniciar sesión para apartar tu pedido.");
        setLoadingPay(false);
        return;
      }

      const { id: orderId, base } = await createOrder("store", "pending_store_payment");

      // Mensaje para WhatsApp
      const lines = [
        "Hola! Me gustaría apartar este pedido para pagar en sucursal:",
        "",
        ...base.items.map(
          (i) =>
            `• ${i.title}${i.options?.size ? ` (${i.options.size})` : ""} x${i.qty} — ${mxn(
              i.price * i.qty
            )}`
        ),
        "",
        `Subtotal: ${mxn(base.totals.subtotal)}`,
        `Total: ${mxn(base.totals.total)}`,
        "",
        `Número de pedido: ${orderId}`,
      ];

      const text = encodeURIComponent(lines.join("\n"));
      const whatsappNumber = "5213318501155";
      const url = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${text}`;
      window.open(url, "_blank");
    } catch (e) {
      console.error(e);
      setError("No se pudo registrar el pedido para pago en sucursal.");
    } finally {
      setLoadingPay(false);
    }
  };

  // ==========================
  // 2) Pagar con Mercado Pago
  // ==========================
  const payMP = async () => {
    try {
      setLoadingPay(true);
      setError("");

      if (!user) {
        setError("Debes iniciar sesión para pagar en línea.");
        setLoadingPay(false);
        return;
      }

      if (!address || !shipping) {
        setError("Agrega una dirección y calcula el envío para usar Mercado Pago.");
        setLoadingPay(false);
        return;
      }

      const { id: orderId, base } = await createOrder("mp", "pending_payment");

      const res = await createMPCheckout({
        ...base,
        orderId,
      });

      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Sin URL de Mercado Pago");
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo iniciar el pago con Mercado Pago.");
      setLoadingPay(false);
    }
  };

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

          {/* ✅ NUEVO: bloque informativo de Rappi */}
          <div className="bg-white rounded-xl border border-rose/30 p-4 shadow-sm">
            <h3 className="text-wine text-lg font-semibold mb-2">¿Prefieres envío por Rappi?</h3>
            <p className="text-sm text-wineDark/70">
              Si quieres que Rappi gestione el envío, abre tu sucursal y haz el pedido directo en la app.
            </p>
            <button
              onClick={openRappiDrawer}
              className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#F44611] text-white text-sm font-medium hover:opacity-90 transition"
            >
              Ver sucursales en Rappi
            </button>
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
                    <li
                      key={`${i.id}${i.options ? JSON.stringify(i.options) : ""}`}
                      className="py-2 flex items-center gap-3"
                    >
                      <img
                        src={i.img}
                        alt={i.title}
                        className="w-12 h-12 rounded object-cover border border-rose/30"
                      />
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
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{mxn(subtotal)}</span>
                  </div>
                  {shipping?.amount ? (
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span>{mxn(shipping.amount)}</span>
                    </div>
                  ) : null}
                  {shipping?.express ? (
                    <div className="flex justify-between">
                      <span>Express</span>
                      <span>{mxn(shipping.expressFee || 0)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-semibold text-wine mt-2">
                    <span>Total</span>
                    <span>{mxn(grandTotal)}</span>
                  </div>
                </div>

                {error && <p className="text-red text-sm mt-3 whitespace-pre-line">{error}</p>}

                <div className="mt-4 grid gap-3">
                  {/* ✅ NUEVO: opción Rappi en checkout */}
                  <button
                    onClick={openRappiDrawer}
                    className="w-full bg-[#F44611] text-white py-2 rounded-lg hover:opacity-90 transition"
                  >
                    Pedir por Rappi (ver sucursales)
                  </button>

                  {/* Apartar y pagar en sucursal */}
                  <button
                    disabled={!canReserveStore}
                    onClick={reserveInStore}
                    className="w-full bg-wine text-cream py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loadingPay ? "Procesando…" : "Apartar y pagar en sucursal"}
                  </button>

                  {/* Pago en línea con Mercado Pago */}
                  {/* <button
                    disabled={!canPayOnline}
                    onClick={payMP}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loadingPay ? "Redirigiendo…" : "Pagar en línea con Mercado Pago"}
                  </button> */}
                </div>

                {!user && (
                  <p className="text-xs text-wineDark/60 mt-2">
                    * Debes iniciar sesión para registrar tu pedido.
                  </p>
                )}{/* 
                {!address && (
                  <p className="text-xs text-wineDark/60">
                    * Agrega/selecciona una dirección para habilitar el pago en línea.
                  </p>
                )}
                {!shipping && (
                  <p className="text-xs text-wineDark/60">
                    * Calcula el envío con tu ubicación para habilitar Mercado Pago.
                  </p>
                )} */}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
