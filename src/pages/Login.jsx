import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const isDev = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV;

export default function Login() {
  const { login, user, role } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      const msg = "⚠️ Por favor completa todos los campos";
      setErr(msg);
      toast.warning(msg);
      return;
    }

    try {
      await login({ email: cleanEmail, password });
    } catch (error) {
      if (isDev) console.error("Error de Firebase:", error?.code, error?.message, error);

      if (error?.code === "EMAIL_NOT_VERIFIED") {
        const msg = "Debes verificar tu correo antes de iniciar sesión.";
        setErr(msg);
        toast.info(msg);
      } else if (error?.code === "auth/invalid-email") {
        const msg = "Correo inválido.";
        setErr(msg);
        toast.error(msg);
      } else if (
        error?.code === "auth/wrong-password" ||
        error?.code === "auth/invalid-credential"
      ) {
        const msg = "Correo o contraseña incorrectos.";
        setErr(msg);
        toast.error(msg);
      } else if (error?.code === "auth/user-not-found") {
        const msg = "No existe un usuario con ese correo.";
        setErr(msg);
        toast.error(msg);
      } else if (error?.code === "auth/too-many-requests") {
        const msg = "Demasiados intentos fallidos. Espera un momento.";
        setErr(msg);
        toast.error(msg);
      } else {
        const msg = "Ocurrió un error al iniciar sesión. Intenta de nuevo.";
        setErr(msg);
        toast.error(msg);
      }
    }
  };

  // 🔹 Detectar login + rol y redirigir (queda aquí, solo aquí)
  useEffect(() => {
  if (!user) return;
  if (!role) return; // 👈 espera a que role esté listo

  if (role === "admin") {
    navigate("/1fPaYyxWaapylzV/Gipj4gVqPJKP4I3QS54tSatEwL9qiUdzePZJBJAdxC8ZFupN");
  } else {
    navigate("/");
  }
}, [user, role, navigate]);


  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[88px] px-4 sm:px-6 lg:px-12 pb-6">
      <h1 className="font-display text-3xl text-wine mb-6">Iniciar sesión</h1>
      <form onSubmit={submit} className="bg-white border border-rose/30 rounded-2xl p-6 grid gap-4">
        <input
          type="email"
          className="border rounded-lg px-4 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          className="border rounded-lg px-4 py-2"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {err && <div className="text-red text-sm">{err}</div>}
        <button className="bg-red text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition">
          Entrar
        </button>
      </form>
    </main>
  );
}
