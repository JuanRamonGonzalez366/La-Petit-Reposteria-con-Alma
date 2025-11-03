// Formatea números a MXN con separadores correctos
export const mxn = (n) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 })
    .format(Number.isFinite(+n) ? +n : 0);
