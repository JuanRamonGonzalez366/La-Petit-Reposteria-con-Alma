import React, { useEffect, useState } from "react"
import { db } from "../lib/firebase"
import { collection, onSnapshot } from "firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, X } from "lucide-react"
import { cld } from "../utils/cloudinary"
import { useCart } from "../context/CartContext"
import { toast } from "react-toastify"
import { useTranslation } from "react-i18next"

export default function Products() {
  const { t } = useTranslation()
  const FAV_KEY = "petitplaisir:favorites"
  const [showFilters, setShowFilters] = useState(false);

  const [items, setItems] = useState([])
  const [filtered, setFiltered] = useState([])
  const [favorites, setFavorites] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [activeCategory, setActiveCategory] = useState("productsAll")
  const [showFavs, setShowFavs] = useState(false)
  const [selected, setSelected] = useState(null)

  const { addToCart } = useCart()

  // Categorías con traducción usando las keys de tu archivo es.json
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
    "productsPanaderia",
    "productsReposteria",
    "productsVelas",
    "productsPedidos",
    "productsNews",
  ]

  // 🔹 Cargar productos desde Firestore
  useEffect(() => {
    const refCol = collection(db, "products")
    const unsub = onSnapshot(refCol, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setItems(docs)
      setFiltered(docs)
    })
    return () => unsub()
  }, [])

  // 🔹 Cargar favoritos del localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAV_KEY)
      if (saved) setFavorites(JSON.parse(saved))
    } catch (e) {
      console.warn("No se pudo leer favoritos:", e)
    } finally {
      setHydrated(true)
    }
  }, [])

  // 🔹 Guardar favoritos (solo después de hidratar)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites))
    } catch (e) {
      console.warn("No se pudo guardar favoritos:", e)
    }
  }, [favorites, hydrated])

  // 🔹 Filtro por categoría
  const filterByCategory = (catKey) => {
    setActiveCategory(catKey)
    setShowFavs(false)
    if (catKey === "productsAll") setFiltered(items)
    else {
      // El campo category del producto puede venir en español, así que usaremos su traducción
      const categoryLabel = t(`products.${catKey}`)
      setFiltered(items.filter((p) => p.category === categoryLabel))
    }
  }

  // 🔹 Alternar favorito
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((fid) => fid !== id)
        : [...prev, id]
    )
  }

  // 🔹 Ver solo favoritos
  const viewFavorites = () => {
    if (showFavs) {
      setFiltered(items)
      setShowFavs(false)
      setActiveCategory("productsAll")
    } else {
      setFiltered(items.filter((p) => favorites.includes(p.id)))
      setShowFavs(true)
      setActiveCategory("")
    }
  }

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[88px] px-4 sm:px-6 lg:px-12 pb-6">
      <h1 className="font-display text-3xl text-wine text-center mb-10">
        {t("products.productsTitle")}
      </h1>
      <p className="text-center text-wineDark/70 mb-8 max-w-2xl mx-auto">
        {t("products.productsDescription")}
      </p>

      {/* Botones de filtro */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((catKey) => (
          <button
            key={catKey}
            onClick={() => filterByCategory(catKey)}
            className={`bg-cream px-4 py-2 rounded-full border transition font-medium ${
              activeCategory === catKey
                ? "bg-red text-white border-red"
                : "border-wine/30 text-wine hover:bg-rose"
            }`}
          >
            {t(`products.${catKey}`)}
          </button>
        ))}

        {/* Botón de favoritos */}
        <button
          onClick={viewFavorites}
          className={`bg-cream px-4 py-2 rounded-full border transition font-medium flex items-center gap-2 ${
            showFavs
              ? "bg-red text-white border-red"
              : "border-wine/30 text-wine hover:bg-rose"
          }`}
        >
          <Heart
            size={18}
            className={showFavs ? "fill-white" : "fill-none text-red"}
          />
          {showFavs ? t("products.productsAll") : t("products.productsFav")}
        </button>
      </div>

      {/* Lista de productos */}
      {filtered.length === 0 ? (
        <p className="text-center text-wineDark flex-1 flex items-center justify-center">
          {t("products.productsNoItems", "No hay productos en esta categoría todavía.")}
        </p>
      ) : (
        <AnimatePresence>
          <motion.div
            layout
            className="grid flex-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            style={{ minHeight: 0 }} // evitar overflow
          >
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="border border-rose/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition relative bg-white"
              >
                {/* Imagen */}
                <div className="relative">
                  <img
                    src={cld(p.img, { w: 600, h: 400 })}               // tamaño principal
                    srcSet={[
                      `${cld(p.img, { w: 320, h: 214 })} 320w`,
                      `${cld(p.img, { w: 480, h: 320 })} 480w`,
                      `${cld(p.img, { w: 768, h: 512 })} 768w`,
                      `${cld(p.img, { w: 1200, h: 800 })} 1200w`,
                    ].join(", ")}
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    alt={p.title}
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />

                  {/* Corazón con animación */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    animate={{
                      scale: favorites.includes(p.id) ? [1, 1.3, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    onClick={() => toggleFavorite(p.id)}
                    className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition"
                  >
                    <Heart
                      size={22}
                      className={`${
                        favorites.includes(p.id)
                          ? "text-red fill-red"
                          : "text-wine"
                      }`}
                    />
                  </motion.button>
                </div>

                {/* Detalles */}
                <div className="p-5">
                  <h3 className="font-semibold text-wine text-lg">{p.title}</h3>
                  <p className="text-wineDark/80 text-sm mt-1 mb-3">{p.desc}</p>

                  {/* Precios */}
                  <div className="text-wineDark text-sm space-y-1">
                    <p>
                      <strong className="text-redBrand">
                        {t("products.productsPieza")}:
                      </strong>{" "}
                      ${p.priceUnit}
                    </p>
                    {p.priceKilo && (
                      <p>
                        <strong className="text-redBrand">
                          {t("products.productsKilo")}:
                        </strong>{" "}
                        ${p.priceKilo}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center gap-2">
                    <span className="text-xs text-wineDark/70">{p.category}</span>
                    <button
                      onClick={() => setSelected(p)}
                      className="bg-red text-white px-3 py-1 rounded-lg hover:opacity-90 transition text-sm"
                    >
                      {t("products.productsButton")}
                    </button>
                    {/* Botón Agregar al carrito */}
                    <button
                      onClick={() => {
                        addToCart({
                          id: p.id,
                          title: p.title,
                          price: p.priceUnit,
                          img: p.img,
                        });
                        toast.success(`"${p.title}" agregado al carrito 🛒`, { autoClose: 1500 });
                      }}
                      className="bg-red text-cream px-4 py-1 rounded-lg hover:scale-105 transition-transform text-sm shadow-md"
                    >
                      🛒
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Modal de detalle */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-md w-full p-6 relative overflow-hidden shadow-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 text-wine hover:text-redBrand"
              >
                <X size={22} />
              </button>

              <img
                src={cld(selected.img, { w: 900, h: 600 })}
                alt={selected.title}
                className="w-full h-56 object-cover rounded-lg mb-4"
                loading="eager"
                decoding="async"
              />

              <h2 className="text-2xl font-display text-wine mb-2">
                {selected.title}
              </h2>
              <p className="text-wineDark/80 text-sm mb-3">{selected.desc}</p>

              <div className="space-y-1 mb-3">
                <p>
                  <strong className="text-redBrand">{t("products.productsPieza")}:</strong> ${selected.priceUnit}
                </p>
                {selected.priceKilo && (
                  <p>
                    <strong className="text-redBrand">{t("products.productsKilo")}:</strong> ${selected.priceKilo}
                  </p>
                )}
              </div>

              <p className="text-xs text-wineDark/70">
                {t("products.productsCategory", "Categoría")}: {selected.category}
              </p>
              {/* Botón Agregar al carrito en el modal */}
              <button
                onClick={() =>
                  addToCart({
                    id: selected.id,
                    title: selected.title,
                    price: selected.priceUnit,
                    img: selected.img,
                  })
                }
                className="bg-red text-cream px-4 py-1 rounded-lg hover:opacity-90 transition"
              >
                🛒
              </button>
              
            </motion.div>
          </motion.div>
        )}

        <h1 className="font-display text-3xl text-wine  mt-8 mb-8 text-center mb-10">
        {t("products.productsNewsTitle")}
        </h1>
      </AnimatePresence>
    </main>
  )
}
