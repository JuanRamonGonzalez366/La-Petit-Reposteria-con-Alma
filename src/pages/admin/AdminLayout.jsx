import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="h-16 bg-white border-b border-rose/30 flex items-center px-6 gap-4">
        <NavLink to="/admin" className="font-semibold text-wine">Dashboard</NavLink>
        <NavLink to="/admin/productos" className="text-wineDark/80">Productos</NavLink>
        <NavLink to="/admin/cafeteria" className="text-wineDark/80">Cafetería</NavLink>
        <NavLink to="/admin/pedidos-especiales" className="text-wineDark/80">Pedidos especiales</NavLink>
        <NavLink to="/admin/facturacion" className="text-wineDark/80">Facturación</NavLink>
        <NavLink to="/admin/novedades" className="text-wineDark/80">Novedades</NavLink>
        <NavLink to="/admin/usuarios" className="text-wineDark/80">Usuarios</NavLink>
      </header>
      <Outlet />
    </div>
  );
}
