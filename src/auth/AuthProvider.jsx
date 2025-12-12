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
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // === OBTENER ROL DESDE FIRESTORE ===
  const fetchRole = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        console.log("Documento Firestore encontrado:", snap.data());
        return snap.data().role;
      } else {
        console.warn("No existe documento en Firestore para UID:", uid);
        return "user";
      }
    } catch (err) {
      console.error("Error al obtener rol:", err);
      return "user";
    }
  };

  // === DETECTAR SESIÓN ACTIVA ===
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        console.log("Usuario no autenticado");
        setUser(null);
        setRole(null);
        setLoading(false);
        localStorage.removeItem("userData");
        return;
      }

      await u.reload();
      setUser(u);

      // Intentar leer rol desde localStorage para acelerar
      const stored = localStorage.getItem("userData");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.uid === u.uid) {
          console.log("💾 Rol recuperado desde localStorage:", parsed.role);
          setRole(parsed.role);
          setLoading(false);
          return;
        }
      }

      const r = await fetchRole(u.uid);
      console.log("Rol encontrado:", r);
      setRole(r || "user");

      // Guardar en localStorage
      localStorage.setItem("userData", JSON.stringify({ uid: u.uid, role: r }));

      setLoading(false);
    });
    return () => unsub();
  }, []);

  // === LOGIN ===
  const login = async ({ email, password }) => {
    await setPersistence(auth, browserLocalPersistence);
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await user.reload();

    const r = await fetchRole(user.uid);
    console.log("Rol confirmado en login:", r);

    setUser(user);
    setRole(r || "user");
    localStorage.setItem("userData", JSON.stringify({ uid: user.uid, role: r }));

    if (r === "admin") {
      navigate("/1fPaYyxWaapylzV/Gipj4gVqPJKP4I3QS54tSatEwL9qiUdzePZJBJAdxC8ZFupN");
    } else {
      navigate("/");
    }
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
      createdAt: new Date(),
    });
    return cred.user;
  };

  // === LOGOUT ===
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    localStorage.removeItem("userData");
    navigate("/");
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
