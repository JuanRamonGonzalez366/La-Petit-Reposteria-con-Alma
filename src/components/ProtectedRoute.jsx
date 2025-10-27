import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function ProtectedRoute({ children, allow = ['admin'] }) {
  const { loading, user, role } = useAuth()
  if (loading) return <div className="p-8">Cargando…</div>
  if (!user || !allow.includes(role)) return <Navigate to="/login" replace />
  return children
}
