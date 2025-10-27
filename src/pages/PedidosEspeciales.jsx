import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export default function PedidosEspeciales() {
  const { t } = useTranslation();

  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);

  // 🔹 Categorías principales
  const categories = [
    "Todos",
    "Infantiles",
    "15 Años",
    "Bodas",
    "Bautizo",
    "Primera Comunion",
    "Confirmacion",
    "Fondant",
    "Psteles de pisos"
  ];

  // 🔹 Cargar productos desde Firestore (colección "pedidosEspeciales")
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pedidosEspeciales"), (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Ordenar: destacados primero
      const sorted = docs.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));

      setItems(sorted);
      setFiltered(sorted);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 🔹 Filtrar por categoría
  const filterByCategory = (cat) => {
    setActiveCategory(cat);
    if (cat === "Todos") setFiltered(items);
    else setFiltered(items.filter((p) => p.category === cat));
  };

  // 🔹 Link de WhatsApp general (Pedidos Especiales)
  const whatsappGeneral =
    "https://api.whatsapp.com/send?phone=5213318501155&text=Hola!%20Quisiera%20realizar%20un%20pedido%20especial.%20%F0%9F%8E%82";

  return (
    <main className="bg-cream min-h-screen px-4 sm:px-6 lg:px-12 pt-24 pb-16">
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-4xl text-wine mb-4">
          {t("special.title", "Pedidos Especiales")}
        </h1>
        <p className="text-wineDark/80 max-w-2xl mx-auto">
          {t(
            "special.subtitle",
            "Celebra tus momentos más importantes con un pastel único, hecho especialmente para ti. Consulta nuestras categorías y contáctanos por WhatsApp para cotizar tu pedido."
          )}
        </p>
      </motion.div>

      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => filterByCategory(cat)}
            className={`px-4 py-2 rounded-full border transition font-medium ${
              activeCategory === cat
                ? "bg-red text-white border-red"
                : "bg-marfil border-wine/30 text-wine hover:bg-rose/30"
            }`}
          >
            {cat}
          </button>
        ))}
        
      </div>

      {/* CTA WhatsApp general */}
      <div className="text-center mt-8 mb-8">
        <a
          href={whatsappGeneral}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-green-600 text-white text-lg font-semibold px-8 py-4 rounded-full hover:bg-green-700 shadow-md transition"
        >
          <FontAwesomeIcon icon={faWhatsapp} className="w-6 h-6" />
          {t("special.cta", "Realiza tu pedido especial")}
        </a>
      </div>

      {/* Productos */}
      <section className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {loading ? (
            <p className="text-center text-wineDark/70 col-span-full">
              {t("special.loading", "Cargando pasteles especiales...")}
            </p>
          ) : filtered.length > 0 ? (
            filtered.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-rose/30 rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
              >
                {/* Imagen */}
                <div className="h-60 w-full overflow-hidden">
                  <img
                    src={p.img || p.imagen}
                    alt={p.name || p.nombre}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="p-5 text-center flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-display text-xl text-wine mb-2">
                      {p.name || p.nombre}
                    </h3>
                    <p className="text-sm text-wineDark/70">{p.desc || p.descripcion}</p>
                    {p.category && (
                      <p className="mt-2 text-xs text-wineDark/60 italic">
                        {p.category}
                      </p>
                    )}
                  </div>

                  {/* Precio (opcional) */}
                  {p.price && (
                    <p className="mt-3 font-semibold text-wineDark">
                      ${p.price.toFixed(2)} MXN
                    </p>
                  )}

                  {/* Botón de WhatsApp individual */}
                  <a
                    href={`https://api.whatsapp.com/send?phone=5213318501155&text=Hola!%20Estoy%20interesado%20en%20el%20${encodeURIComponent(
                      p.name || p.nombre
                    )}.%20%F0%9F%8E%82`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 bg-green-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-green-700 transition"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                    {t("special.ctaProduct", "Consultar por este pastel")}
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-wineDark/70 col-span-full">
              {t("special.noResults", "No hay productos en esta categoría todavía.")}
            </p>
          )}
        </AnimatePresence>
      </section>

      
    </main>
  );
}
