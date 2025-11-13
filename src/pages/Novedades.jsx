// al inicio
import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { pickLang } from "../utils/i18nContent";
import { cld } from "../utils/cloudinary";
// import { toast } from "react-toastify"; // si luego agregas un botón “Agregar al carrito”

export default function Novedades() {
  const { t, i18n } = useTranslation();

  const lang = i18n.language?.startsWith("en") ? "en" : "es";

  const [items, setItems] = useState([]);
  const [tag, setTag] = useState("all");
  const [season, setSeason] = useState("all");
  const [onlyActive, setOnlyActive] = useState(true);

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

      const tagOk =
        tag === "all" || (Array.isArray(n.tags) && n.tags.includes(tag));
      const seasonOk =
        season === "all" ||
        (n.season || "").toLowerCase() === season.toLowerCase();

      return inWindow && tagOk && seasonOk;
    });
  }, [items, tag, season, onlyActive]);

  const allTags = useMemo(() => {
    const set = new Set();
    items.forEach((n) => (n.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [items]);

  const allSeasons = useMemo(() => {
    const set = new Set();
    items.forEach((n) => n.season && set.add(n.season));
    return Array.from(set);
  }, [items]);

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] px-4 sm:px-6 lg:px-12 pb-10">
      <h1 className="font-display text-4xl text-wine mb-6 text-center">
        {t("nov.title", "Novedades & Temporadas")}
      </h1>
      <p className="text-wineDark/80 mb-8 text-center">
        {t("nov.subtitle", "Ediciones especiales y productos por temporada.")}
      </p>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center mb-8 text-center">
        <label className="flex items-center gap-2 text-sm text-wineDark/80 text-center">
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
          <option value="all">
            {t("nov.allSeasons", "Todas las temporadas")}
          </option>
          {allSeasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-wineDark/70">
          {t("nov.empty", "No hay novedades disponibles por ahora.")}
        </p>
      ) : (
        <AnimatePresence>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              // en el map
              const title = pickLang(item.title, lang);
              const desc = pickLang(item.desc, lang);

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="bg-white border border-rose/30 rounded-2xl overflow-hidden shadow-suave"
                >
                  {/* 👇 No renderizar img si no hay URL */}
                  {item.img ? (
                    <img
                      src={cld(item.img, { w: 900, h: 600 })}
                      alt={title}
                      className="w-full h-56 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-56 bg-rose/10 border-b border-rose/30 flex items-center justify-center text-sm text-wineDark/70">
                      Sin imagen
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-wine font-semibold text-lg">
                        {title}
                      </h3>
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
                  </div>
                </motion.article>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </main>
  );
}
