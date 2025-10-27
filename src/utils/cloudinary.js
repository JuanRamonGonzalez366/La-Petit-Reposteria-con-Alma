// Inserta transformaciones en una URL de Cloudinary segura (secure_url)
export function cld(src, { w, h, fit = "fill", q = "auto", f = "auto", dpr = "auto" } = {}) {
    if (!src || !src.includes("/upload/")) return src || ""
    const [left, right] = src.split("/upload/")
    const params = [
      w ? `w_${w}` : null,
      h ? `h_${h}` : null,
      fit ? `c_${fit}` : null,
      q ? `q_${q}` : null,
      f ? `f_${f}` : null,
      dpr ? `dpr_${dpr}` : null,
    ]
      .filter(Boolean)
      .join(",")
  
    return `${left}/upload/${params}/${right}`
  }
  