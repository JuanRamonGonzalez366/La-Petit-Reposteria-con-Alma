// al inicio
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { pickLang } from "../utils/i18nContent";

export default function Cafeteria() {
  const { t, i18n } = useTranslation();

  // donde renders los items:
  const lang = i18n.language?.startsWith("en") ? "en" : "es";

  const { addToCart } = useCart();
  const [menu, setMenu] = useState([]);

  // === CARGAR PRODUCTOS DESDE FIRESTORE ===
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "cafeteria"), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Agrupar por categoría
      const grouped = docs.reduce((acc, item) => {
        const cat = item.category || "Otros";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});

      // Convertimos entries a array y forzamos que "Otras bebidas y extras" sea el último
      let entries = Object.entries(grouped);
      const targetCategory = "Otras bebidas y extras";
      const otrasBebidasIndex = entries.findIndex(([category]) => category === targetCategory);

      if (otrasBebidasIndex !== -1) {
        const [otrasBebidas] = entries.splice(otrasBebidasIndex, 1);
        entries.push(otrasBebidas);
      }

      setMenu(
        entries.map(([category, items]) => ({
          category,
          items,
        }))
      );
    });

    return () => unsub();
  }, []);

  // === SUCURSALES CON CAFETERÍA ===
  const sucursalesCafeteria = [
    {
      id: "rio-nilo",
      name: "" + t("cafe.cafeteriaBranch1"),
      address: "Av. Río Nilo #2916, Jardines de la Paz, Guadalajara, Jalisco",
      horario: "Lunes a Domingo · 8:30 AM – 9:00 PM",
      img: "https://res.cloudinary.com/dzjupasme/image/upload/v1760671329/ejhq1mvjzbuphbstc3lx.png",
      map: "https://maps.app.goo.gl/axywP3bFcfZMwCsS9",
    },
    {
      id: "zapopan",
      name: "" + t("cafe.cafeteriaBranch2"),
      address: "Francisco Javier Mina No. 204, Zapopan Centro, Zapopan, Jalisco 4510",
      horario: "Lunes a Domingo · 8:30 AM – 9:00 PM",
      img: "https://res.cloudinary.com/dzjupasme/image/upload/v1760671329/hpz2keuyaqnrv1lcsjgn.png",
      map: "https://maps.app.goo.gl/7ga6Dsie43Q4kYfE9",
    },
    {
      id: "minerva",
      name: "" + t("cafe.cafeteriaBranch3"),
      address: "Av. López Mateos Nte. 1248, Col. Italia Providencia, Guadalajara, Jalisco",
      horario: "Lunes a Sabado · 8:30 AM – 9:00 PM Domingo 8:30 AM - 8:00 PM",
      img: "https://res.cloudinary.com/dzjupasme/image/upload/v1760671329/fk8npzd72yr3ccruqts1.png",
      map: "https://maps.app.goo.gl/bK5pZN2rKKaPdgU97",
    },
  ];

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[88px] px-4 sm:px-6 lg:px-12 pb-6">
      {/* ENCABEZADO */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="font-display text-4xl text-wine mb-4">
          {t("cafe.cafeteriaTitle")}
        </h1>
        <p className="font-sans text-wineDark/80 max-w-2xl mx-auto">
          {t("cafe.cafeteriaSubTitle")}
        </p>
      </motion.div>

      {/* MENÚ DE CAFETERÍA */}
      <section className="max-w-5xl mx-auto mb-20">
        {menu.length === 0 ? (
          <p className="text-center text-wineDark/70">
            {t("cafe.cafeteriaSearch")}
          </p>
        ) : (
          menu.map((cat) => (
            <div key={cat.category} className="mb-12">
              <h2 className="font-display text-2xl text-wineDark mb-4 border-b border-rose pb-2">
                {cat.category}
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                {cat.items.map((producto) => {
                  const name = pickLang(producto.name, lang);
                  const desc = pickLang(producto.desc, lang);

                  return (
                    <div
                      key={producto.id}
                      className="bg-marfil shadow-soft p-5 rounded-xl border border-rose/30"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div>
                          <h3 className="font-semibold text-wineBrand">
                            {name}
                          </h3>
                          {/* Mostrar precios dobles o único */}
                          {producto.priceSmall && producto.priceLarge ? (
                            <span className="text-wineDark/70 flex flex-col text-sm">
                              <span>
                                Chico:{" "}
                                <span className="font-bold">
                                  ${producto.priceSmall}
                                </span>
                              </span>
                              <span>
                                Grande:{" "}
                                <span className="font-bold">
                                  ${producto.priceLarge}
                                </span>
                              </span>
                            </span>
                          ) : (
                            <span className="text-wineDark/70">
                              ${producto.price || "-"}
                            </span>
                          )}
                        </div>

                        {/* BOTONES PARA AGREGAR AL CARRITO */}
                        {producto.priceSmall && producto.priceLarge ? (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() =>
                                addToCart({
                                  id: `${producto.id}-chico`,
                                  title: `${name} (Chico)`,
                                  price: producto.priceSmall,
                                  img: producto.img || "",
                                })
                              }
                              className="bg-red text-cream px-4 py-1 rounded-lg hover:opacity-90 transition text-sm"
                            >
                              🛒 {t("cafe.cafeteriaButtonSmall")}
                            </button>
                            <button
                              onClick={() =>
                                addToCart({
                                  id: `${producto.id}-grande`,
                                  title: `${name} (Grande)`,
                                  price: producto.priceLarge,
                                  img: producto.img || "",
                                })
                              }
                              className="bg-red text-cream px-4 py-1 rounded-lg hover:opacity-90 transition text-sm"
                            >
                              🛒 {t("cafe.cafeteriaButtonLarge")}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              addToCart({
                                id: producto.id,
                                title: name,
                                price: producto.price,
                                img: producto.img || "",
                              })
                            }
                            className="bg-red text-cream px-4 py-1 rounded-lg hover:opacity-90 transition"
                          >
                            🛒
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-wineDark/70 mt-2">{desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      {/* SUCURSALES CON CAFETERÍA */}
      <section className="max-w-6xl mx-auto mt-20">
        <h2 className="font-display text-3xl text-center text-wineDark mb-10">
          {t("cafe.cafeteriaSucursales")}
        </h2>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
          {sucursalesCafeteria.map((s) => (
            <motion.div
              key={s.id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-marfil rounded-2xl shadow-soft overflow-hidden border border-rose/30 hover:shadow-lg"
            >
              <div className="h-56 w-full overflow-hidden">
                <img
                  src={s.img}
                  alt={s.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>

              <div className="p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl text-wineBrand mb-1">
                    {s.name}
                  </h3>
                  <p className="text-sm text-wineDark/80">{s.address}</p>
                  <p className="text-sm text-wineDark/70 mt-1">{s.horario}</p>
                </div>

                <a
                  href={s.map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-center bg-red text-white px-5 py-2 rounded-full font-semibold hover:bg-red/80 transition"
                >
                  {t("cafe.cafeteriaSucursalesButton")}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
