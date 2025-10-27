import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function AdminRoute({ children }) {
    const { user, role, loading } = useAuth();
    if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Cargando...</div>;
    if (!user || role !== "admin") return <Navigate to="/" replace />;
    return children;
}
