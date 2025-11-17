import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../lib/firebase";
import {collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp,} from "firebase/firestore";
import { toast } from "react-toastify";
import { safeText, getES, getEN } from "../../utils/i18nContent";

export default function CafeteriaAdmin() {
  const [items, setItems] = useState([]);
  const [activeLangTab, setActiveLangTab] = useState("es"); // es | en
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nameEs: "", nameEn: "",
    descEs: "", descEn: "",
    category: "",
    priceSmall: "", priceLarge: "", price: "",
  });

  const categories = [
    "Barra de espresso","Métodos","Frappastel", "Tés y Tisanas", "Otras bebidas y extras",
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "cafeteria"), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const validate = () => {
    if (!form.nameEs.trim()) { toast.warning("Ingresa el nombre (ES)"); return false; }
    return true;
  };

  const header = useMemo(() => (editingId ? "Editar producto" : "Nuevo producto"), [editingId]);

  const save = async () => {
    try {
      if (!validate()) return;
      setUploading(true);

      const payload = {
        name: { es: form.nameEs.trim(), en: form.nameEn.trim() },
        desc: { es: form.descEs.trim(), en: form.descEn.trim() },
        category: form.category || "",
        priceSmall: form.priceSmall ? Number(form.priceSmall) : null,
        priceLarge: form.priceLarge ? Number(form.priceLarge) : null,
        price: form.price ? Number(form.price) : null,
        updatedAt: serverTimestamp(),
        ...(editingId ? {} : { createdAt: serverTimestamp() }),
      };

      if (editingId) {
        await updateDoc(doc(db, "cafeteria", editingId), payload);
        toast.success("☕ Actualizado");
      } else {
        await addDoc(collection(db, "cafeteria"), payload);
        toast.success("☕ Agregado");
      }

      setForm({ nameEs:"",nameEn:"",descEs:"",descEn:"",category:"",priceSmall:"",priceLarge:"",price:"" });
      setEditingId(null);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (it) => {
    setForm({
      nameEs: getES(it.name), nameEn: getEN(it.name),
      descEs: getES(it.desc), descEn: getEN(it.desc),
      category: it.category || "",
      priceSmall: it.priceSmall ?? "",
      priceLarge: it.priceLarge ?? "",
      price: it.price ?? "",
    });
    setEditingId(it.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await deleteDoc(doc(db, "cafeteria", id));
    toast.info("🗑️ Eliminado");
  };

  return (
    <main className="max-w-5xl mx-auto bg-cream p-6 rounded-2xl shadow space-y-8">
      <h1 className="font-display text-3xl text-wine mb-4">Administrar Cafetería</h1>

      {/* Formulario */}
      <section className="bg-white border border-rose/30 rounded-xl p-6 grid gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl text-wine">{header}</span>
          <div className="ml-auto inline-flex rounded-lg overflow-hidden border border-wine/20">
            <button className={`px-3 py-1 text-sm ${activeLangTab==="es"?"bg-rose/30 font-semibold":"bg-white"}`} onClick={()=>setActiveLangTab("es")}>ES</button>
            <button className={`px-3 py-1 text-sm ${activeLangTab==="en"?"bg-rose/30 font-semibold":"bg-white"}`} onClick={()=>setActiveLangTab("en")}>EN</button>
          </div>
        </div>

        {activeLangTab==="es" ? (
          <>
            <input className="border rounded-lg px-3 py-2" placeholder="Nombre (ES)"
              value={form.nameEs} onChange={e=>setForm({...form,nameEs:e.target.value})}/>
            <textarea className="border rounded-lg px-3 py-2" rows="2" placeholder="Descripción (ES)"
              value={form.descEs} onChange={e=>setForm({...form,descEs:e.target.value})}/>
          </>
        ) : (
          <>
            <input className="border rounded-lg px-3 py-2" placeholder="Name (EN)"
              value={form.nameEn} onChange={e=>setForm({...form,nameEn:e.target.value})}/>
            <textarea className="border rounded-lg px-3 py-2" rows="2" placeholder="Description (EN)"
              value={form.descEn} onChange={e=>setForm({...form,descEn:e.target.value})}/>
          </>
        )}

        <select className="border rounded-lg px-3 py-2"
          value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
          <option value="">Seleccionar categoría</option>
          {categories.map((c)=> <option key={c}>{c}</option>)}
        </select>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input type="number" className="border rounded-lg px-3 py-2" placeholder="Precio chico"
            value={form.priceSmall} onChange={e=>setForm({...form,priceSmall:e.target.value})}/>
          <input type="number" className="border rounded-lg px-3 py-2" placeholder="Precio grande"
            value={form.priceLarge} onChange={e=>setForm({...form,priceLarge:e.target.value})}/>
          <input type="number" className="border rounded-lg px-3 py-2" placeholder="Precio único"
            value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
        </div>

        <button disabled={uploading} onClick={save}
          className="bg-red text-cream px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition">
          {uploading ? "Guardando..." : editingId ? "Actualizar" : "Agregar"}
        </button>
      </section>

      {/* Lista */}
      <section>
        <h2 className="font-display text-2xl text-wine mb-4">Listado</h2>
        <div className="grid gap-4">
          {items.map((p)=>(
            <div key={p.id} className="bg-white border border-wine/20 p-4 rounded-xl flex justify-between items-center gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-wine break-words">{safeText(p.name)}</h3>
                <p className="text-sm text-wineDark/70 break-words">{safeText(p.desc)}</p>
                <p className="text-xs text-wineDark/60">{p.category}</p>
                <div className="text-sm mt-1">
                  {p.priceSmall && <span>Chico: ${p.priceSmall} </span>}
                  {p.priceLarge && <span>Grande: ${p.priceLarge} </span>}
                  {p.price && <span>Precio único: ${p.price}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-1 rounded border border-rose hover:bg-rose/10" onClick={()=>handleEdit(p)}>Editar</button>
                <button className="px-3 py-1 rounded border border-red text-red hover:bg-red/10" onClick={()=>handleDelete(p.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
