import { toast } from "react-toastify";
import React, { useState, useEffect } from "react"
import { useAuth } from "../auth/AuthProvider"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const { login, user, role } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await login({ email, password });
    } catch (err) {
      console.error("🔥 Error completo de Firebase:", err.code, err.message);
      if (err.code === "EMAIL_NOT_VERIFIED") {
        toast.info("Debes verificar tu correo antes de iniciar sesión.");
      } else if (err.code === "auth/user-not-found") {
        toast.error("No existe un usuario con ese correo.");
      } else if (err.code === "auth/wrong-password") {
        toast.error("Contraseña incorrecta.");
      } else if (err.code === "auth/too-many-requests") {
        toast.error("Demasiados intentos fallidos. Espera un momento.");
      } else {
        toast.error("Error desconocido: " + err.message);
      }
    }
        
  }

  // 🔹 Detectar login + rol y redirigir
  useEffect(() => {
    if (user) {
      if (role === "admin") {
        navigate("/admin")
      } else {
        navigate("/")
      }
    }
  }, [user, role, navigate])

  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[88px] px-4 sm:px-6 lg:px-12 pb-6">
      <h1 className="font-display text-3xl text-wine mb-6">Iniciar sesión</h1>
      <form onSubmit={submit} className="bg-white border border-rose/30 rounded-2xl p-6 grid gap-4">
        <input
          className="border rounded-lg px-4 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border rounded-lg px-4 py-2"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <div className="text-red text-sm">{err}</div>}
        <button className="bg-red text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition">
          Entrar
        </button>
      </form>
    </main>
  )
}
