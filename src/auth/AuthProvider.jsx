import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

const USERDATA_KEY = "userData";
const isDev = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV;

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // === OBTENER ROL DESDE FIRESTORE ===
  const fetchRole = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        if (isDev) console.log("✅ Firestore role:", data?.role);
        return data?.role || "user";
      } else {
        if (isDev) console.warn("⚠️ No existe user doc para UID:", uid);
        return "user";
      }
    } catch (err) {
      if (isDev) console.error("❌ Error al obtener rol:", err);
      return "user";
    }
  };

  // === DETECTAR SESIÓN ACTIVA ===
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) {
          if (isDev) console.log("👤 Usuario no autenticado");
          setUser(null);
          setRole(null);
          localStorage.removeItem(USERDATA_KEY);
          setLoading(false);
          return;
        }

        await u.reload();
        setUser(u);

        // ✅ Recuperar rol rápido si existe en localStorage
        const stored = localStorage.getItem(USERDATA_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.uid === u.uid && parsed?.role) {
              if (isDev) console.log("💾 Rol desde localStorage:", parsed.role);
              setRole(parsed.role);
              setLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem(USERDATA_KEY);
          }
        }

        // ✅ Si no hay cache, buscar rol
        const r = await fetchRole(u.uid);

        // ✅ Regla: si NO es admin y NO está verificado, no dejamos rol ni cache
        if (r !== "admin" && !u.emailVerified) {
          setRole(null);
          localStorage.removeItem(USERDATA_KEY);
          setLoading(false);
          return;
        }

        setRole(r || "user");
        localStorage.setItem(USERDATA_KEY, JSON.stringify({ uid: u.uid, role: r || "user" }));
        setLoading(false);
      } catch (e) {
        if (isDev) console.error("❌ Error en onAuthStateChanged:", e);
        setUser(null);
        setRole(null);
        localStorage.removeItem(USERDATA_KEY);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // === LOGIN ===
  const login = async ({ email, password }) => {
    await setPersistence(auth, browserLocalPersistence);

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const u = cred.user;
    await u.reload();

    // 🔎 Primero obtenemos rol
    const r = await fetchRole(u.uid);

    // ✅ Solo usuarios NO admin requieren verificación
    if (r !== "admin" && !u.emailVerified) {
      await signOut(auth);
      const customErr = new Error("Email not verified");
      customErr.code = "EMAIL_NOT_VERIFIED";
      throw customErr;
    }

    setUser(u);
    setRole(r || "user");
    localStorage.setItem(USERDATA_KEY, JSON.stringify({ uid: u.uid, role: r || "user" }));

    // ✅ No navegamos aquí. Login.jsx decide a dónde ir.
    return { user: u, role: r || "user" };
  };

  // === REGISTRO ===
  const register = async ({ email, password, name, phone }) => {
    await setPersistence(auth, browserLocalPersistence);

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);

    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      name: name || "",
      phone: phone || "",
      role: "user",
      createdAt: serverTimestamp(),
    });

    return cred.user;
  };

  // === LOGOUT ===
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    localStorage.removeItem(USERDATA_KEY);
  };

  const forgotPassword = (email) => sendPasswordResetEmail(auth, email);

  return (
    <AuthCtx.Provider
      value={{
        user,
        role,
        loading,
        register,
        login,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
