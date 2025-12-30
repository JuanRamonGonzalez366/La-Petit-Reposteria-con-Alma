// src/pages/admin/OrdersAdmin.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    orderBy,
    query,
} from "firebase/firestore";
import { toast } from "react-toastify";

const STATUS_OPTIONS = [
    "pending_payment",
    "pending_store_payment",
    "paid",
    "payment_failed",
    "preparando",
    "en_ruta",
    "entregado",
    "cancelado",
];


export default function OrdersAdmin() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const colRef = collection(db, "orders");
    const q = query(colRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
        q,
        (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(docs);
        setLoading(false);
        },
        (err) => {
        console.error("Error cargando órdenes:", err);
        toast.error("No se pudieron cargar las órdenes");
        setLoading(false);
        }
    );

    return () => unsub();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
    try {
        await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date(),
        });
        toast.success("Estado actualizado");
    } catch (err) {
        console.error(err);
        toast.error("No se pudo actualizar el estado");
    }
    };

    const formatDate = (ts) => {
    try {
        if (!ts) return "-";
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
        });
    } catch {
        return "-";
    }
    };

    return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] px-4 sm:px-6 lg:px-12 pb-10">
        <h1 className="font-display text-3xl text-wine mb-6">
        Pedidos · Admin
        </h1>

        <section className="bg-white border border-rose/30 rounded-2xl p-4 sm:p-6 shadow-sm">
        {loading ? (
            <p className="text-wineDark/70">Cargando pedidos…</p>
        ) : orders.length === 0 ? (
            <p className="text-wineDark/70">Aún no hay pedidos registrados.</p>
        ) : (
            <div className="space-y-4">
            {orders.map((o) => (
                <div
                key={o.id}
                className="border border-rose/30 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-start"
                >
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-wine">
                        Pedido #{o.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-wineDark/60">
                        {formatDate(o.createdAt)}
                    </span>
                    </div>

                    <p className="text-xs text-wineDark/70 mb-1">
                    Método:{" "}
                    <strong className="uppercase">
                        {o.paymentMethod === "mp"
                        ? "Mercado Pago"
                        : o.paymentMethod === "store"
                        ? "Pago en sucursal"
                        : o.paymentMethod || "-"}
                    </strong>
                    </p>

                    <p className="text-xs text-wineDark/70 mb-2">
                    Cliente:{" "}
                    {o.userEmail || o.user?.email || "Sin correo registrado"}
                    </p>

                  {/* Items */}
                    <ul className="text-xs text-wineDark/80 space-y-1 max-h-28 overflow-y-auto pr-1">
                    {(o.items || []).map((item, idx) => (
                        <li key={idx}>
                        • {item.title}{" "}
                        {item.options?.size ? `(${item.options.size})` : ""} x
                        {item.qty} — $
                        {(Number(item.price || 0) * Number(item.qty || 0)).toFixed(2)}
                        </li>
                    ))}
                    </ul>

                  {/* Totales */}
                    <div className="mt-2 text-xs text-wineDark/80 space-y-1">
                    <div>
                        Subtotal: $
                        {o.totals?.subtotal != null
                        ? Number(o.totals.subtotal).toFixed(2)
                        : "0.00"}
                    </div>
                    {o.shipping?.amount ? (
                        <div>Envío: ${Number(o.shipping.amount).toFixed(2)}</div>
                    ) : null}
                    {o.shipping?.express ? (
                        <div>
                        Express: $
                        {Number(o.shipping.expressFee || 0).toFixed(2)}
                        </div>
                    ) : null}
                    <div className="font-semibold text-wine">
                        Total: $
                        {o.totals?.total != null
                        ? Number(o.totals.total).toFixed(2)
                        : "0.00"}
                    </div>
                    </div>
                </div>

                {/* Columna derecha: estado */}
                <div className="sm:w-48 flex flex-col gap-2">
                    <label className="text-xs text-wineDark/70">
                    Estado del pedido
                    </label>
                    <select
                    className="border border-rose/40 rounded-lg px-2 py-1 text-sm"
                    value={o.status || "pending_payment"}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    >
                    {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                        {st}
                        </option>
                    ))}
                    </select>
                </div>
                </div>
            ))}
            </div>
        )}
        </section>
    </main>
    );
}
