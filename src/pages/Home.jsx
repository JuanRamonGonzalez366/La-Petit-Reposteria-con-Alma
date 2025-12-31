import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const BANNER_DESKTOP =
    "https://res.cloudinary.com/dzjupasme/image/upload/v1765557188/g8ylvymmqjzwbilmovay.jpg"; // Imagen de escritorio

  const BANNER_MOBILE =
    "https://res.cloudinary.com/dzjupasme/image/upload/v1765382122/qnd64oinzfqfk0bb6cjy.jpg"; // Imagen móvil

  const { t } = useTranslation();
  const whatsappGeneral =
    "https://api.whatsapp.com/send?phone=5213318501155&text=Hola!%20Me%20gustaria%20hacer%20un%20pedido%20especial.%20¿Podrian%20apoyarme?";

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
    <div className="relative w-full h-[90vh] md:h-[90vh] lg:h-[115vh] overflow-hidden">
  <img
    src={BANNER_DESKTOP}
    alt="Promoción Petit Plaisir"
    className="hidden md:block absolute inset-0 w-full h-full object-cover object-[center_top] object-center"
  />
  <img
    src={BANNER_MOBILE}
    alt="Promoción Petit Plaisir"
    className="block md:hidden absolute inset-0 w-full h-full object-cover object-[center_top] object-center"
  />
</div>





      {/* Productos Destacados */}
      {/* <section className="max-w-6xl mx-auto px-4 py-16">
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
      </section> */}

      {/* Quiénes Somos */}
      {/* <section className="bg-rose/10 py-16">
        <div className="text-center max-w-6xl mx-auto px-4 grid md:grid-cols-2 items-center gap-10">
          <div>
            <h2 className="font-display text-3xl text-wine mb-4">{t("home.aboutTitle")}</h2>
            <p className="text-wineDark/80 leading-relaxed">{t("home.aboutText")}</p>
          </div>
          <div>
            <img src={pasteleria} alt="Petit Plaisir" className="w-full h-[320px] object-cover" />
          </div>
        </div>
      </section> */}

      {/* secciojn qr */}
      {/* <section className="mt-20 bg-wineDark text-white py-1 flex flex-col items-center justify-center text-center">
        <br />
        <br />
        <h2 className="font-display text-3xl mb-4">{t("home.ctaTitle")}</h2>
        <img
          src="https://res.cloudinary.com/dzjupasme/image/upload/v1765386730/qr_v3_c13329.jpg"
          alt="Menu Petit"
          className="border-4 border-wineDark/20 rounded-xl w-100 h-auto object-cover"
        />
        <a 
          href="https://res.cloudinary.com/dzjupasme/image/upload/v1765378300/zqrurmve7fwig0c47avk.pdf" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-red px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          {t("home.ctaButton")}
        </a>
      </section> */}

      {/* seccion rebanada de tu antojo */}
        <section className="font-maison neue bg-rosepier text-wine py-10 mt-10 flex flex-col items-center justify-center text-center">
        {/* <h2 className="font-display text-3xl mb-6">
          {t("home.ctaRebanadaTittle")}
        </h2> */}
        {/* Contenedor con aire (evita sensación de recorte) */}
        <div className="px-4 py-4">
          <img
            src="https://res.cloudinary.com/dzjupasme/image/upload/v1765908539/xm3exyhaz3sgt4rbjhkk.png"
            alt="La rebanada de tu antojo"
            className="w-full max-w-md h-auto mb-6"
          />
        </div>
        <p className="text-lg mt-2 mb-6 max-w-4xl px-4">
          {t("home.ctaRebanadaText")}
        </p>
        <a
          href="https://res.cloudinary.com/dzjupasme/image/upload/v1765899511/kxgjvmwlvdulddobsjly.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          {t("home.ctaButton")}
        </a>
      </section>
      <section aria-hidden className="w-full">
        <div
          className="
            w-full
            h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32
            bg-[url('https://res.cloudinary.com/dzjupasme/image/upload/v1766510929/pzgevwameenoosuuy5cz.png')]
            bg-no-repeat
            bg-center
            bg-contain
          "
        />
      </section>




      {/* Contacto */}
      <section className="font-maison neue bg-rose/10 py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          {/* Columna 1: Información */}
          <div>
            <h2 className="font-maison neue font-bold text-3xl text-wine mb-4">{t("home.contactTitle")}</h2>
            <p className="text-wineDark/80 mb-6">
              {t("home.contactText")}
            </p>

            <ul className="font-maison neue space-y-3 text-wineDark">
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
          <section className="font-maison neue max-w-lg mx-auto bg-rose/10 rounded-2xl shadow-lg p-6 mt-10 mb-10">
            <h2 className="text-2xl font-maison neue font-bold text-wine mb-4 text-center">
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
                {sending
                  ? t("home.sending", "Enviando...")
                  : t("home.sendMessage", "Enviar mensaje")}
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
                      {c.fecha?.toDate
                        ? new Date(c.fecha.toDate()).toLocaleString()
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
