// src/pages/admin/MigrateProductsLang.jsx
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, updateDoc, writeBatch } from "firebase/firestore";
import React, { useState } from "react";

export default function MigrateProductsLang() {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);

  const run = async () => {
    setRunning(true);
    try {
      const snap = await getDocs(collection(db, "products"));
      const batch = writeBatch(db);
      snap.forEach((d) => {
        const p = d.data();
        const update = {};
        // title
        if (typeof p.title === "string") {
          update.title = { es: p.title, en: p.title };
        } else if (p.title && (!p.title.en || !p.title.es)) {
          update.title = { es: p.title.es || p.title.en, en: p.title.en || p.title.es };
        }
        // desc
        if (typeof p.desc === "string") {
          update.desc = { es: p.desc, en: p.desc };
        } else if (p.desc && (!p.desc.en || !p.desc.es)) {
          update.desc = { es: p.desc.es || p.desc.en, en: p.desc.en || p.desc.es };
        }
        // categoryKey
        if (!p.categoryKey && p.category) {
          // mapea tu texto actual -> key (ajusta a tus nombres reales)
          const map = {
            "Chocolate": "productsChoco",
            "Vainilla": "productsVainilla",
            "Queso": "productsQueso",
            "Tres Leches": "productsTresLeches",
            "Cafe": "productsCafe",
            "Clasico": "productsClasico",
            "Gelatina": "productsGelatina",
            "Sin azucar": "productsAzucar",
            "Panaderia": "productsPanaderia",
            "Reposteria": "productsReposteria",
            "Velas": "productsVelas",
            "Solo por pedido": "productsPedidos",
            "Novedades": "productsNews",
          };
          update.categoryKey = map[p.category] || "productsClasico";
        }
        if (Object.keys(update).length) {
          batch.update(doc(db, "products", d.id), update);
        }
      });
      await batch.commit();
      setLog((l) => [...l, "✅ Migración completada"]);
    } catch (e) {
      console.error(e);
      setLog((l) => [...l, `❌ Error: ${e.message}`]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Migrar productos a esquema bilingüe</h1>
      <button
        disabled={running}
        onClick={run}
        className="mt-3 bg-red text-white px-4 py-2 rounded"
      >
        {running ? "Ejecutando…" : "Ejecutar"}
      </button>
      <pre className="mt-4 text-sm">{log.join("\n")}</pre>
    </main>
  );
}
