import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { ShoppingBag } from "lucide-react";

export default function CartButton({ onClick }) {
  const { cart, itemCount } = useCart();
  const count =
    typeof itemCount === "number"
      ? itemCount
      : cart.reduce((acc, i) => acc + (i.qty || 0), 0);

  return (
    <motion.button
      aria-label="Abrir carrito"
      onClick={onClick}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}

      /* 🔥 EFECTOS */
      whileHover={{ scale: 1.12 }}   // 👈 crece al pasar el mouse
      whileTap={{ scale: 0.95 }}     // 👈 se comprime al click
      transition={{ type: "spring", stiffness: 400, damping: 20 }}

      className="
        fixed bottom-6 right-6 z-50
        bg-red text-cream
        rounded-full p-4
        shadow-lg
        focus:outline-none
        focus:ring-2 focus:ring-rose
      "
    >
      {/* Ícono con micro-animación */}
      <motion.div
        key={count}
        initial={{ scale: 0.9 }}
        animate={{ scale: [1.25, 1] }}
        transition={{ duration: 0.25 }}
      >
        <ShoppingBag size={24} aria-hidden="true" />
      </motion.div>

      {/* Contador */}
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="counter"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.25 }}
            className="
              absolute -top-2 -right-2
              bg-rose text-cream text-xs
              rounded-full px-2 py-0.5
              shadow-sm
            "
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
