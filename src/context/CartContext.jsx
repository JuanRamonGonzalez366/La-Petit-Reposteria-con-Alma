import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);
  const updateQty = (id, qty) =>
    setCart(cart.map((item) => (item.id === id ? { ...item, qty } : item)));

  const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQty, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
