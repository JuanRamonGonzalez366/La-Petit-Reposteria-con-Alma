// src/api/payments.js
export async function createMPCheckout(payload) {
  const res = await fetch(`/api/mp/create-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "mp_failed");
  }

  return res.json();
}
