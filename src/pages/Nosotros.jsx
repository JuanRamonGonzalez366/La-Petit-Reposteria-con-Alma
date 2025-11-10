import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCakeCandles, faMugHot, faGift, faStore } from "@fortawesome/free-solid-svg-icons";

export default function Nosotros() {
  const { t } = useTranslation();

  const features = [
    {
      icon: faCakeCandles,
      title: t("about.traditionTitle"),
      desc: t("about.traditionDesc"),
    },
    {
      icon: faMugHot,
      title: t("about.cafeTitle"),
      desc: t("about.cafeDesc"),
    },
    {
      icon: faGift,
      title: t("about.sliceTitle"),
      desc: t("about.sliceDesc"),
    },
    {
      icon: faStore,
      title: t("about.branchesTitle"),
      desc: t("about.branchesDesc"),
    },
  ];

  const categories = [
    t("about.catCakes"),
    t("about.catCheesecakes"),
    t("about.catBakery"),
    t("about.catDesserts"),
    t("about.catGelatins"),
    t("about.catSpecialOrders"),
  ];

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] pb-16">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl text-wine mb-4">
              {t("about.title")}
            </h1>
            <p className="text-wineDark/90 leading-relaxed">
              {t("about.subtitle")}
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              {categories.map((c) => (
                <span
                  key={c}
                  className="bg-white/80 border border-rose/30 text-wine text-sm px-3 py-1 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden shadow-suave border border-rose/30"
          >
            {/* 🔁 Reemplaza estas imágenes por tus URLs de Cloudinary */}
            <img
              src="https://res.cloudinary.com/dzjupasme/image/upload/v1760916617/sid6foctu3kbmiaoscsa.png"
              alt={t("about.heroAlt")}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* “Rebanada de tu antojo” */}
      <section className="px-4 sm:px-6 lg:px-12 mt-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className="order-2 lg:order-1"
          >
            <h2 className="font-display text-3xl text-wine mb-3">
              {t("about.sliceHeading")}
            </h2>
            <p className="text-wineDark/90">
              {t("about.sliceText")}
            </p>
            <ul className="mt-4 space-y-2 text-wineDark/85 text-sm list-disc pl-5">
              <li>{t("about.slicePoint1")}</li>
              <li>{t("about.slicePoint2")}</li>
              <li>{t("about.slicePoint3")}</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className="order-1 lg:order-2"
          >
            <div className="grid grid-cols-2 gap-3">
              <img
                src="https://res.cloudinary.com/dzjupasme/image/upload/v1762739993/szznkmejyicgmass5vct.jpg"
                alt={t("about.sliceImg1Alt")}
                className="rounded-xl border border-rose/20 shadow-sm object-cover h-48 w-full"
                loading="lazy"
              />
              <img
                src="https://res.cloudinary.com/dzjupasme/image/upload/v1762739994/oodymkpg9rsz4pkcxeec.jpg"
                alt={t("about.sliceImg2Alt")}
                className="rounded-xl border border-rose/20 shadow-sm object-cover h-48 w-full"
                loading="lazy"
              />
              <img
                src="https://res.cloudinary.com/dzjupasme/image/upload/v1760666786/fpdnkz3ozs4lz4acqkhi.webp"
                alt={t("about.sliceImg3Alt")}
                className="rounded-xl border border-rose/20 shadow-sm object-cover h-48 w-full col-span-2"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature blocks */}
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
              <h3 className="text-wine font-semibold">{f.title}</h3>
              <p className="text-sm text-wineDark/80 mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sucursales y horarios (resumen) */}
      <section className="px-4 sm:px-6 lg:px-12 mt-16">
        <div className="bg-white border border-rose/30 rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-2xl text-wine mb-3">{t("about.briefBranchesTitle")}</h2>
          <p className="text-wineDark/85">{t("about.briefBranchesText")}</p>
          <div className="mt-5 grid md:grid-cols-3 gap-4 text-sm">
            <div className="border border-rose/20 rounded-xl p-4">
              <p className="text-wine font-semibold">{t("about.branch1Name")}</p>
              <p className="text-wineDark/80">{t("about.branch1Addr")}</p>
              <p className="text-wineDark/70 mt-1">{t("about.hours")}</p>
            </div>
            <div className="border border-rose/20 rounded-xl p-4">
              <p className="text-wine font-semibold">{t("about.branch2Name")}</p>
              <p className="text-wineDark/80">{t("about.branch2Addr")}</p>
              <p className="text-wineDark/70 mt-1">{t("about.hours")}</p>
            </div>
            <div className="border border-rose/20 rounded-xl p-4">
              <p className="text-wine font-semibold">{t("about.branch3Name")}</p>
              <p className="text-wineDark/80">{t("about.branch3Addr")}</p>
              <p className="text-wineDark/70 mt-1">{t("about.hours")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-12 mt-16">
        <div className="bg-wine text-cream rounded-2xl p-6 text-center shadow-sm">
          <h3 className="font-display text-2xl mb-2">{t("about.ctaTitle")}</h3>
          <p className="opacity-90">{t("about.ctaSubtitle")}</p>
          <br />
          <a href="/UmEFSY7AZFKVrotZ6mtdTWU5vthcO4fPeRgHPykBVUVuXFBOxELqnMJqYTHYkZvz" className="bg-red px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              {t("home.bannerButton")}      
          </a>
        </div>
      </section>
    </main>
  );
}
