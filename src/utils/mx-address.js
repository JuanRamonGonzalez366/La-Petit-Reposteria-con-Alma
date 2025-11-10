// Validaciones simples para MX (puedes expandir si quieres)
export function isValidPostalCodeMX(cp) {
  return /^[0-9]{5}$/.test(String(cp).trim());
}
export function isValidPhoneMX(phone) {
  return /^[0-9\s()+-]{8,16}$/.test(String(phone).trim());
}
export function required(v) {
  return String(v ?? "").trim().length > 0;
}
