const BASE = import.meta.env.VITE_API_BASE || ""; // si está vacío, fallará (mejor que 404 silencioso)

export async function createStripeCheckout(payload) {
  const res = await fetch(`${BASE}/create-checkout/stripe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("stripe_failed");
  return res.json();
}

export async function createMPCheckout(payload) {
  const res = await fetch(`${BASE}/create-checkout/mp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("mp_failed");
  return res.json();
}
