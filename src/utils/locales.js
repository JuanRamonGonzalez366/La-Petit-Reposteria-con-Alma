// src/utils/locale.js
export const normLang = (raw) => {
  if (!raw) return "es";
  const s = String(raw).toLowerCase();
  return s.startsWith("en") ? "en" : "es";
};

// Acepta string plano o {es, en}. Devuelve string.
export const pickLang = (value, lang = "es") => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const l = normLang(lang);
    return value[l] || value.es || value.en || "";
  }
  return String(value);
};
