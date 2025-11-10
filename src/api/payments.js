const BASE = import.meta.env.VITE_API_BASE || "";

export async function createStripeCheckout(payload) {
  if (!BASE) throw new Error("VITE_API_BASE no configurado");
  const res = await fetch(`${BASE}/create-checkout/stripe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("stripe_failed");
  return res.json();
}

export async function createMPCheckout(payload) {
  if (!BASE) throw new Error("VITE_API_BASE no configurado");
  const res = await fetch(`${BASE}/create-checkout/mp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("mp_failed");
  return res.json();
}
