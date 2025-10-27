import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { ShoppingBag } from "lucide-react";

export default function CartButton({ onClick }) {
  const { cart } = useCart();
  const count = cart.reduce((acc, i) => acc + i.qty, 0);

  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 bg-red text-cream rounded-full p-4 shadow-lg hover:scale-105 transition-transform z-50"
    >
      <motion.div
        key={count}
        initial={{ scale: 0.8 }}
        animate={{ scale: [1.3, 1] }}
        transition={{ duration: 0.3 }}
      >
        <ShoppingBag size={24} />
      </motion.div>

      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="counter"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-2 -right-2 bg-rose text-cream text-xs rounded-full px-2 py-0.5 shadow-sm"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
