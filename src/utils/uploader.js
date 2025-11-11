// Subida consistente a Cloudinary para toda la app
export async function uploadToCloudinary(file, { folder } = {}) {
  const CLOUD = import.meta.env.dzjupasme;
  const PRESET = import.meta.env.ml_default; // 👈 MISMO nombre que ya usas en ProductsAdmin

  if (!CLOUD || !PRESET) {
    throw new Error("Faltan variables de entorno: VITE_CLOUDINARY_CLOUD / VITE_CLOUDINARY_PRESET");
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`; // 👈 usa /image/upload
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", PRESET);
  if (folder) fd.append("folder", folder);

  const res = await fetch(url, { method: "POST", body: fd });
  const data = await res.json();

  if (!res.ok) {
    // Errores típicos: "Invalid upload preset", "Missing required parameter - file"
    throw new Error(data?.error?.message || "Error subiendo a Cloudinary");
  }
  if (!data.secure_url) {
    throw new Error("Subida sin URL (secure_url vacío)");
  }
  return data.secure_url;
}
