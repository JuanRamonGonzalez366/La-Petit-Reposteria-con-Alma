import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({
  children,
  allow,           // preferido: array de roles permitidos
  requiredRole,    // compat: alias que también aceptamos
}) {
  const rolesAllowed = allow || requiredRole || []; // compat
  const location = useLocation();
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return setState({ loading: false, allowed: false });
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists() ? snap.data().role : null;

        // si no se especifican roles, pediremos solo sesión
        const ok = rolesAllowed.length === 0
          ? !!user
          : rolesAllowed.includes(role);

        setState({ loading: false, allowed: ok });
      } catch {
        setState({ loading: false, allowed: false });
      }
    });
    return () => unsub();
  }, [rolesAllowed]);

  if (state.loading) {
    return (
      <main className="min-h-[50vh] flex items-center justify-center text-wine">
        Cargando…
      </main>
    );
  }
  if (!state.allowed) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}
