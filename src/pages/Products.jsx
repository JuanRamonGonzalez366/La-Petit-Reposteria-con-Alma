import React, { useEffect, useMemo, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { cld } from "../utils/cloudinary";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { pickLang } from "../utils/locales";

export default function Products() {
  const { t, i18n } = useTranslation();
  const lang = i18n?.language || "es";

  const FAV_KEY = "petitplaisir:favorites";

  const QR_MENU =
    "https://res.cloudinary.com/dzjupasme/image/upload/v1765921052/ox5roqywhdisaogvh97g.png";
  const MENU_PDF =
    "https://res.cloudinary.com/dzjupasme/image/upload/v1765899511/kxgjvmwlvdulddobsjly.pdf";

  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [activeCategory, setActiveCategory] = useState("productsAll");
  const [showFavs, setShowFavs] = useState(false);
  const [selected, setSelected] = useState(null);

  const { addToCart } = useCart();

  const categories = [
    "productsAll",
    "productsChoco",
    "productsVainilla",
    "productsQueso",
    "productsTresLeches",
    "productsCafe",
    "productsClasico",
    "productsGelatina",
    "productsAzucar",
    "productsGalleteria",
    "productsPanaderia",
    "productsReposteria",
  ];

  useEffect(() => {
    const refCol = collection(db, "products");
    const unsub = onSnapshot(refCol, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(docs);
      setFiltered(docs);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAV_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    } catch (e) {
      console.warn("No se pudo leer favoritos:", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn("No se pudo guardar favoritos:", e);
    }
  }, [favorites, hydrated]);

  const filterByCategory = (catKey) => {
    setActiveCategory(catKey);
    setShowFavs(false);
    if (catKey === "productsAll") return setFiltered(items);

    const translatedLabel = t(`products.${catKey}`);
    const next = items.filter((p) => {
      if (p.categoryKey) return p.categoryKey === catKey;
      return p.category === translatedLabel;
    });
    setFiltered(next);
  };

  const viewFavorites = () => {
    if (showFavs) {
      setFiltered(items);
      setShowFavs(false);
      setActiveCategory("productsAll");
    } else {
      setFiltered(items.filter((p) => favorites.includes(p.id)));
      setShowFavs(true);
      setActiveCategory("");
    }
  };

  const titleOf = (p) => pickLang(p.title, lang);
  const descOf = (p) => pickLang(p.desc, lang);
  const categoryLabelOf = (p) => p.category || "";

  // Normaliza “variantes de precio”:
  // - Si existe p.prices[] úsalo
  // - Si no, crea variantes con priceUnit/priceKilo
  const priceOptionsOf = (p) => {
    if (Array.isArray(p.prices) && p.prices.length) {
      return p.prices
        .filter((x) => x && x.label && typeof x.amount !== "undefined")
        .map((x) => ({ label: String(x.label), amount: Number(x.amount) || 0 }));
    }
    const opts = [];
    if (typeof p.priceUnit !== "undefined" && p.priceUnit !== null) {
      opts.push({ label: t("products.productsPieza", "Pieza"), amount: Number(p.priceUnit) || 0 });
    }
    if (typeof p.priceKilo !== "undefined" && p.priceKilo !== null) {
      opts.push({ label: t("products.productsKilo", "Kilo"), amount: Number(p.priceKilo) || 0 });
    }
    return opts;
  };

  const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[88px] px-4 sm:px-6 lg:px-12 pb-6">
      {/* Header con QR */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_220px]">
          <div className="flex flex-col items-center">
            <h1 className="font-agend font-bold text-3xl text-wine text-center mb-4">
              {t("products.productsTitle")}
            </h1>
            <p className="font-maison neue text-center text-wineDark/70 max-w-xl">
              {t("products.productsDescription")}
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <a href={MENU_PDF} target="_blank" rel="noopener noreferrer" className="group" title="Abrir menú">
              <img
                src={QR_MENU}
                alt="QR menú"
                className="w-40 h-40 md:w-48 md:h-48 rounded-xl border border-wine/20 shadow-sm group-hover:shadow-md transition"
                loading="lazy"
                decoding="async"
              />
              <p className="text-xs text-wineDark/70 text-center mt-2">Escanea para ver el menú</p>
            </a>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="font-maison neue flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((catKey) => (
          <button
            key={catKey}
            onClick={() => filterByCategory(catKey)}
            className={`bg-cream px-4 py-2 rounded-full border transition font-medium ${
              activeCategory === catKey ? "bg-red text-white border-red" : "border-wine/30 text-wine hover:bg-rose"
            }`}
          >
            {t(`products.${catKey}`)}
          </button>
        ))}

        <button
          onClick={viewFavorites}
          className={`bg-cream px-4 py-2 rounded-full border transition font-medium flex items-center gap-2 ${
            showFavs ? "bg-red text-white border-red" : "border-wine/30 text-wine hover:bg-rose"
          }`}
        >
          <Heart size={18} className={showFavs ? "fill-white" : "fill-none text-red"} />
          {showFavs ? t("products.productsAll") : t("products.productsFav")}
        </button>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p className="text-center text-wineDark flex-1 flex items-center justify-center">
          {t("products.productsNoItems", "No hay productos en esta categoría todavía.")}
        </p>
      ) : (
        <AnimatePresence>
          <motion.div layout className="font-maison neue grid flex-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" style={{ minHeight: 0 }}>
            {filtered.map((p) => {
              const title = titleOf(p);
              const desc = descOf(p);
              const catLabel = categoryLabelOf(p);
              const options = priceOptionsOf(p);

              // opción por defecto para el botón rápido 🛒
              const defaultOption = options[0] || { label: t("products.productsPieza", "Pieza"), amount: Number(p.priceUnit) || 0 };

              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition relative bg-white"
                >
                  {/* Imagen uniforme */}
                  <div className="relative">
                    <img
                      src={cld(p.img, { w: 900, h: 675, ar: "4:3", fit: "fill", g: "auto" })}
                      srcSet={[
                        `${cld(p.img, { w: 480, h: 360, ar: "4:3", fit: "fill", g: "auto" })} 480w`,
                        `${cld(p.img, { w: 768, h: 576, ar: "4:3", fit: "fill", g: "auto" })} 768w`,
                        `${cld(p.img, { w: 1200, h: 900, ar: "4:3", fit: "fill", g: "auto" })} 1200w`,
                      ].join(", ")}
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      alt={title || "Producto"}
                      className="w-full aspect-[4/3] object-cover bg-cream"
                      loading="lazy"
                      decoding="async"
                    />

                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      animate={{ scale: favorites.includes(p.id) ? [1, 1.3, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                      onClick={() =>
                        setFavorites((prev) => (prev.includes(p.id) ? prev.filter((fid) => fid !== p.id) : [...prev, p.id]))
                      }
                      className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition"
                    >
                      <Heart size={22} className={favorites.includes(p.id) ? "text-red fill-red" : "text-wine"} />
                    </motion.button>
                  </div>

                  {/* Detalles */}
                  <div className="p-5">
                    <h3 className="font-semibold text-wine text-lg">{title}</h3>
                    <p className="text-wineDark/80 text-sm mt-1 mb-3">{desc}</p>

                    {/* Precios flexibles */}
                    <div className="text-wineDark text-sm space-y-1">
                      {options.length ? (
                        options.slice(0, 3).map((op, idx) => (
                          <p key={idx}>
                            <strong className="text-red">{op.label}:</strong> {fmt(op.amount)}
                          </p>
                        ))
                      ) : (
                        <p className="text-wineDark/60">Precio no disponible</p>
                      )}
                      {options.length > 3 ? (
                        <p className="text-xs text-wineDark/60">+ {options.length - 3} opciones más</p>
                      ) : null}
                    </div>

                    <div className="mt-4 flex justify-between items-center gap-2">
                      <span className="text-xs text-wineDark/70">{catLabel}</span>

                      <button
                        onClick={() => setSelected(p)}
                        className="bg-red text-white px-3 py-1 rounded-lg hover:opacity-90 transition text-sm"
                      >
                        {t("products.productsButton")}
                      </button>

                      <button
                        onClick={() => {
                          addToCart({
                            id: p.id,
                            title: title || "Producto",
                            price: defaultOption.amount,
                            img: p.img,
                            options: { variantLabel: defaultOption.label },
                          });
                          toast.success(`"${title || "Producto"}" agregado 🛒`, { autoClose: 1500 });
                        }}
                        className="bg-red text-cream px-4 py-1 rounded-lg hover:scale-105 transition-transform text-sm shadow-md"
                        title="Agregar al carrito"
                      >
                        🛒
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <ProductModal
            product={selected}
            lang={lang}
            t={t}
            onClose={() => setSelected(null)}
            addToCart={addToCart}
            titleOf={titleOf}
            descOf={descOf}
            priceOptionsOf={priceOptionsOf}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function ProductModal({ product, lang, t, onClose, addToCart, titleOf, descOf, priceOptionsOf }) {
  const title = titleOf(product);
  const desc = descOf(product);
  const options = priceOptionsOf(product);
  const [picked, setPicked] = useState(options[0] || null);

  const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

  useEffect(() => {
    setPicked(options[0] || null);
  }, [product?.id]); // cuando cambia el producto

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-md w-full p-6 relative overflow-hidden shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-wine hover:text-red">
          <X size={22} />
        </button>

        <img
          src={cld(product.img, { w: 1200, h: 900, ar: "4:3", fit: "fill", g: "auto" })}
          alt={title || "Producto"}
          className="w-full aspect-[4/3] object-cover rounded-lg mb-4 bg-cream"
          loading="eager"
          decoding="async"
        />

        <h2 className="text-2xl font-display text-wine mb-2">{title}</h2>
        <p className="text-wineDark/80 text-sm mb-3">{desc}</p>

        {/* Selector de variante */}
        {options.length ? (
          <div className="space-y-2 mb-4">
            <p className="text-sm text-wine font-semibold">Selecciona presentación:</p>
            <div className="grid grid-cols-1 gap-2">
              {options.map((op, idx) => {
                const active = picked?.label === op.label;
                return (
                  <button
                    key={idx}
                    onClick={() => setPicked(op)}
                    className={`text-left px-3 py-2 rounded-lg border transition ${
                      active ? "border-red bg-rose/20" : "border-wine/20 hover:bg-rose/10"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-wine">{op.label}</span>
                      <span className="font-semibold text-wine">{fmt(op.amount)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-wineDark/70 mb-4">Precio no disponible.</p>
        )}

        <button
          disabled={!picked}
          onClick={() => {
            addToCart({
              id: product.id,
              title: title || "Producto",
              price: picked?.amount || 0,
              img: product.img,
              options: { variantLabel: picked?.label || "" },
            });
            onClose();
          }}
          className="bg-red text-cream px-4 py-2 rounded-lg hover:opacity-90 transition w-full disabled:opacity-50"
        >
          Agregar al carrito 🛒
        </button>
      </motion.div>
    </motion.div>
  );
}
