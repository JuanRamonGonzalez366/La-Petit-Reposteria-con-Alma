import React, { Suspense, lazy, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import AuthProvider from './auth/AuthProvider'
import ProtectedRoute from './auth/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import Spinner from './components/Spinner'
import CartButton from './components/CartButton'
import CartDrawer from './components/CartDrawer'

// Lazy imports
const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const Contact = lazy(() => import('./pages/Contact'))
const Nosotros = lazy(() => import('./pages/Nosotros'))
const Cafeteria = lazy(() => import('./pages/Cafeteria'))
const Sucursales = lazy(() => import('./pages/Sucursales'))
const BolsaTrabajo = lazy(() => import('./pages/BolsaTrabajo'))
const Facturacion = lazy(() => import('./pages/Facturacion'))
const Login = lazy(() => import('./pages/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const ProductsAdmin = lazy(() => import('./pages/admin/ProductsAdmin'))
const Register = lazy(() => import('./pages/Register'))
const UsersAdmin = lazy(() => import('./pages/admin/UsersAdmin'));
const CafeteriaAdmin = lazy(() => import('./pages/admin/CafeteriaAdmin'))
const PedidosEspeciales = lazy(() => import('./pages/PedidosEspeciales'))
const Privacidad = lazy(() => import('./pages/Privacidad') )
const PedidosEspecialesAdmin = lazy(() => import('./pages/admin/PedidosEspecialesAdmin'))
const BolsaTrabajoAdmin = lazy(() => import('./pages/admin/BolsaTrabajoAdmin'))
const FacturacionAdmin = lazy(() => import('./pages/admin/FacturacionAdmin'))

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <AuthProvider>
      <>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<Products />} />
                <Route path="/contacto" element={<Contact />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/cafeteria" element={<Cafeteria />} />
                <Route path="/sucursales" element={<Sucursales />} />
                <Route path="/bolsadetrabajo" element={<BolsaTrabajo />} />
                <Route path="/facturacion" element={<Facturacion />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/pedidosespeciales" element={<PedidosEspeciales />} />
                <Route path='/privacidad' element={<Privacidad/>} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allow={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/productos"
                  element={
                    <ProtectedRoute allow={['admin']}>
                      <ProductsAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/cafeteria"
                  element={
                    <ProtectedRoute allow={['admin']}>
                      <CafeteriaAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/admin/usuarios" element={
                    <ProtectedRoute allow={['admin']}>
                      <UsersAdmin/>
                    </ProtectedRoute>
                }/>
                <Route
                  path="/admin/pedidosespeciales"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <PedidosEspecialesAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/bolsadetrabajo"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <BolsaTrabajoAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/facturacion"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <FacturacionAdmin />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
        <CartButton onClick={() => setCartOpen(true)} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </>
    </AuthProvider>
  )
}
