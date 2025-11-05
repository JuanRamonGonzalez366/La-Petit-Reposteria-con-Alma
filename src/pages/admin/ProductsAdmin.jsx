import React, { useEffect, useState } from "react"
import { db } from "../../lib/firebase"
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { toast } from "react-toastify"
import { cld } from "../../utils/cloudinary"

// 🔹 Subida a Cloudinary
const uploadToCloudinary = async (file) => {
  const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD
  const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET

  if (!CLOUD || !PRESET) throw new Error("⚠️ Faltan variables de entorno para Cloudinary")

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) throw new Error("Error subiendo imagen a Cloudinary")

  const data = await res.json()
  return data.secure_url
}

export default function ProductsAdmin() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({
    title: "",
    desc: "",
    priceUnit: "",
    priceKilo: "",
    category: "",
    img: "",
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  const categories = [
    "Chocolate",
    "Vainilla",
    "Queso",
    "Tres Leches",
    "Cafe",
    "Clasico",
    "Gelatina",
    "Sin azucar",
    "Panaderia",
    "Reposteria",
    "Velas",
    "Solo por pedido",
    "Novedades",
  ]

  // Escucha en tiempo real
  useEffect(() => {
    const refCol = collection(db, "products")
    const unsub = onSnapshot(refCol, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  // Guardar producto
  const save = async () => {
    try {
      if (!form.title.trim()) {
        toast.warning("⚠️ El producto debe tener un título.")
        return
      }
      if (!form.priceUnit) {
        toast.warning("⚠️ El producto debe tener un precio por pieza.")
        return
      }

      setUploading(true)
      let imageUrl = form.img || ""

      // Si el usuario selecciona una nueva imagen
      if (file) {
        imageUrl = await uploadToCloudinary(file)
      }

      // Asegurar que nunca sea undefined
      if (!imageUrl) imageUrl = "https://res.cloudinary.com/dzjupasme/image/upload/v1/placeholder_petit.jpg"

      const payload = {
        title: form.title.trim(),
        desc: form.desc.trim(),
        priceUnit: Number(form.priceUnit) || 0,
        priceKilo: form.priceKilo ? Number(form.priceKilo) : null,
        category: form.category.trim(),
        img: imageUrl,
        updatedAt: serverTimestamp(),
        ...(editingId ? {} : { createdAt: serverTimestamp() }),
      }

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload)
        toast.success("✏️ Producto actualizado con éxito")
      } else {
        await addDoc(collection(db, "products"), payload)
        toast.success("✅ Producto agregado con éxito")
      }

      // Reset
      setForm({ title: "", desc: "", priceUnit: "", priceKilo: "", category: "", img: "" })
      setFile(null)
      setPreview(null)
      setEditingId(null)
    } catch (err) {
      console.error("❌ Error guardando producto:", err)
      toast.error(`Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const confirmDelete = (product) => {
    setProductToDelete(product)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return
    try {
      await deleteDoc(doc(db, "products", productToDelete.id))
      toast.success(`🗑️ Producto "${productToDelete.title}" eliminado`)
    } catch (err) {
      console.error("Error eliminando producto:", err)
      toast.error("❌ No se pudo eliminar el producto")
    } finally {
      setConfirmOpen(false)
      setProductToDelete(null)
    }
  }

  return (
    <main className="bg-cream min-h-screen px-4 sm:px-6 lg:px-12 pt-20 pb-10">
{/* Formulario */}
      <section className="bg-cream border border-wineDark/30 rounded-2xl p-6 shadow-sm">
        <h2 className="font-display text-2xl text-wine mb-4">
          {editingId ? "Editar producto" : "Nuevo producto"}
        </h2>
        <div className="grid gap-3">
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Nombre del producto"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className="border rounded-lg px-3 py-2"
              placeholder="Precio por pieza"
              value={form.priceUnit}
              onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
            />
            <input
              type="number"
              className="border rounded-lg px-3 py-2"
              placeholder="Precio por kilo (opcional)"
              value={form.priceKilo}
              onChange={(e) => setForm({ ...form, priceKilo: e.target.value })}
            />
          </div>

          <select
            className="border rounded-lg px-3 py-2 text-wineDark"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Selecciona categoría</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files[0]
              setFile(f)
              setPreview(f ? URL.createObjectURL(f) : null)
            }}
          />
          {preview && <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded-lg border" />}

          <textarea
            className="border rounded-lg px-3 py-2"
            rows="3"
            placeholder="Descripción del producto"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
          ></textarea>

          <div className="flex gap-3">
            <button
              disabled={uploading}
              className={`${
                uploading ? "bg-gray-400" : "bg-red"
              } text-cream px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition`}
              onClick={save}
            >
              {uploading ? "Subiendo..." : editingId ? "Guardar cambios" : "Agregar"}
            </button>

            {editingId && (
              <button
                className="border border-wine/30 px-5 py-2 rounded-lg hover:bg-rose/20 transition"
                onClick={() => {
                  setEditingId(null)
                  setForm({ title: "", desc: "", priceUnit: "", priceKilo: "", category: "", img: "" })
                  setFile(null)
                  setPreview(null)
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
              <img
                src={cld(p.img, { w: 128, h: 128 })}
                alt={p.title}
                className="w-20 h-20 object-cover rounded-lg border"
              />

              <div className="flex-1">
                <div className="font-semibold text-wine">
                  {p.title}
                  {p.priceUnit && (
                    <span className="text-wineDark/60"> — Pieza: ${p.priceUnit}</span>
                  )}
                  {p.priceKilo && (
                    <span className="text-wineDark/60"> · Kilo: ${p.priceKilo}</span>
                  )}
                </div>
                <div className="text-sm text-wineDark/70">
                  {p.category} — {p.desc}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="border border-wine/30 px-3 py-1 rounded-lg hover:bg-rose/20"
                  onClick={() => {
                    setForm({
                      title: p.title || "",
                      desc: p.desc || "",
                      priceUnit: p.priceUnit || "",
                      priceKilo: p.priceKilo || "",
                      category: p.category || "",
                      img: p.img || "",
                    })
                    setEditingId(p.id)
                    setPreview(p.img || null)
                  }}
                >
                  Editar
                </button>

                <button
                  className="border border-wine/30 px-3 py-1 rounded-lg hover:bg-rose/20 text-red-600"
                  onClick={() => confirmDelete(p)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de confirmación */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold text-wine mb-4">¿Eliminar producto?</h3>
            <p className="text-sm text-wineDark mb-6">
              Estás a punto de eliminar <strong>{productToDelete?.title}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-wine/30 hover:bg-rose/20"
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red text-rose hover:opacity-90"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
