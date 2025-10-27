import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";

export default function CafeteriaAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    desc: "",
    category: "",
    priceSmall: "",
    priceLarge: "",
    price: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const categories = [
    "Barra de espresso",
    "Frappastel",
    "Tés y Tisanas",
    "Otras bebidas y extras",
  ];

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "cafeteria"), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Guardar o actualizar producto
  const save = async () => {
    try {
      if (!form.name.trim()) {
        toast.warning("Debes ingresar el nombre del producto");
        return;
      }
      setUploading(true);
      const payload = {
        name: form.name.trim(),
        desc: form.desc.trim(),
        category: form.category,
        priceSmall: form.priceSmall ? Number(form.priceSmall) : null,
        priceLarge: form.priceLarge ? Number(form.priceLarge) : null,
        price: form.price ? Number(form.price) : null,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "cafeteria", editingId), payload);
        toast.success("☕ Producto actualizado correctamente");
      } else {
        await addDoc(collection(db, "cafeteria"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("☕ Producto agregado correctamente");
      }

      setForm({
        name: "",
        desc: "",
        category: "",
        priceSmall: "",
        priceLarge: "",
        price: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error("Error guardando:", err);
      toast.error("Error al guardar el producto");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await deleteDoc(doc(db, "cafeteria", id));
    toast.info("🗑️ Producto eliminado");
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      desc: item.desc || "",
      category: item.category || "",
      priceSmall: item.priceSmall || "",
      priceLarge: item.priceLarge || "",
      price: item.price || "",
    });
    setEditingId(item.id);
  };

  return (
    <main className="max-w-5xl mx-auto bg-cream p-6 rounded-2xl shadow space-y-8">
      <h1 className="font-display text-3xl text-wine mb-4">Administrar Cafetería</h1>

      {/* Formulario */}
      <section className="bg-white border border-rose/30 rounded-xl p-6 grid gap-4">
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Nombre del producto"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          className="border rounded-lg px-3 py-2"
          rows="2"
          placeholder="Descripción"
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
        />
        <select
          className="border rounded-lg px-3 py-2"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Seleccionar categoría</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            className="border rounded-lg px-3 py-2"
            placeholder="Precio chico"
            value={form.priceSmall}
            onChange={(e) => setForm({ ...form, priceSmall: e.target.value })}
          />
          <input
            type="number"
            className="border rounded-lg px-3 py-2"
            placeholder="Precio grande"
            value={form.priceLarge}
            onChange={(e) => setForm({ ...form, priceLarge: e.target.value })}
          />
          <input
            type="number"
            className="border rounded-lg px-3 py-2"
            placeholder="Precio único"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        <button
          disabled={uploading}
          onClick={save}
          className="bg-red text-cream px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
        >
          {uploading ? "Guardando..." : editingId ? "Actualizar" : "Agregar"}
        </button>
      </section>

      {/* Lista */}
      <section>
        <h2 className="font-display text-2xl text-wine mb-4">Listado</h2>
        <div className="grid gap-4">
          {items.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-wine/20 p-4 rounded-xl flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-wine">{p.name}</h3>
                <p className="text-sm text-wineDark/70">{p.desc}</p>
                <p className="text-xs text-wineDark/60">{p.category}</p>
                <div className="text-sm mt-1">
                  {p.priceSmall && <span>Chico: ${p.priceSmall} </span>}
                  {p.priceLarge && <span>Grande: ${p.priceLarge} </span>}
                  {p.price && <span>Precio único: ${p.price}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded border border-rose hover:bg-rose/10"
                  onClick={() => handleEdit(p)}
                >
                  Editar
                </button>
                <button
                  className="px-3 py-1 rounded border border-red text-red hover:bg-red/10"
                  onClick={() => handleDelete(p.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
