import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { exportCsv } from "../../utils/exportCsv";

// Ajusta a tus sucursales reales
const SUCURSALES = [
  "Tlaquepaque",
  "Rio Nilo",
  "Revolución",
  "Country",
  "Zapopan",
  "Minerva",
];

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const ESTADOS = ["nuevo", "revisado", "emitido", "rechazado"];

const fmtMoney = (n) =>
  isNaN(Number(n)) ? "—" : Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const badgeClass = (s) => {
  switch (s) {
    case "nuevo": return "bg-rose/20 text-wine border-rose/40";
    case "revisado": return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "emitido": return "bg-green-100 text-green-800 border-green-300";
    case "rechazado": return "bg-red-100 text-red-800 border-red-300";
    default: return "bg-cream/70 text-wine border-wine/30";
  }
};

export default function FacturacionAdmin() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("todos");
  const [branch, setBranch] = useState("todas");
  const [month, setMonth] = useState("todos");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "invoicesRequests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "todos" && (r.status || "nuevo") !== status) return false;
      if (branch !== "todas" && r.sucursal !== branch) return false;
      if (month !== "todos" && r.mesCompra !== month) return false;

      const amt = Number(r.ticketAmount || 0);
      if (minAmount && !(amt >= Number(minAmount))) return false;
      if (maxAmount && !(amt <= Number(maxAmount))) return false;

      const ts = r.createdAt?.toDate?.();
      if (dateFrom) {
        const df = new Date(dateFrom + "T00:00:00");
        if (!ts || ts < df) return false;
      }
      if (dateTo) {
        const dt = new Date(dateTo + "T23:59:59");
        if (!ts || ts > dt) return false;
      }

      if (search.trim()) {
        const s = search.trim().toLowerCase();
        const bag = [
          r.rfc, r.razonSocial, r.emailFactura, r.regimenFiscal,
          r.sucursal, r.mesCompra, r.productosDescripcion
        ].map(v => (v || "").toString().toLowerCase()).join(" ");
        if (!bag.includes(s)) return false;
      }
      return true;
    });
  }, [rows, status, branch, month, search, dateFrom, dateTo, minAmount, maxAmount]);

  const handleExport = () => exportCsv(filtered, "facturas_solicitudes.csv");

  const updateStatus = async (rowId, newStatus) => {
    try {
      setSavingId(rowId);
      await updateDoc(doc(db, "invoicesRequests", rowId), { status: newStatus });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-cream pt-[96px] px-4 sm:px-6 lg:px-10 pb-10">
      {/* Título + acciones */}
      <div className="max-w-7xl mx-auto mb-5 flex flex-wrap gap-3 items-center justify-between">
        <h1 className="text-2xl font-display text-wine">Facturación – Admin</h1>
        <button
          onClick={handleExport}
          className="border border-wine/30 text-wine px-4 py-2 rounded-lg hover:bg-rose/20 transition"
        >
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto mb-5 bg-white rounded-2xl border border-rose/30 shadow-sm p-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs text-wineDark/70 mb-1">Buscar (RFC, razón, email, producto)</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-wine/20 px-3 py-2"
              placeholder="GOPJ... | Razón social | correo..."
            />
          </div>

          <div>
            <label className="block text-xs text-wineDark/70 mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-wine/20 px-3 py-2"
            >
              <option value="todos">Todos</option>
              {ESTADOS.map(s => <option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-wineDark/70 mb-1">Sucursal</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-xl border border-wine/20 px-3 py-2"
            >
              <option value="todas">Todas</option>
              {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-wineDark/70 mb-1">Mes compra</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-xl border border-wine/20 px-3 py-2"
            >
              <option value="todos">Todos</option>
              {MESES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-wineDark/70 mb-1">Fecha desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-wine/20 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-wineDark/70 mb-1">Fecha hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-wine/20 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-wineDark/70 mb-1">Monto mínimo</label>
              <input
                type="number" step="0.01"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full rounded-xl border border-wine/20 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-wineDark/70 mb-1">Monto máximo</label>
              <input
                type="number" step="0.01"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full rounded-xl border border-wine/20 px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="max-w-7xl mx-auto overflow-hidden rounded-2xl border border-rose/30 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream sticky top-0 z-10">
              <tr className="text-wineDark">
                <th className="px-3 py-2 text-left text-xs font-semibold">Fecha</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">RFC / Razón social</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Régimen</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Domicilio</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Correo / Tel</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Pago / Monto</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Sucursal / Mes</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Productos</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const dom = r.domicilioFiscal || {};
                const rowBg = idx % 2 === 0 ? "bg-white" : "bg-cream/30";
                const current = r.status || "nuevo";
                return (
                  <tr key={r.id} className={`${rowBg} border-t border-rose/20 align-top`}>
                    <td className="px-3 py-3 min-w-[150px]">
                      {r.createdAt?.toDate?.()?.toLocaleString?.() || "—"}
                    </td>
                    <td className="px-3 py-3 min-w-[220px]">
                      <div className="font-mono text-[13px]">{r.rfc}</div>
                      <div className="text-xs text-wineDark/80 truncate">{r.razonSocial}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{r.regimenFiscal || "—"}</td>
                    <td className="px-3 py-3 min-w-[260px]">
                      <div className="text-xs leading-snug text-wineDark/80 whitespace-pre-line">
                        {[
                          `${dom.calle || ""} ${dom.numeroExterior || ""}${dom.numeroInterior ? ` Int ${dom.numeroInterior}` : ""}`.trim(),
                          `${dom.colonia || ""}`,
                          `${dom.ciudad || ""}, ${dom.estado || ""} ${dom.codigoPostal || ""}`.trim()
                        ].filter(Boolean).join("\n")}
                      </div>
                    </td>
                    <td className="px-3 py-3 min-w-[200px]">
                      <a className="underline text-wine hover:text-wineDark" href={`mailto:${r.emailFactura}`}>
                        {r.emailFactura}
                      </a>
                      <div className="text-xs text-wineDark/70">{r.phone || "—"}</div>
                    </td>
                    <td className="px-3 py-3 min-w-[140px]">
                      <div className="text-xs text-wineDark/70">{r.formaPago || "—"}</div>
                      <div className="font-semibold">{fmtMoney(r.ticketAmount)}</div>
                    </td>
                    <td className="px-3 py-3 min-w-[140px]">
                      <div>{r.sucursal || "—"}</div>
                      <div className="text-xs text-wineDark/70">{r.mesCompra || "—"}</div>
                    </td>
                    <td className="px-3 py-3 max-w-[280px]">
                      <div className="text-xs text-wineDark/80 whitespace-pre-wrap">
                        {r.productosDescripcion || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-3 min-w-[170px]">
                      {/* Badge + Select editable */}
                      <div className={`inline-block rounded-full border px-2 py-1 text-xs capitalize mr-2 ${badgeClass(current)}`}>
                        {current}
                      </div>
                      <select
                        className="rounded-xl border border-wine/20 px-2 py-1 text-xs"
                        value={current}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        disabled={savingId === r.id}
                        title="Cambiar estado"
                      >
                        {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-3 py-10 text-center text-wineDark/60" colSpan={9}>
                    No hay solicitudes con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
