// src/pages/admin/NovedadesAdmin.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot,
  serverTimestamp, updateDoc
} from "firebase/firestore";
import { cld } from "../../utils/cloudinary";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

// 🔹 MISMA función que en ProductsAdmin (mismo endpoint y envs)
const uploadToCloudinary = async (file) => {
  const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD;
  const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET; // 👈 mismo nombre que ya usas

  if (!CLOUD || !PRESET) {
    throw new Error("⚠️ Faltan variables de entorno: VITE_CLOUDINARY_CLOUD / VITE_CLOUDINARY_PRESET");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", PRESET);
  // opcional: agrupar en carpeta
  // formData.append("folder", "petit-plaisir/novelties");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Error subiendo imagen a Cloudinary");
  }
  if (!data.secure_url) {
    throw new Error("Subida sin URL");
  }
  return data.secure_url;
};

const emptyForm = {
  title: "", desc: "", price: "",
  img: "", tags: "", season: "",
  active: true, activeFrom: "", activeTo: "",
  priority: 0,
};

export default function NovedadesAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = collection(db, "novelties");
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a,b)=> (b.priority||0) - (a.priority||0));
      setItems(docs);
    });
    return () => unsub();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, img: url }));
      toast.success("Imagen subida ✅");
    } catch (err) {
      console.error(err);
      toast.error(`Error subiendo imagen: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    try {
      const payload = {
        title: form.title.trim(),
        desc: form.desc.trim(),
        price: form.price !== "" ? Number(form.price) : null,
        img: form.img || "",
        tags: form.tags ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
        season: form.season || "",
        active: !!form.active,
        activeFrom: form.activeFrom ? new Date(form.activeFrom) : null,
        activeTo: form.activeTo ? new Date(form.activeTo) : null,
        priority: Number(form.priority) || 0,
        updatedAt: serverTimestamp(),
      };

      if (!payload.title) {
        toast.warn("El título es obligatorio");
        return;
      }

      if (editingId) {
        await updateDoc(doc(db, "novelties", editingId), payload);
        toast.success("Novedad actualizada ✅");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "novelties"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Novedad agregada ✅");
      }
      setForm(emptyForm);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar");
    }
  };

  const edit = (n) => {
    setEditingId(n.id);
    setForm({
      title: n.title || "",
      desc: n.desc || "",
      price: typeof n.price === "number" ? n.price : "",
      img: n.img || "",
      tags: Array.isArray(n.tags) ? n.tags.join(", ") : "",
      season: n.season || "",
      active: n.active !== false,
      activeFrom: n.activeFrom?.toDate ? n.activeFrom.toDate().toISOString().slice(0,16) : "",
      activeTo: n.activeTo?.toDate ? n.activeTo.toDate().toISOString().slice(0,16) : "",
      priority: n.priority || 0,
    });
  };

  const removeItem = async (id) => {
    if (!confirm("¿Eliminar esta novedad?")) return;
    try {
      await deleteDoc(doc(db, "novelties", id));
      toast.success("Novedad eliminada 🗑️");
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al eliminar");
    }
  };

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] px-4 sm:px-6 lg:px-12 pb-10">
      <h1 className="font-display text-3xl text-wine mb-6">Novedades · Admin</h1>

      {/* Form */}
      <div className="bg-white border border-rose/30 rounded-2xl p-4 shadow-suave">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-wineDark/80">Título</span>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={form.title}
              onChange={e=>setForm({...form, title:e.target.value})}
            />
          </label>

          <label className="block">
            <span className="text-sm text-wineDark/80">Precio (opcional)</span>
            <input
              className="w-full border rounded-lg px-3 py-2"
              type="number" step="0.01"
              value={form.price}
              onChange={e=>setForm({...form, price:e.target.value})}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-wineDark/80">Descripción</span>
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
              value={form.desc}
              onChange={e=>setForm({...form, desc:e.target.value})}
            />
          </label>

          <label className="block">
            <span className="text-sm text-wineDark/80">Temporada</span>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="otoño-2025 / navidad-2025"
              value={form.season}
              onChange={e=>setForm({...form, season:e.target.value})}
            />
          </label>

          <label className="block">
            <span className="text-sm text-wineDark/80">Tags (coma separada)</span>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="día-de-muertos, temporal"
              value={form.tags}
              onChange={e=>setForm({...form, tags:e.target.value})}
            />
          </label>

          <label className="block">
            <span className="text-sm text-wineDark/80">Activo desde</span>
            <input
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2"
              value={form.activeFrom}
              onChange={e=>setForm({...form, activeFrom:e.target.value})}
            />
          </label>

          <label className="block">
            <span className="text-sm text-wineDark/80">Activo hasta</span>
            <input
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2"
              value={form.activeTo}
              onChange={e=>setForm({...form, activeTo:e.target.value})}
            />
          </label>

          <label className="block">
            <span className="text-sm text-wineDark/80">Prioridad</span>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2"
              value={form.priority}
              onChange={e=>setForm({...form, priority:e.target.value})}
            />
          </label>

          <label className="block">
            <span className="text-sm text-wineDark/80">Activo</span>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={form.active ? "true" : "false"}
              onChange={e=>setForm({...form, active: e.target.value === "true"})}
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </label>

          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={handleUpload}/>
              {uploading && <span className="text-sm text-wineDark/70">Subiendo…</span>}
            </div>

            {/* Guard: no mostrar <img> si no hay URL */}
            {form.img ? (
              <img
                src={cld(form.img, { w: 900, h: 400 })}
                alt="preview"
                className="mt-3 rounded-lg border border-rose/20 max-h-48 object-cover"
              />
            ) : (
              <div className="mt-3 h-40 rounded-lg border border-rose/20 bg-rose/10 text-wineDark/70 flex items-center justify-center text-sm">
                Sin imagen
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={save}
            className="bg-wine text-cream px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            {editingId ? "Actualizar" : "Agregar"}
          </button>
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setForm(emptyForm); }}
              className="border border-wine text-wine px-4 py-2 rounded-lg hover:bg-rose/10 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-rose/30 rounded-2xl overflow-hidden shadow-suave"
          >
            {n.img ? (
              <img
                src={cld(n.img, { w: 900, h: 500 })}
                alt={n.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-rose/10 border-b border-rose/30 flex items-center justify-center text-sm text-wineDark/70">
                Sin imagen
              </div>
            )}

            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-wine font-semibold">{n.title}</h3>
                {typeof n.price === "number" && (
                  <span className="text-wineDark font-semibold">${n.price.toFixed(2)}</span>
                )}
              </div>
              <p className="text-sm text-wineDark/80 mt-1 line-clamp-3">{n.desc}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {n.season && <span className="text-xs bg-rose/20 text-wine px-2 py-1 rounded-full">{n.season}</span>}
                {(n.tags||[]).map(t => (
                  <span key={t} className="text-xs border border-rose/30 px-2 py-0.5 rounded-full">#{t}</span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-wineDark/70">
                <span>Activo: {n.active !== false ? "Sí" : "No"}</span>
                <span>Prioridad: {n.priority || 0}</span>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setForm({
                    title: n.title || "",
                    desc: n.desc || "",
                    price: typeof n.price === "number" ? n.price : "",
                    img: n.img || "",
                    tags: Array.isArray(n.tags) ? n.tags.join(", ") : "",
                    season: n.season || "",
                    active: n.active !== false,
                    activeFrom: n.activeFrom?.toDate ? n.activeFrom.toDate().toISOString().slice(0,16) : "",
                    activeTo: n.activeTo?.toDate ? n.activeTo.toDate().toISOString().slice(0,16) : "",
                    priority: n.priority || 0,
                  }) || setEditingId(n.id)}
                  className="bg-cream border border-wine px-3 py-1 rounded-lg text-wine hover:bg-rose/10"
                >
                  Editar
                </button>
                <button
                  onClick={() => removeItem(n.id)}
                  className="bg-red text-cream px-3 py-1 rounded-lg hover:bg-wine/90"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
