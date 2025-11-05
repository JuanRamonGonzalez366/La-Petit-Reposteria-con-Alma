export const mxn = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" })
    .format(Number.isFinite(+n) ? +n : 0);
