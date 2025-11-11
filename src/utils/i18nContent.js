// src/utils/i18nContent.js
import i18n from "../i18n";

/** "es", "en", etc. (2 letras) */
export function lang2() {
  return (i18n.language || "es").slice(0, 2);
}

/**
 * tr(obj): devuelve texto según idioma
 * - string => se regresa tal cual
 * - {es,en} => elige por idioma, con fallback a 'es'
 * - null/undef => def
 */
export function tr(obj, def = "") {
  if (!obj) return def;
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") {
    const l = lang2();
    return obj[l] ?? obj.es ?? def;
  }
  return def;
}

/**
 * tx(data, paths): lee el primer valor disponible en las rutas dadas ("a.b.c"),
 * si es string u objeto bilingüe, lo pasa por tr().
 */
export function tx(data, paths = [], def = "") {
  for (const p of paths) {
    const v = getByPath(data, p);
    if (v != null && v !== "") {
      return typeof v === "string" || typeof v === "object" ? tr(v, def) : v;
    }
  }
  return def;
}

function getByPath(obj, path) {
  try {
    return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj);
  } catch {
    return undefined;
  }
}

/** Evita pasar src="" que causa recarga de página */
export function safeImg(url, placeholder = "https://via.placeholder.com/800x600?text=Petit+Plaisir") {
  if (!url || typeof url !== "string" || url.trim() === "") return placeholder;
  return url;
}
