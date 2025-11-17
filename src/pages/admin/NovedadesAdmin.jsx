// src/pages/admin/NovedadesAdmin.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { cld } from "../../utils/cloudinary";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

// Helpers i18n
const safeText = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return v.es || v.en || "";
  return String(v);
};
const getES = (v) => (typeof v === "string" ? v : v?.es || "");
const getEN = (v) => (typeof v === "string" ? "" : v?.en || "");

// Cloudinary
const uploadToCloudinary = async (file) => {
  const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD;
  const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;
  if (!CLOUD || !PRESET) {
    throw new Error(
      "⚠️ Faltan variables de entorno: VITE_CLOUDINARY_CLOUD / VITE_CLOUDINARY_PRESET"
    );
  }

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
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Error subiendo imagen a Cloudinary");
  }
  if (!data.secure_url) throw new Error("Subida sin URL");
  return data.secure_url;
};

const emptyForm = {
  titleEs: "",
  titleEn: "",
  descEs: "",
  descEn: "",
  price: "",
  img: "",
  tags: "",
  season: "",
  active: true,
  activeFrom: "",
  activeTo: "",
  priority: 0,
};

export default function NovedadesAdmin() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState("es"); // "es" | "en"
  const [fileName, setFileName] = useState("");

  // Cargar novedades
  useEffect(() => {
    const refCol = collection(db, "novelties");
    const unsub = onSnapshot(refCol, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      setItems(docs);
    });
    return () => unsub();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName("");
      return;
    }
    setUploading(true);
    setFileName(file.name);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, img: url }));
      toast.success(t("Imagen subida ✅"));
    } catch (err) {
      console.error(err);
      toast.error(
        t("Error subiendo imagen: {{msg}}", { msg: err.message || "" })
      );
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (!form.titleEs.trim()) {
        toast.warn(t("El título (ES) es obligatorio"));
        return;
      }

      const payload = {
        title: { es: form.titleEs.trim(), en: form.titleEn.trim() },
        desc: { es: form.descEs.trim(), en: form.descEn.trim() },
        price: form.price !== "" ? Number(form.price) : null,
        img: form.img || "",
        tags: form.tags
          ? form.tags
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        season: form.season || "",
        active: !!form.active,
        activeFrom: form.activeFrom ? new Date(form.activeFrom) : null,
        activeTo: form.activeTo ? new Date(form.activeTo) : null,
        priority: Number(form.priority) || 0,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "novelties", editingId), payload);
        toast.success(t("Novedad actualizada ✅"));
        setEditingId(null);
      } else {
        await addDoc(collection(db, "novelties"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success(t("Novedad agregada ✅"));
      }
      setForm(emptyForm);
      setFileName("");
      setActiveLangTab("es");
    } catch (err) {
      console.error(err);
      toast.error(t("Error al guardar"));
    }
  };

  const edit = (n) => {
    const activeFromStr =
      n.activeFrom?.toDate && typeof n.activeFrom.toDate === "function"
        ? n.activeFrom.toDate().toISOString().slice(0, 16)
        : "";
    const activeToStr =
      n.activeTo?.toDate && typeof n.activeTo.toDate === "function"
        ? n.activeTo.toDate().toISOString().slice(0, 16)
        : "";

    setEditingId(n.id);
    setForm({
      titleEs: getES(n.title) || n.title || "",
      titleEn: getEN(n.title),
      descEs: getES(n.desc) || n.desc || "",
      descEn: getEN(n.desc),
      price: typeof n.price === "number" ? n.price : "",
      img: n.img || "",
      tags: Array.isArray(n.tags) ? n.tags.join(", ") : "",
      season: n.season || "",
      active: n.active !== false,
      activeFrom: activeFromStr,
      activeTo: activeToStr,
      priority: n.priority || 0,
    });
    setFileName("");
    setActiveLangTab("es");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeItem = async (id) => {
    if (!confirm(t("¿Eliminar esta novedad?"))) return;
    try {
      await deleteDoc(doc(db, "novelties", id));
      toast.success(t("Novedad eliminada 🗑️"));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
        setFileName("");
      }
    } catch (err) {
      console.error(err);
      toast.error(t("Error al eliminar"));
    }
  };

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[88px] px-4 sm:px-6 lg:px-12 pb-8">
      {/* Encabezado */}
      <h1 className="font-display text-3xl text-wine text-center mb-3">
        {t("Novedades · Admin")}
      </h1>
      <p className="text-center text-wineDark/70 mb-6 max-w-2xl mx-auto">
        {t("Administra los productos o promociones de temporada")}
      </p>

      {/* FORMULARIO */}
      <section className="max-w-3xl mx-auto bg-white border border-rose/30 rounded-2xl p-5 sm:p-6 shadow-soft mb-10">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 className="text-xl font-serif font-semibold text-wine">
            {editingId ? t("Editar novedad") : t("Nueva novedad")}
          </h2>

          <div className="flex border border-wine/30 rounded-lg overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setActiveLangTab("es")}
              className={`px-3 py-1 ${
                activeLangTab === "es" ? "bg-rose/30 font-semibold" : "bg-white"
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setActiveLangTab("en")}
              className={`px-3 py-1 ${
                activeLangTab === "en" ? "bg-rose/30 font-semibold" : "bg-white"
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          {/* Título */}
          {activeLangTab === "es" ? (
            <div>
              <label className="block text-sm font-medium text-wine/80 mb-1">
                {t("Título (ES)")}
              </label>
              <input
                type="text"
                value={form.titleEs}
                onChange={handleChange("titleEs")}
                className="w-full border border-wine/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wine/50"
                placeholder={t("Ej. Pan de muerto, buñuelos patrios, etc.")}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-wine/80 mb-1">
                {t("Title (EN)")}
              </label>
              <input
                type="text"
                value={form.titleEn}
                onChange={handleChange("titleEn")}
                className="w-full border border-wine/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wine/50"
                placeholder={t("E.g. Autumn collection")}
              />
            </div>
          )}

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-wine/80 mb-1">
              {t("Precio (opcional)")}
            </label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange("price")}
              className="w-full border border-wine/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wine/50"
              placeholder={t("Ej. 299")}
            />
          </div>

          {/* Descripción */}
          {activeLangTab === "es" ? (
            <div>
              <label className="block text-sm font-medium text-wine/80 mb-1">
                {t("Descripción (ES)")}
              </label>
              <textarea
                value={form.descEs}
                onChange={handleChange("descEs")}
                className="w-full border border-wine/20 rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-wine/50"
                placeholder={t("Escribe una descripción breve...")}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-wine/80 mb-1">
                {t("Description (EN)")}
              </label>
              <textarea
                value={form.descEn}
                onChange={handleChange("descEn")}
                className="w-full border border-wine/20 rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-wine/50"
                placeholder={t("Write a short description...")}
              />
            </div>
          )}

          {/* Temporada */}
          <div>
            <label className="block text-sm font-medium text-wine/80 mb-1">
              {t("Temporada")}
            </label>
            <input
              type="text"
              value={form.season}
              onChange={handleChange("season")}
              className="w-full border border-wine/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wine/50"
              placeholder={t("Ej. Invierno 2025")}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-wine/80 mb-1">
              {t("Tags (coma separada)")}
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={handleChange("tags")}
              className="w-full border border-wine/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wine/50"
              placeholder={t("Ej. halloween, navidad, dia, de, los, muertos")}
            />
          </div>

          {/* Fechas */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-wine/80 mb-1">
                {t("Activo desde")}
              </label>
              <input
                type="datetime-local"
                value={form.activeFrom}
                onChange={handleChange("activeFrom")}
                className="w-full border border-wine/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wine/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-wine/80 mb-1">
                {t("Activo hasta")}
              </label>
              <input
                type="datetime-local"
                value={form.activeTo}
                onChange={handleChange("activeTo")}
                className="w-full border border-wine/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wine/50"
              />
            </div>
          </div>

          {/* Prioridad + Activo */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-wine/80 mb-1">
                {t("Prioridad")}
              </label>
              <input
                type="number"
                value={form.priority}
                onChange={handleChange("priority")}
                className="w-full border border-wine/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wine/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-wine/80 mb-1">
                {t("Activo")}
              </label>
              <select
                value={form.active ? "true" : "false"}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, active: e.target.value === "true" }))
                }
                className="w-full border border-wine/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-wine/50"
              >
                <option value="true">{t("Sí")}</option>
                <option value="false">{t("No")}</option>
              </select>
            </div>
          </div>

          {/* Imagen: input custom para móvil */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-wine/80 mb-1">
              {t("Imagen")}
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center px-3 py-2 rounded-lg bg-wine text-cream text-sm cursor-pointer hover:bg-wine/90">
                {t("Subir imagen")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>
              <span className="text-xs text-wineDark/70 truncate max-w-[170px] sm:max-w-xs">
                {fileName || form.img ? fileName || t("Imagen seleccionada") : t("Ningún archivo seleccionado")}
              </span>
              {uploading && (
                <span className="text-xs text-wineDark/70">
                  {t("Subiendo…")}
                </span>
              )}
            </div>

            {form.img ? (
              <img
                src={cld(form.img, { w: 900, h: 400 })}
                alt="preview"
                className="mt-2 rounded-lg border border-rose/20 max-h-48 w-full object-cover"
              />
            ) : (
              <div className="mt-2 h-32 rounded-lg border border-rose/20 bg-rose/10 text-wineDark/70 flex items-center justify-center text-sm">
                {t("Sin imagen")}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto bg-wine text-cream px-4 py-2 rounded-lg font-medium text-sm hover:bg-wine/90 transition"
            >
              {editingId ? t("Actualizar") : t("Guardar")}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setFileName("");
                  setActiveLangTab("es");
                }}
                className="w-full sm:w-auto border border-wine text-wine px-4 py-2 rounded-lg font-medium text-sm hover:bg-rose/10 transition"
              >
                {t("Cancelar")}
              </button>
            )}
          </div>
        </form>
      </section>

      {/* LISTA DE NOVEDADES */}
      <section className="max-w-5xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-rose/30 rounded-2xl overflow-hidden shadow-suave"
          >
            {n.img ? (
              <img
                src={cld(n.img, { w: 900, h: 500 })}
                alt={safeText(n.title)}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-rose/10 border-b border-rose/30 flex items-center justify-center text-sm text-wineDark/70">
                {t("Sin imagen")}
              </div>
            )}

            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-wine font-semibold break-words">
                  {safeText(n.title)}
                </h3>
                {typeof n.price === "number" && (
                  <span className="text-wineDark font-semibold">
                    ${n.price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-wineDark/80 mt-1 line-clamp-3 break-words">
                {safeText(n.desc)}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {n.season && (
                  <span className="text-xs bg-rose/20 text-wine px-2 py-1 rounded-full">
                    {n.season}
                  </span>
                )}
                {(n.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs border border-rose/30 px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-wineDark/70">
                <span>
                  {t("Activo")}: {n.active !== false ? t("Sí") : t("No")}
                </span>
                <span>
                  {t("Prioridad")}: {n.priority || 0}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => edit(n)}
                  className="bg-cream border border-wine px-3 py-1 rounded-lg text-wine hover:bg-rose/10 text-sm"
                >
                  {t("Editar")}
                </button>
                <button
                  onClick={() => removeItem(n.id)}
                  className="bg-red text-cream px-3 py-1 rounded-lg hover:bg-wine/90 text-sm"
                >
                  {t("Eliminar")}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
