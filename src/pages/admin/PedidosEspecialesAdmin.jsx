import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";

// 🔹 Subida a Cloudinary (misma que en ProductsAdmin)
const uploadToCloudinary = async (file) => {
  const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD;
  const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

  if (!CLOUD || !PRESET)
    throw new Error("⚠️ Faltan variables de entorno para Cloudinary");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) throw new Error("Error subiendo imagen a Cloudinary");

  const data = await res.json();
  return data.secure_url;
};

export default function PedidosEspecialesAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    desc: "",
    category: "",
    price: "",
    img: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const categories = [
    "Infantiles",
    "15 Años",
    "Bodas",
    "Bautizo",
    "Primera Comunion",
    "Confirmacion",
    "Fondant",
    "Psteles de pisos"
  ];

  // Escuchar Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pedidosEspeciales"), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Guardar / actualizar
  const save = async () => {
    try {
      if (!form.name.trim()) {
        toast.warning("⚠️ Debes ingresar el nombre del producto.");
        return;
      }

      setUploading(true);
      let imageUrl = form.img || "";

      // Si hay nueva imagen
      if (file) {
        imageUrl = await uploadToCloudinary(file);
      }

      // Fallback
      if (!imageUrl)
        imageUrl =
          "https://res.cloudinary.com/dzjupasme/image/upload/v1/placeholder_petit.jpg";

      const payload = {
        name: form.name.trim(),
        desc: form.desc.trim(),
        category: form.category.trim(),
        price: form.price ? Number(form.price) : null,
        img: imageUrl,
        updatedAt: serverTimestamp(),
        ...(editingId ? {} : { createdAt: serverTimestamp() }),
      };

      if (editingId) {
        await updateDoc(doc(db, "pedidosEspeciales", editingId), payload);
        toast.success("🎂 Producto actualizado con éxito");
      } else {
        await addDoc(collection(db, "pedidosEspeciales"), payload);
        toast.success("🎂 Producto agregado con éxito");
      }

      setForm({ name: "", desc: "", category: "", price: "", img: "" });
      setFile(null);
      setPreview(null);
      setEditingId(null);
    } catch (err) {
      console.error("❌ Error guardando producto:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await deleteDoc(doc(db, "pedidosEspeciales", id));
    toast.info("🗑️ Producto eliminado");
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      desc: item.desc || "",
      category: item.category || "",
      price: item.price || "",
      img: item.img || "",
    });
    setEditingId(item.id);
    setPreview(item.img || null);
  };

  return (
    <main className="bg-cream min-h-screen px-4 sm:px-6 lg:px-12 pt-20 pb-10">
      {/* Formulario */}
      <section className="bg-white border border-wineDark/30 rounded-2xl p-6 shadow-sm">
        <h2 className="font-display text-2xl text-wine mb-4">
          {editingId ? "Editar producto" : "Nuevo producto especial"}
        </h2>

        <div className="grid gap-3">
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Nombre del pastel"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <select
            className="border rounded-lg px-3 py-2 text-wineDark"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Selecciona categoría</option>
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="number"
            className="border rounded-lg px-3 py-2"
            placeholder="Precio (opcional)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <textarea
            className="border rounded-lg px-3 py-2"
            rows="3"
            placeholder="Descripción del producto"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
          ></textarea>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files[0];
              setFile(f);
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-32 h-32 object-cover rounded-lg border"
            />
          )}

          <div className="flex gap-3">
            <button
              disabled={uploading}
              className={`${
                uploading ? "bg-gray-400" : "bg-red"
              } text-cream px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition`}
              onClick={save}
            >
              {uploading
                ? "Subiendo..."
                : editingId
                ? "Guardar cambios"
                : "Agregar"}
            </button>

            {editingId && (
              <button
                className="border border-wine/30 px-5 py-2 rounded-lg hover:bg-rose/20 transition"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    name: "",
                    desc: "",
                    category: "",
                    price: "",
                    img: "",
                  });
                  setFile(null);
                  setPreview(null);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Listado */}
      <section>
        <h2 className="font-display text-2xl text-wine mb-4">Listado</h2>
        <div className="grid gap-4">
          {items.map((p) => (
            <div
              key={p.id}
              className="bg-cream border border-wineDark/30 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
            >
              {p.img && (
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              )}

              <div className="flex-1">
                <div className="font-semibold text-wine">
                  {p.name}
                  {p.price && (
                    <span className="text-wineDark/60"> — ${p.price}</span>
                  )}
                </div>
                <div className="text-sm text-wineDark/70">
                  {p.category} — {p.desc}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="border border-wine/30 px-3 py-1 rounded-lg hover:bg-rose/20"
                  onClick={() => handleEdit(p)}
                >
                  Editar
                </button>

                <button
                  className="border border-wine/30 px-3 py-1 rounded-lg hover:bg-rose/20 text-red-600"
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
