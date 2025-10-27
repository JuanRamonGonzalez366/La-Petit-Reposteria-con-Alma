import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Cargando...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}
