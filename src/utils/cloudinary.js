// src/utils/cloudinary.js
export function cld(
  src,
  { w, h, ar, fit = "fill", g = "auto", q = "auto", f = "auto", dpr = "auto" } = {}
) {
  if (!src || typeof src !== "string") return "";
  if (!src.includes("/upload/")) return src;

  const [left, right] = src.split("/upload/");

  const params = [
    w ? `w_${w}` : null,
    h ? `h_${h}` : null,
    ar ? `ar_${ar}` : null,
    fit ? `c_${fit}` : null,
    g ? `g_${g}` : null,
    q ? `q_${q}` : null,
    f ? `f_${f}` : null,
    dpr ? `dpr_${dpr}` : null,
  ]
    .filter(Boolean)
    .join(",");

  return `${left}/upload/${params}/${right}`;
}
