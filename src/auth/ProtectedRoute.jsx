// src/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({
  allow,            // array de roles permitidos
  requiredRole,     // string de un único rol
    children,
    redirectTo = '/login',
}) {
    const { user, role, loading } = useAuth();

    if (loading) return <div className="p-6">Cargando…</div>;
    if (!user) return <Navigate to={redirectTo} replace />;

    const allowed = allow?.length ? allow : (requiredRole ? [requiredRole] : null);
    if (allowed && !allowed.includes(role)) return <Navigate to="/" replace />;

    return children;
}
