import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();

const LS_KEY = "cart_v2"; // nuevo key para evitar residuos

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
  }, [cart]);

  // ─── helpers ──────────────────────────────────────────────────────────────
  const addToCart = (product) => {
    // product: { id, title, price, img, options? }
    setCart((prev) => {
      const keyMatches = (a, b) => JSON.stringify(a || {}) === JSON.stringify(b || {});
      const idx = prev.findIndex((it) => it.id === product.id && keyMatches(it.options, product.options));
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx] = { ...clone[idx], qty: clone[idx].qty + (product.qty || 1) };
        return clone;
      }
      return [...prev, { ...product, qty: product.qty || 1 }];
    });
  };

  const removeFromCart = (id, options) =>
    setCart((prev) => prev.filter((it) => !(it.id === id && JSON.stringify(it.options || {}) === JSON.stringify(options || {}))));

  const setQuantity = (id, options, qty) =>
    setCart((prev) =>
      prev.map((it) =>
        it.id === id && JSON.stringify(it.options || {}) === JSON.stringify(options || {})
          ? { ...it, qty: Math.max(1, Math.min(99, Number(qty) || 1)) }
          : it
      )
    );

  const increase = (id, options) => setQuantity(id, options, (cart.find((i) => i.id === id && JSON.stringify(i.options||{})===JSON.stringify(options||{}))?.qty || 1) + 1);
  const decrease = (id, options) => setQuantity(id, options, (cart.find((i) => i.id === id && JSON.stringify(i.options||{})===JSON.stringify(options||{}))?.qty || 1) - 1);

  const clearCart = () => setCart([]);

  // Descuentos/Impuestos si los usas más adelante
  const discount = 0;
  const taxes = 0;

  const subtotal = useMemo(
    () => cart.reduce((acc, i) => acc + Number(i.price || 0) * Number(i.qty || 0), 0),
    [cart]
  );
  const total = subtotal - discount + taxes; // el envío lo sumas en el Drawer

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        setQuantity,
        increase,
        decrease,
        subtotal,
        discount,
        taxes,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
