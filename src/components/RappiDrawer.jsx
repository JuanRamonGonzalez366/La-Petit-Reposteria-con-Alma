// src/components/RappiDrawer.jsx
import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RAPPI_BRANCHES } from "../data/rappiBranches";

export default function RappiDrawer({ open, onClose }) {
  const drawerRef = useRef(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();

    if (open) {
      lastFocusedRef.current = document.activeElement;
      document.addEventListener("keydown", onKey);

      setTimeout(() => {
        drawerRef.current?.querySelector("button, a")?.focus();
      }, 10);
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      if (lastFocusedRef.current?.focus) lastFocusedRef.current.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="rappi-drawer-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex justify-end z-50"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label="Opciones de Rappi"
        >
          <motion.div
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28 }}
            className="bg-cream w-full max-w-sm h-full shadow-xl flex flex-col outline-none"
          >
            {/* Header */}
            <header className="p-4 border-b border-rose flex justify-between items-center sticky top-0 bg-cream">
              <div>
                <h2 className="text-lg font-semibold text-wine">
                  Pedir por Rappi
                </h2>
                <p className="text-xs text-wineDark/70 mt-0.5">
                  Elige tu sucursal y abre el menú en Rappi.
                </p>
              </div>

              <button
                onClick={onClose}
                className="text-wineDark/70 hover:text-red transition focus:outline-none focus:ring-2 focus:ring-rose rounded px-2 py-1"
              >
                ✕
              </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {RAPPI_BRANCHES.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-rose/30 p-4 shadow-sm"
                >
                  <div className="text-wine font-semibold">{b.name}</div>
                  <div className="text-xs text-wineDark/70 mt-1">
                    {b.address}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-[#F44611] text-white text-sm font-medium hover:opacity-90 transition"
                    >
                      Abrir en Rappi
                    </a>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(b.url);
                      }}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-wine/30 text-wine text-sm hover:bg-rose/10 transition"
                    >
                      Copiar link
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <footer className="p-4 border-t border-rose bg-cream">
              <p className="text-xs text-wineDark/70">
                * Rappi gestiona disponibilidad, tiempos y costos de envío.
              </p>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
