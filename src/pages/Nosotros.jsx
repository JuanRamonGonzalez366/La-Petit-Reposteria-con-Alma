import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCakeCandles, faMugHot, faGift, faStore } from "@fortawesome/free-solid-svg-icons";

export default function Nosotros() {
  const { t } = useTranslation();

  const features = [
    { icon: faCakeCandles, title: t("about.traditionTitle"), desc: t("about.traditionDesc") },
    { icon: faMugHot, title: t("about.cafeTitle"), desc: t("about.cafeDesc") },
    { icon: faGift, title: t("about.sliceTitle"), desc: t("about.sliceDesc") },
    { icon: faStore, title: t("about.branchesTitle"), desc: t("about.branchesDesc") },
  ];

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] pb-16">
      {/* 1) Historia al inicio y centrado */}
      <section className="px-4 sm:px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >

            <h1 className="font-agenda font-bold text-3xl text-wine mb-3">
              {t("about.title")}
            </h1>

            <p className="font-agenda text-sm leading-7 text-wineDark leading-relaxed">{t("about.subtitle1")}</p>
            <br />
            <p className="font-agenda text-sm leading-7 text-wineDark leading-relaxed">{t("about.subtitle2")}</p>
            <br />
            <p className="font-agenda text-sm leading-7 text-wineDark leading-relaxed">{t("about.subtitle3")}</p>
            <br />
            <p className="font-agenda text-sm leading-7 text-wineDark leading-relaxed">{t("about.subtitle4")}</p>
            <br />
            <p className="font-agenda text-sm leading-7 text-wineDark leading-relaxed">{t("about.subtitle5")}</p>
            <br />
            <p className="font-agenda text-sm leading-7 text-wineDark leading-relaxed">{t("about.subtitle6")}</p>
            <br />
            <p className="font-agenda text-sm leading-7 text-wineDark leading-relaxed">{t("about.subtitle7")}</p>
          </motion.div>
        </div>
      </section>


      {/* 2) Galería (15 imágenes) */}
<section className="px-4 sm:px-6 lg:px-12 mt-16">
  <div className="max-w-5xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45 }}
      className="
        grid gap-4
        grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
        auto-rows-[160px] sm:auto-rows-[180px] lg:auto-rows-[190px]
      "
    >

      {/* Vertical (1 de 3) */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703218/nctf4p9gfd2wrkojg9tn.jpg"
        alt="imagen1"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm row-span-2"
      />
      {/* Vertical (2 de 3) */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1765833947/k6f1uwvtqo7ne0joiv5j.jpg"
        alt="imagen2"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm row-span-2"
      />
      {/* Vertical (3 de 3) */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764807166/tnejiwmrjuczm0tpwfup.jpg"
        alt="imagen3"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm row-span-2"
      />
       {/* Horizontal */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703222/v4zh1vieymnv5krzq23o.jpg"
        alt="imagen4"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm"
      />
      {/* Horizontal */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703220/wwi99d9aizwfamwiybpo.jpg"
        alt="imagen5"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm"
      />
      {/* Horizontal */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703220/uvm8rub2rgzmd398o2bl.jpg"
        alt="imagen6"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm"
      />
      {/* Horizontal */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703220/i2d2ybodsdi84gpha2rm.jpg"
        alt="imagen7"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm"
      />
      {/* Horizontal */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703219/vxvp5oo4qmqivxjeghuy.jpg"
        alt="imagen8"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm"
      />
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703219/nmjlw4dijem019km1jm8.jpg"
        alt="imagen9"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm"
      />
      {/* Horizontal */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703218/wcfv744dpg2qmjopapoz.jpg"
        alt="imagen10"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm"
      />

      {/* Horizontal */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703218/vazvfsxsygzsgqhumlog.jpg"
        alt="imagen11"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm"
      />

      {/* Horizontal */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703218/utknolcinrcqekba2uu3.jpg"
        alt="imagen12"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm"
      />
      {/* Horizontal */}
      <img
        src="https://res.cloudinary.com/dzjupasme/image/upload/v1764703218/px0ar51vanrv5qwexkvu.jpg"
        alt="imagen13"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-xl border border-rose/20 shadow-sm"
      />
      
    </motion.div>
  </div>
</section>


      {/* 3) Texto + Audio debajo de las imágenes */}
      <section className="px-4 sm:px-6 lg:px-12 mt-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
          >
            <h2 className="font-agenda font-bold text-3xl text-wine mb-3">
              {t("about.sliceHeading")}
            </h2>

            <p className="font-agenda text-sm leading-7 text-wineDark">
              {t("about.sliceText")}
            </p>

            <div className="mt-4 w-full flex justify-center">
              <audio
                controls
                className="w-full max-w-md rounded-xl border border-rose/30 shadow-sm"
              >
                <source
                  src="https://res.cloudinary.com/dzjupasme/video/upload/v1765833581/kra3rfg0ukvdc06udkd1.wav"
                  type="audio/wav"
                />
                {t("about.audioNotSupported")}
              </audio>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature blocks (se queda igual) */}
      <section className="px-4 sm:px-6 lg:px-12 mt-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-rose/30 p-5 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-rose/20 text-wine flex items-center justify-center mb-3">
                <FontAwesomeIcon icon={f.icon} />
              </div>
              <h3 className="text-wine font-agenda font-bold text-1xl mb-2">{f.title}</h3>
              <p className="text-sm font-agenda text-wineDark/80 mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA (igual) */}
      <section className="px-4 sm:px-6 lg:px-12 mt-16">
        <div className="bg-wine text-cream rounded-2xl p-6 text-center shadow-sm">
          <h3 className="font-agenda font-bold text-2xl mb-2">{t("about.ctaTitle")}</h3>
          <p className="font-agenda opacity-90">{t("about.ctaSubtitle")}</p>
          <br />
          <a
            href="/UmEFSY7AZFKVrotZ6mtdTWU5vthcO4fPeRgHPykBVUVuXFBOxELqnMJqYTHYkZvz"
            className="bg-red px-6 py-3 rounded-lg font-agenda hover:opacity-90 transition"
          >
            {t("home.bannerButton")}
          </a>
        </div>
      </section>
    </main>
  );
}
