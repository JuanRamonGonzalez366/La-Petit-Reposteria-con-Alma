import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { toast } from "react-toastify";

import tronco from "../assets/tronco de cereza.webp";
import ruso from "../assets/pastel ruso blanco.webp";
import tiramisu from "../assets/tiramisu.webp";
import pasteleria from "../assets/pasteleria.jpg";

export default function Home() {
  const { t } = useTranslation();
  const whatsappGeneral =
    "https://api.whatsapp.com/send?phone=5213318501155&text=Hola!%20Quisiera%20realizar%20un%20pedido%20especial.%20%F0%9F%8E%82";

  // --- Estado para comentarios ---
  const [form, setForm] = useState({ nombre: "", correo: "", mensaje: "" });
  const [sending, setSending] = useState(false);
  const [comentarios, setComentarios] = useState([]);

  // --- Cargar comentarios existentes ---
  useEffect(() => {
    const q = query(collection(db, "comentarios"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setComentarios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // --- Enviar comentario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.correo || !form.mensaje) {
      toast.warning("⚠️ Por favor completa todos los campos");
      return;
    }

    try {
      setSending(true);
      await addDoc(collection(db, "comentarios"), {
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        mensaje: form.mensaje.trim(),
        fecha: serverTimestamp(),
      });
      toast.success("✅ Comentario enviado correctamente");
      setForm({ nombre: "", correo: "", mensaje: "" });
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      toast.error("❌ Ocurrió un error al enviar tu mensaje");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[88px] pb-6">

      <section className="bg-cream">
        {/* Banner tipo swiper que ocupa todo el ancho y alto del contenedor */}
        <div className="w-full h-[900px] md:h-[1100px] lg:h-[1300px] relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            className="w-full h-full"
          >
            <SwiperSlide>
              <div className="relative w-full h-full">
                <img
                  src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703401/dsyx771aezgbchkgwgkk.jpg"
                  alt="Promoción 3"
                  className="w-full h-full object-cover"
                  style={{ minHeight: "100%", minWidth: "100%" }}
                />
                {/* <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="font-display text-3xl mb-3">{t("home.bannerTitle")}</h3>
                  <p className="mb-8 text-center">{t("home.bannerSubtitle1")}</p>
                  <a href="/TAUa+jdGkbZvT48lElgzfd9JEIUg3McoxqVV+CmDtn4yj9gDpGS8hOUNOT2CIPcb" className="bg-red px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                    {t("home.bannerButton")}      
                  </a>
                </div> */}
              </div>
            </SwiperSlide>
            {/* <SwiperSlide>
              <div className="relative w-full h-full">
                <img
                  src="https://res.cloudinary.com/dzjupasme/image/upload/v1760316016/mjexq6vfusfdhopcvgqn.jpg"
                  alt="Promoción 3"
                  className="w-full h-full object-cover"
                  style={{ minHeight: "100%", minWidth: "100%" }}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="font-display text-3xl mb-3">{t("home.bannerTitle")}</h3>
                  <p className="mb-4 text-center">{t("home.bannerSubtitle3")}</p>
                  <a href="/UmEFSY7AZFKVrotZ6mtdTWU5vthcO4fPeRgHPykBVUVuXFBOxELqnMJqYTHYkZvz" className="bg-red px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                    {t("home.bannerButton")}
                  </a>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="relative w-full h-full">
                <img
                  src="https://res.cloudinary.com/dzjupasme/image/upload/v1760316362/myt3lfscc5okvtqvpxo6.jpg"
                  alt="Promoción 3"
                  className="w-full h-full object-cover"
                  style={{ minHeight: "100%", minWidth: "100%" }}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="font-display text-3xl mb-3">{t("home.bannerTitle")}</h3>
                  <p className="mb-4 text-center">{t("home.bannerSubtitle2")}</p>
                  <a href="/nosotros" className="bg-red px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                    {t("home.bannerButton")}
                  </a>
                </div>
              </div>
            </SwiperSlide> */}
          </Swiper>
        </div>

        {/* Productos Destacados */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl text-wine mb-8 text-center">{t("home.featuredTitle")}</h2>
          <div className="text-center grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[ 
              { img: tronco, name: t("home.troncoName"), desc: t("home.troncoDesc") },
              { img: ruso, name: t("home.rusoName"), desc: t("home.rusoDesc") },
              { img: tiramisu, name: t("home.tiramisuName"), desc: t("home.tiramisuDesc") },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl shadow border border-rose/30 overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-[200px] object-cover" />
                <div className="p-5">
                  <h3 className="font-semibold text-wine text-xl">{p.name}</h3>
                  <p className="text-sm text-wineDark/70 mt-2">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quiénes Somos */}
        <section className="bg-rose/10 py-16">
          <div className="text-center max-w-6xl mx-auto px-4 grid md:grid-cols-2 items-center gap-10">
            <div>
              <h2 className="font-display text-3xl text-wine mb-4">{t("home.aboutTitle")}</h2>
              <p className="text-wineDark/80 leading-relaxed">{t("home.aboutText")}</p>
            </div>
            <div>
              <img src={pasteleria} alt="Petit Plaisir" className="w-full h-[320px] object-cover" />
            </div>
          </div>
        </section>
        
        {/* Promociones */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl text-wine mb-8 text-center">
            {t("home.promoTitle")}
          </h2>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            className="rounded-2xl overflow-hidden"
          >
            <SwiperSlide>
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/dzjupasme/image/upload/v1760040192/xcadaqo2hnlxnzqxnont.jpg"
                  alt="Promoción 1"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="font-display text-3xl mb-3">{t("home.promoName")}</h3>
                  <p className="mb-4 text-sm sm:text-base md:text-lg lg:text-xl">
                    {t("home.promoText1")}
                  </p> 
                  <a href="/ttfe/q/gwQysFs3gp3skmr7JaaQbw9Ehet1NTVeXeqROMFPrk1nu/A80K86WwSvM" className="bg-red px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                    {t("home.promoButton")}
                  </a>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/dzjupasme/image/upload/v1760040191/vd2glvo9bilu3ykrr51a.jpg"
                  alt="Promoción 2"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="font-display text-3xl mb-3">{t("home.promoName")}</h3>
                  <p className="mb-4 text-sm sm:text-base md:text-lg lg:text-xl">
                    {t("home.promoText2")}
                  </p> 
                  <a href="/ttfe/q/gwQysFs3gp3skmr7JaaQbw9Ehet1NTVeXeqROMFPrk1nu/A80K86WwSvM" className="bg-red px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                    {t("home.promoButton")}
                  </a>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/dzjupasme/image/upload/v1760040191/q3fp4ztcsw1r1yf8hodf.jpg"
                  alt="Promoción 3"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <h3 className="font-display text-3xl mb-3">{t("home.promoName")}</h3>
                  <p className="mb-4 text-sm sm:text-base md:text-lg lg:text-xl">
                    {t("home.promoText3")}
                  </p>   
                  <a href="/ttfe/q/gwQysFs3gp3skmr7JaaQbw9Ehet1NTVeXeqROMFPrk1nu/A80K86WwSvM" className="bg-red px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                    {t("home.promoButton")}
                  </a>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </section>

        {/* CTA final */}
        <section className="bg-wine text-white py-16 text-center">
          <h2 className="font-display text-3xl mb-4">{t("home.ctaTitle")}</h2>
          <p className="mb-6 text-lg">{t("home.ctaText")}</p>
          <a
                    href={whatsappGeneral}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition"
                  >
                    {t("special.cta", "Realiza tu pedido especial")}
                  </a>
        </section>

        {/* Contacto */}
        <section className="bg-rose/10 py-16">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10">
            
            {/* Columna 1: Información */}
            <div>
              <h2 className="font-display text-3xl text-wine mb-4">{t("home.contactTitle")}</h2>
              <p className="text-wineDark/80 mb-6">
                {t("home.contactText")}
              </p>

              <ul className="space-y-3 text-wineDark">
                <li><strong>Tel:</strong> 3639 7058</li>
                <li><strong>Cel:</strong> 33-3639-7058</li>
                <li><strong>Email:</strong> contacto@petitplaisir.mx</li>
                <li><strong>{t("home.contactAddress")}:</strong> Francisco I. Madero No. 163, Tlaquepaque Centro, C.P. 45693</li>
                <li>
                  <a
                    href="https://api.whatsapp.com/send?phone=5213311505057&text=Hola,%20%20tengo%20la%20siguiente%20queja%20y/o%20sugerencia%20que%20hacer%20con%20un%20%20representante%20de%20la%20empresa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5" />
                    {t("home.contactWhatsapp")}        
                  </a>
                </li>
                <li><strong>{t("home.contactSocial")}</strong></li>
                <a
                  href="https://www.facebook.com/petitplaisirpasteleria/?ref=page_internal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  <FontAwesomeIcon icon={faFacebook} className="w-5 h-5" />
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/pasteleriaspetit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-pink-700 transition"
                >
                  <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
                  Instagram
                </a>
              </ul>

              <div className="mt-6">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3733.6385601897414!2d-103.3077914!3d20.6435843!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428b3b4d9b4a1b5%3A0xf53b22f7bb1309d7!2sPasteler%C3%ADas%20Petit%20Tlaquepaque!5e0!3m2!1ses!2smx!4v1759285195076!5m2!1ses!2smx"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl border border-wine/20"
                ></iframe>
              </div>
            </div>

            {/* Columna 2: Formulario */}
            {/* 🧁 NUEVA SECCIÓN DE COMENTARIOS */}
        <section className="max-w-lg mx-auto bg-rose/10 rounded-2xl shadow-lg p-6 mt-10 mb-10">
          <h2 className="text-2xl font-display text-wine mb-4 text-center">
            {t("home.commentsTitle", "Deja tu comentario")}
          </h2>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder={t("home.commentName", "Nombre")}
              className="w-full border border-wine/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <input
              type="email"
              placeholder={t("home.commentEmail", "Correo electrónico")}
              className="w-full border border-wine/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
            />
            <textarea
              placeholder={t("home.commentMessage", "Mensaje")}
              rows="4"
              className="w-full border border-wine/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose"
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
            ></textarea>
            <button
              type="submit"
              disabled={sending}
              className={`w-full ${
                sending ? "bg-gray-400" : "bg-red"
              } text-cream font-semibold py-2 rounded-lg hover:opacity-90 transition`}
            >
              {sending ? t("home.sending", "Enviando...") : t("home.sendMessage", "Enviar mensaje")}
            </button>
          </form>

          {/* Listado de comentarios */}
          {comentarios.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-display text-wine text-center mb-3">
                {t("home.commentsList", "Comentarios recientes")}
              </h3>
              {comentarios.map((c) => (
                <div
                  key={c.id}
                  className="bg-cream p-4 rounded-xl shadow border border-rose/20"
                >
                  <p className="font-semibold text-wine">{c.nombre}</p>
                  <p className="text-sm text-wineDark/80">{c.mensaje}</p>
                  <p className="text-xs text-wineDark/50 mt-1">
                    {c.fecha?.toDate ? new Date(c.fecha.toDate()).toLocaleString() : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
          </div>
        </section>        
      </section>
    </main>
  );
}
