// src/pages/Novedades.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { pickLang } from "../utils/i18nContent";
import { cld } from "../utils/cloudinary";
import { X } from "lucide-react";

export default function Novedades() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "es";

  const [items, setItems] = useState([]);
  const [tag, setTag] = useState("all");
  const [season, setSeason] = useState("all");
  const [onlyActive, setOnlyActive] = useState(true);

  const [selected, setSelected] = useState(null); // ✅ modal

  useEffect(() => {
    const ref = collection(db, "novelties");
    const q = query(ref, orderBy("priority", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(docs);
    });
    return () => unsub();
  }, []);

  const now = new Date();

  const filtered = useMemo(() => {
    return items.filter((n) => {
      const from = n.activeFrom?.toDate
        ? n.activeFrom.toDate()
        : n.activeFrom
        ? new Date(n.activeFrom)
        : null;
      const to = n.activeTo?.toDate
        ? n.activeTo.toDate()
        : n.activeTo
        ? new Date(n.activeTo)
        : null;

      const inWindow =
        !onlyActive ||
        ((n.active !== false) && (!from || now >= from) && (!to || now <= to));

      const tagOk = tag === "all" || (Array.isArray(n.tags) && n.tags.includes(tag));
      const seasonOk =
        season === "all" || (n.season || "").toLowerCase() === season.toLowerCase();

      return inWindow && tagOk && seasonOk;
    });
  }, [items, tag, season, onlyActive]);

  const allTags = useMemo(() => {
    const set = new Set();
    items.forEach((n) => (n.tags || []).forEach((tg) => set.add(tg)));
    return Array.from(set);
  }, [items]);

  const allSeasons = useMemo(() => {
    const set = new Set();
    items.forEach((n) => n.season && set.add(n.season));
    return Array.from(set);
  }, [items]);

  // ✅ Helper: devuelve URL correcta SIN 400
  const isHttpUrl = (s) => typeof s === "string" && /^https?:\/\//i.test(s);
  const isCloudinaryUrl = (s) =>
    isHttpUrl(s) && s.includes("res.cloudinary.com") && s.includes("/image/upload/");

  // Inyecta transformaciones en una URL Cloudinary existente:
  // https://res.cloudinary.com/<cloud>/image/upload/<resto>
  // => https://res.cloudinary.com/<cloud>/image/upload/<TRANS>/<resto>
  const withCloudinaryTransform = (url, transform) => {
    if (!isCloudinaryUrl(url)) return url;
    const marker = "/image/upload/";
    const [base, rest] = url.split(marker);
    // Evita duplicar transform si ya trae algo
    // (si rest ya empieza con algo como "w_..." o "c_fill,...")
    const restStartsWithTransform = /^[a-z]_[^/]+,/i.test(rest) || /^[a-z]_[^/]+\//i.test(rest);
    if (restStartsWithTransform) return url; // ya transformada, no la toques
    return `${base}${marker}${transform}/${rest}`;
  };

  // ✅ Imagen "card" (ligera) + "modal" (grande)
  const cardImgUrl = (img) => {
    if (!img) return "";
    if (isCloudinaryUrl(img)) return withCloudinaryTransform(img, "w_900,h_560,c_fill,g_auto,f_auto,q_auto");
    if (isHttpUrl(img)) return img; // url externa
    // si fuera public_id:
    return cld(img, { w: 900, h: 560, fit: "fill", g: "auto" });
  };

  const modalImgUrl = (img) => {
    if (!img) return "";
    if (isCloudinaryUrl(img)) return withCloudinaryTransform(img, "w_1800,h_1200,c_fit,f_auto,q_auto");
    if (isHttpUrl(img)) return img;
    return cld(img, { w: 1800, h: 1200, fit: "fill", g: "auto" });
  };

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] px-4 sm:px-6 lg:px-12 pb-10">
      <h1 className="font-agenda font-bold text-4xl text-wine mb-6 text-center">
        {t("nov.title", "Novedades & Temporadas")}
      </h1>
      <p className="font-agenda text-wineDark/80 mb-8 text-center">
        {t("nov.subtitle", "Ediciones especiales y productos por temporada.")}
      </p>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center mb-8 justify-center">
        <label className="flex items-center gap-2 text-sm text-wineDark/80">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
          />
          {t("nov.filterActive", "Sólo activas")}
        </label>

        <select
          className="border border-rose/40 bg-white rounded-lg px-3 py-2 text-sm text-wine"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="all">{t("nov.allTags", "Todas las etiquetas")}</option>
          {allTags.map((tg) => (
            <option key={tg} value={tg}>
              {tg}
            </option>
          ))}
        </select>

        <select
          className="border border-rose/40 bg-white rounded-lg px-3 py-2 text-sm text-wine"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
        >
          <option value="all">{t("nov.allSeasons", "Todas las temporadas")}</option>
          {allSeasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-wineDark/70 text-center">
          {t("nov.empty", "No hay novedades disponibles por ahora.")}
        </p>
      ) : (
        <AnimatePresence>
          <div className="font-agenda grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const title = pickLang(item.title, lang) || "";
              const desc = pickLang(item.desc, lang) || "";
              const img = item.img || "";

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="bg-white border border-rose/30 rounded-2xl overflow-hidden shadow-suave"
                >
                  {/* Imagen clickeable */}
                  {img ? (
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="block w-full text-left"
                      title={t("nov.viewMore", "Ver más")}
                    >
                      <img
                        src={cardImgUrl(img)}
                        alt={title}
                        className="w-full h-56 object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ) : (
                    <div className="w-full h-56 bg-rose/10 border-b border-rose/30 flex items-center justify-center text-sm text-wineDark/70">
                      Sin imagen
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-wine font-semibold text-lg">{title}</h3>
                      {typeof item.price === "number" && (
                        <span className="text-wineDark font-semibold">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-wineDark/80 mt-1">{desc}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.season && (
                        <span className="text-xs bg-rose/20 text-wine px-2 py-1 rounded-full">
                          {item.season}
                        </span>
                      )}
                      {(item.tags || []).map((tg) => (
                        <span
                          key={tg}
                          className="text-xs bg-cream border border-rose/30 text-wine px-2 py-1 rounded-full"
                        >
                          #{tg}
                        </span>
                      ))}
                    </div>

                    {/* Botón “Ver más” */}
                    {img ? (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => setSelected(item)}
                          className="bg-red text-cream px-4 py-2 rounded-lg hover:opacity-90 transition text-sm"
                        >
                          {t("nov.viewMore", "Ver más")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* ✅ Modal */}
      <AnimatePresence>
        {selected && (
          <NovedadModal
            item={selected}
            lang={lang}
            t={t}
            modalImgUrl={modalImgUrl}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function NovedadModal({ item, lang, t, modalImgUrl, onClose }) {
  const title = pickLang(item.title, lang) || "";
  const desc = pickLang(item.desc, lang) || "";
  const img = item.img || "";

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-3xl p-5 sm:p-6 relative shadow-xl overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-wine hover:text-red"
          aria-label="Cerrar"
        >
          <X size={22} />
        </button>

        {/* Imagen grande SIN recorte */}
        {img ? (
          <div className="w-full bg-cream rounded-xl border border-rose/20 p-2">
            <img
              src={modalImgUrl(img)}
              alt={title}
              className="w-full max-h-[70vh] object-contain rounded-lg"
              loading="eager"
              decoding="async"
            />
          </div>
        ) : null}

        <div className="mt-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-display text-wine">{title}</h2>
            {typeof item.price === "number" && (
              <span className="text-wine font-semibold text-lg">
                ${item.price.toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-wineDark/80 mt-2">{desc}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {item.season && (
              <span className="text-xs bg-rose/20 text-wine px-2 py-1 rounded-full">
                {item.season}
              </span>
            )}
            {(item.tags || []).map((tg) => (
              <span
                key={tg}
                className="text-xs bg-cream border border-rose/30 text-wine px-2 py-1 rounded-full"
              >
                #{tg}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
