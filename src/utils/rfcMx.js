// Validador simple de RFC (personas morales 12, físicas 13). v1 sin dígito verificador SAT.
export function validateRfcMx(rfc) {
    if (!rfc) return false;
    const v = rfc.trim().toUpperCase();
    const re = /^([A-Z&Ñ]{3,4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z\d]{3}$/;
    return re.test(v);
}
