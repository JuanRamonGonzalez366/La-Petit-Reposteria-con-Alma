import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "react-toastify";
import { validateRfcMx } from "../utils/rfcMx";

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const FORMAS_PAGO = [
  { code: "01", label: "Efectivo" },
  { code: "03", label: "Transferencia Electrónica" },
  { code: "04", label: "Tarjeta de Crédito" },
  { code: "28", label: "Tarjeta de Débito" },
];

// Ajusta a tus sucursales reales
const SUCURSALES = [
  "Tlaquepaque",
  "Rio Nilo",
  "Revolución",
  "Country",
  "Zapopan",
  "Minerva",
  "Obsidiana",
  "Patria",
  "El Salto",
  "Circunvalacion",
];

export default function Facturacion() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    // FACTURACIÓN (datos fiscales)
    razonSocial: "",
    rfc: "",
    regimenFiscal: "",

    // Domicilio fiscal
    calle: "",
    numeroExterior: "",
    numeroInterior: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",

    // Correo (mismo de la CSF)
    emailFactura: "",

    // Compra
    formaPago: "",
    ticketAmount: "",      // Monto total a facturar
    productosDescripcion: "", // Lista/desc. de productos
    sucursal: "",
    mesCompra: "",

    // Contacto y confirmación
    phone: "",
    confirmCsf: "",  // campo de texto para confirmar envío de CSF (como piden en el texto)
    
    // Opcionales que ya tenías (los dejo por compatibilidad):
    ticketFolio: "",
    ticketDate: "",
    notes: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((v) => ({ ...v, [name]: value }));
  };

  const validate = () => {
    // Requeridos
    const required = [
      "razonSocial","rfc","regimenFiscal","calle","numeroExterior",
      "colonia","ciudad","estado","codigoPostal",
      "emailFactura","formaPago","ticketAmount","productosDescripcion",
      "sucursal","mesCompra","phone"
    ];
    for (const k of required) {
      if (!String(data[k] ?? "").trim()) {
        toast.error("Falta completar: " + k);
        return false;
      }
    }

    if (!validateRfcMx(data.rfc)) {
      toast.error("RFC inválido. Revisa mayúsculas y formato.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailFactura)) {
      toast.error("Correo inválido.");
      return false;
    }
    if (!/^\d{5}$/.test(String(data.codigoPostal))) {
      toast.error("Código Postal inválido (5 dígitos).");
      return false;
    }
    if (!/^\d{7,15}$/.test(String(data.phone).replace(/\D/g, ""))) {
      toast.error("Teléfono inválido (sólo números, 7–15 dígitos).");
      return false;
    }
    if (Number.isNaN(Number(data.ticketAmount)) || Number(data.ticketAmount) <= 0) {
      toast.error("El monto a facturar debe ser un número mayor que 0.");
      return false;
    }
    if (!FORMAS_PAGO.some(f => f.code === data.formaPago)) {
      toast.error("Selecciona una forma de pago válida.");
      return false;
    }
    if (!MESES.includes(data.mesCompra)) {
      toast.error("Selecciona el mes de compra.");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        // Fiscales
        razonSocial: data.razonSocial.trim(),
        rfc: data.rfc.trim().toUpperCase(),
        regimenFiscal: data.regimenFiscal.trim(),

        // Domicilio fiscal
        domicilioFiscal: {
          calle: data.calle.trim(),
          numeroExterior: data.numeroExterior.trim(),
          numeroInterior: (data.numeroInterior || "").trim(),
          colonia: data.colonia.trim(),
          ciudad: data.ciudad.trim(),
          estado: data.estado.trim(),
          codigoPostal: data.codigoPostal.trim(),
        },

        // Contacto / correo para CFDI
        emailFactura: data.emailFactura.trim(),
        phone: String(data.phone).replace(/\D/g, ""),

        // Compra
        formaPago: data.formaPago,
        ticketAmount: Number(data.ticketAmount),
        productosDescripcion: data.productosDescripcion.trim(),
        sucursal: data.sucursal,
        mesCompra: data.mesCompra,

        // Extras
        confirmCsf: (data.confirmCsf || "").trim(),
        ticketFolio: (data.ticketFolio || "").trim(),
        ticketDate: data.ticketDate || "",
        notes: (data.notes || "").trim(),

        status: "nuevo",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "invoicesRequests"), payload);
      toast.success("¡Solicitud enviada! Te contactaremos por correo.");
      setData({
        razonSocial: "", rfc: "", regimenFiscal: "",
        calle: "", numeroExterior: "", numeroInterior: "",
        colonia: "", ciudad: "", estado: "", codigoPostal: "",
        emailFactura: "", formaPago: "", ticketAmount: "",
        productosDescripcion: "", sucursal: "", mesCompra: "",
        phone: "", confirmCsf: "",
        ticketFolio: "", ticketDate: "", notes: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[88px] px-4 sm:px-6 lg:px-12 pb-10">
      <h1 className="font-display text-3xl text-wine text-center mb-2">Facturación</h1>
      <p className="text-center text-wineDark/70 mb-8 max-w-3xl mx-auto">
        Completa tus datos fiscales y de compra. Recuerda **enviar tu Constancia de Situación Fiscal (CSF) al correo indicado** y confirma al final.
      </p>

      <form onSubmit={onSubmit} className="max-w-5xl mx-auto bg-cream rounded-2xl border border-rose/30 shadow-sm p-6 space-y-8">
        {/* FACTURACIÓN */}
        <section>
          <h2 className="font-display text-2xl text-wine mb-4">Facturación</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-wineDark mb-1">Nombre o Razón Social *</label>
              <input name="razonSocial" value={data.razonSocial} onChange={onChange}
                className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">RFC *</label>
              <input name="rfc" value={data.rfc} onChange={onChange} placeholder="XAXX010101000"
                className="w-full rounded-xl border border-wine/20 px-3 py-2 uppercase" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">
                Régimen Fiscal (ej. 601 PM, 612 PF AE) *
              </label>
              <input name="regimenFiscal" value={data.regimenFiscal} onChange={onChange}
                     className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
            </div>
          </div>
        </section>

        {/* DOMICILIO FISCAL */}
        <section>
          <h3 className="font-display text-xl text-wine mb-3">Domicilio fiscal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-wineDark mb-1">Calle *</label>
              <input name="calle" value={data.calle} onChange={onChange}
                     className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Número Exterior *</label>
              <input name="numeroExterior" value={data.numeroExterior} onChange={onChange}
                     className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Número Interior</label>
              <input name="numeroInterior" value={data.numeroInterior} onChange={onChange}
                     className="w-full rounded-xl border border-wine/20 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Colonia *</label>
              <input name="colonia" value={data.colonia} onChange={onChange}
                     className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Ciudad *</label>
              <input name="ciudad" value={data.ciudad} onChange={onChange}
                     className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Estado *</label>
              <input name="estado" value={data.estado} onChange={onChange}
                     className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Código Postal *</label>
              <input name="codigoPostal" value={data.codigoPostal} onChange={onChange}
                     className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-wineDark mb-1">
              Correo para enviar factura (mismo que en la CSF) *
            </label>
            <input type="email" name="emailFactura" value={data.emailFactura} onChange={onChange}
                   className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-wineDark mb-1">Número de teléfono *</label>
            <input name="phone" value={data.phone} onChange={onChange} placeholder="Sólo números"
                   className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
          </div>
        </section>

        {/* COMPRA */}
        <section>
          <h3 className="font-display text-xl text-wine mb-3">Datos de la compra</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Forma de Pago *</label>
              <select name="formaPago" value={data.formaPago} onChange={onChange}
                      className="w-full rounded-xl border border-wine/20 px-3 py-2" required>
                <option value="">Selecciona…</option>
                {FORMAS_PAGO.map(fp => (
                  <option key={fp.code} value={fp.code}>{fp.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Monto total a facturar (MXN) *</label>
              <input type="number" step="0.01" name="ticketAmount" value={data.ticketAmount} onChange={onChange}
                     className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Mes en el que se hizo su compra *</label>
              <select name="mesCompra" value={data.mesCompra} onChange={onChange}
                      className="w-full rounded-xl border border-wine/20 px-3 py-2" required>
                <option value="">Selecciona…</option>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Sucursal donde realizó la compra *</label>
              <select name="sucursal" value={data.sucursal} onChange={onChange}
                      className="w-full rounded-xl border border-wine/20 px-3 py-2" required>
                <option value="">Selecciona…</option>
                {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Campos opcionales previos (si los usas) */}
            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Folio del ticket (opcional)</label>
              <input name="ticketFolio" value={data.ticketFolio} onChange={onChange}
                     className="w-full rounded-xl border border-wine/20 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-wineDark mb-1">Fecha del ticket (opcional)</label>
              <input type="date" name="ticketDate" value={data.ticketDate} onChange={onChange}
                     className="w-full rounded-xl border border-wine/20 px-3 py-2" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-wineDark mb-1">
              Productos comprados (detalle; si fueron rebanadas, gramos; si hubo envío o Rappi) *
            </label>
            <textarea name="productosDescripcion" value={data.productosDescripcion} onChange={onChange}
                      rows={4} className="w-full rounded-xl border border-wine/20 px-3 py-2" required />
          </div>
        </section>

        {/* CONFIRMACIÓN CSF / NOTAS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 text-sm text-wineDark/80">
            <strong>Importante:</strong> por disposición del SAT, para facturar envía tu CSF (PDF) a
            {" "}
            <a href="mailto:facturacion@pasteleriaspetit.com" className="underline text-wine">
              facturacion@pasteleriaspetit.com
            </a>.
            Confirma abajo que ya la enviaste.
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-wineDark mb-1">
              Confirmación de envío de CSF (escribe “Enviada” u observaciones)
            </label>
            <input name="confirmCsf" value={data.confirmCsf} onChange={onChange}
                    className="w-full rounded-xl border border-wine/20 px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-wineDark mb-1">Notas (opcional)</label>
            <textarea name="notes" value={data.notes} onChange={onChange}
                      rows={3} className="w-full rounded-xl border border-wine/20 px-3 py-2" />
          </div>
        </section>

        <button type="submit" disabled={loading}
                className="bg-red text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition">
          {loading ? "Enviando…" : "Solicitar factura"}
        </button>

        <p className="text-[11px] text-wineDark/70">
          Al enviar aceptas el uso de tus datos para emitir la factura correspondiente.
        </p>
      </form>
    </main>
  );
}
