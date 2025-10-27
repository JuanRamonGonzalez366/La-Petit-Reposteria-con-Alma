import React from "react";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="drawer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex justify-end z-50"
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="bg-cream w-full max-w-sm h-full shadow-xl flex flex-col"
          >
            {/* Header */}
            <header className="p-4 border-b border-rose flex justify-between items-center">
              <h2 className="text-lg font-semibold text-wine">{t("cart.title")}</h2>
              <button onClick={onClose} className="text-wineDark/70 hover:text-red transition">
                ✕
              </button>
            </header>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-center text-wineDark/70">{t("cart.empty")}</p>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 border-b border-rose/30 pb-2"
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg border border-rose/30"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-wine">{item.title}</h3>
                      <p className="text-sm text-wineDark/70">${item.price}</p>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateQty(item.id, Number(e.target.value))}
                        className="w-16 mt-1 border border-wine/30 rounded-md px-2 py-0.5 text-center text-wineDark"
                      />
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red hover:scale-110 transition-transform">
                      🗑️
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <footer className="p-4 border-t border-rose space-y-3 bg-cream">
              <div className="flex justify-between font-semibold text-wine">
                <span>{t("cart.total")}:</span>
                <motion.span key={total} initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
                  ${total}
                </motion.span>
              </div>
              <button
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Hola! Quiero hacer este pedido:\n\n${cart.map((i) => `${i.title} x${i.qty} - $${i.price * i.qty}`).join("\n")}\n\nTotal: $${total}`
                  );
                  window.open(`https://wa.me/5213311505057?text=${msg}`, "_blank");
                }}
                className="w-full bg-green-600 text-cream py-2 rounded-lg hover:bg-green-700 transition"
              >
                {t("cart.whatsapp")}
              </button>
              <button onClick={clearCart} className="bg-red w-full text-cream py-2 rounded-lg hover:bg-wine transition">
                {t("cart.clear")}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
