import { Link } from "react-router-dom"

export default function Dashboard() {
  return (
    <main className="bg-cream min-h-[calc(100vh-80px)] pt-[88px] px-4 sm:px-6 lg:px-12 pb-6">
    <h1 className="font-display text-3xl text-wine mb-6">Panel de Admin</h1>
      <div className="grid sm:grid-cols-3 gap-6">
        
        {/* Pedidos Demo */}
        <Link
          to="/admin/pedidos"
          className="bg-white p-6 rounded-2xl border border-rose/30 text-center hover:bg-rose/20 transition"
        >
          Pedidos (demo)
        </Link>

        {/* Productos */}
        <Link
          to="/admin/productos"
          className="bg-white p-6 rounded-2xl border border-rose/30 text-center hover:bg-rose/20 transition"
        >
          <h2 className="text-xl font-semibold text-wine mb-2">🧁 Pasteleria</h2>
          <p className="text-sm text-wineDark/70">Agrega y edita los productos del menú de pasteles.</p>
        </Link>
        {/*Pastekeria*/}
        <Link
          to="/admin/cafeteria"
          className="bg-white border border-roseBrand/30 rounded-xl p-6 shadow-soft hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-wine mb-2">☕ Cafetería</h2>
          <p className="text-sm text-wineDark/70">Agrega y edita los productos del menú.</p>
        </Link>
        <Link
          to="/admin/pedidosespeciales"
          className="bg-white border border-roseBrand/30 rounded-xl p-6 shadow-soft hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-wine mb-2">🎂 Pedidos Especiales</h2>
          <p className="text-sm text-wineDark/70">Agrega y edita los pasteles especiales para esos dias unicos.</p>
        </Link>
        <Link
          to="/admin/bolsadetrabajo"
          className="bg-white border border-roseBrand/30 rounded-xl p-6 shadow-soft hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-wine mb-2">📋 Bolsa de Trabajo</h2>
          <p className="text-sm text-wineDark/70">Mira laas solicitudes de trabajo y encuentra al mejor candidato</p>
        </Link>


        {/* Stock Demo */}
        <Link
          to="/admin/stock"
          className="bg-white p-6 rounded-2xl border border-rose/30 text-center hover:bg-rose/20 transition"
        >
          Stock
        </Link>
      </div>
    </main>
  )
}
