import React, { useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

/**
 * Envuelve title/desc en {es, en} si hoy son string.
 * Opcional: fija categoryKey si sólo tienes category visible.
 */
export default function SeedI18nProducts() {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);

  const mapLabelToKey = (label) => {
    if (!label) return null;
    const L = label.toLowerCase();
    if (L.includes("chocolate")) return "productsChoco";
    if (L.includes("vainilla")) return "productsVainilla";
    if (L.includes("queso")) return "productsQueso";
    if (L.includes("tres")) return "productsTresLeches";
    if (L.includes("café") || L.includes("cafe")) return "productsCafe";
    if (L.includes("clásico") || L.includes("clasico")) return "productsClasico";
    if (L.includes("gelatina")) return "productsGelatina";
    if (L.includes("azúcar") || L.includes("azucar")) return "productsAzucar";
    if (L.includes("panader")) return "productsPanaderia";
    if (L.includes("repost")) return "productsReposteria";
    if (L.includes("velas")) return "productsVelas";
    if (L.includes("pedido")) return "productsPedidos";
    if (L.includes("novedad")) return "productsNews";
    return null;
  };

  const run = async () => {
    try {
      setRunning(true);
      setLog([]);
      const snap = await getDocs(collection(db, "products"));
      let updated = 0;

      for (const d of snap.docs) {
        const p = d.data();
        const payload = {};

        // title
        if (typeof p.title === "string") {
          payload.title = { es: p.title, en: "" };
        }

        // desc
        if (typeof p.desc === "string") {
          payload.desc = { es: p.desc, en: "" };
        }

        // categoryKey (opcional)
        if (!p.categoryKey && typeof p.category === "string") {
          const key = mapLabelToKey(p.category);
          if (key) payload.categoryKey = key;
        }

        if (Object.keys(payload).length) {
          await updateDoc(doc(db, "products", d.id), payload);
          updated++;
          setLog((prev) => [...prev, `✔ ${d.id} actualizado`]);
        }
      }

      toast.success(`Migración completada. Documentos tocados: ${updated}`);
    } catch (e) {
      console.error(e);
      toast.error(`Error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="bg-cream min-h-screen pt-24 px-6">
      <h1 className="font-display text-2xl text-wine mb-4">
        Migrar productos a formato bilingüe
      </h1>
      <p className="text-wineDark/80 mb-6">
        Envolverá <code>title</code> y <code>desc</code> en {"{es, en}"} si hoy son string,
        y (opcional) derivará <code>categoryKey</code> a partir de <code>category</code>.
      </p>
      <button
        onClick={run}
        disabled={running}
        className={`px-4 py-2 rounded-lg ${running ? "bg-gray-400" : "bg-red"} text-cream`}
      >
        {running ? "Ejecutando..." : "Ejecutar migración"}
      </button>

      <div className="mt-6 p-4 bg-white rounded-lg border border-rose/30 max-h-[50vh] overflow-auto text-sm">
        {log.map((l, i) => (
          <div key={i} className="text-wineDark/80">{l}</div>
        ))}
      </div>
    </main>
  );
}
