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
const SeedData = lazy(() => import('./pages/admin/SeedData'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Novedades = lazy(() => import('./pages/Novedades'));
const NovedadesAdmin = lazy(() => import('./pages/admin/NovedadesAdmin'));
/* const SeedI18nProducts = lazy(() => import('./pages/admin/SeedI18nProducts')); */
const OrdersAdmin = lazy(() => import('./pages/admin/OrdersAdmin'));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const CheckoutPending = lazy(() => import("./pages/CheckoutPending"));
const CheckoutCancel = lazy(() => import("./pages/CheckoutCancel"));



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
                <Route path="/UmEFSY7AZFKVrotZ6mtdTWU5vthcO4fPeRgHPykBVUVuXFBOxELqnMJqYTHYkZvz" element={<Products />} />
                <Route path="/TAUa+jdGkbZvT48lElgzfd9JEIUg3McoxqVV+CmDtn4yj9gDpGS8hOUNOT2CIPcb" element={<Nosotros />} />
                <Route path="/c5f81wnh8tD29JX+apIYQpwFHwP3w5E31j71ZGa8knBwmdqvW/ttOpuAKiVu6sJe" element={<Cafeteria />} />
                <Route path="/SD9wrfTl3r/mTdgppUT8fDJQL9UqI34oyF5kcfaYvNKjWscyJ5V1yiGGAx26KZB3" element={<Sucursales />} />
                <Route path="/PoztxJ04ullrJPmqS7ZpDhBQchWL8aWgNXt+tFGa1lHXxvAAjkg4QemCr06KR+ZP" element={<BolsaTrabajo />} />
                <Route path="/sWB7AuVkuH9cwxeonb7YJW4Td0nim7ISf8xNllbl1zow2SJX6BFY7t9MO4jMlW8o" element={<Facturacion />} />
                <Route path="/au5Z4YhReMcxh1r0WdbGNrGiMU7+j6CfaUrMxP2TGJNv7ZgI72muOl1gie2Lc7da" element={<Login />} />
                <Route path="/R/pka3Igof2dpoOaMHXhACqm7+/L8K1PQ2ovWlhfFH3ZFeBwua4iQnLJmXLsd0aI" element={<Register />} />
                <Route path="/jdg9DL3muQqzJOuOLmae21cZvH861bBV3QmSQKCOJPGX5MI+t3LiP+XxEzj33EijLUREeoz/TW/JbZk9swdbsA" element={<PedidosEspeciales />} />
                <Route path="/rUGzraozwH/Rl9yhSPMmJk+AYvq90MXIVMIJC9SP8QOlRSlGkait3xizUiWgY3Ff" element={<Privacidad/>} />
                <Route path="/ttfe/q/gwQysFs3gp3skmr7JaaQbw9Ehet1NTVeXeqROMFPrk1nu/A80K86WwSvM" element={<Novedades />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/checkout/pending" element={<CheckoutPending />} />
                <Route path="/checkout/cancel" element={<CheckoutCancel />} />
                <Route
                  path="/1fPaYyxWaapylzV/Gipj4gVqPJKP4I3QS54tSatEwL9qiUdzePZJBJAdxC8ZFupN"
                  element={
                    <ProtectedRoute allow={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/Fcm5Qpimck7lCl+L35tOt3qNoIe0FVVSmhdFs//ik+Xn3k+ZcwPpYgjUmlwytLRd"
                  element={
                    <ProtectedRoute allow={['admin']}>
                      <ProductsAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/WvSIxhg7Zi0x2P0+vwlvRVxU5qqY4p5T/A10OYD0ajivoZ58dIcjpjZvGb7+MlSK"
                  element={
                    <ProtectedRoute allow={['admin']}>
                      <CafeteriaAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/Uj5zYyvghCo66RKvCzhrOPxvaS8ke24ccckQVOpEIIy0e895p3CpJvwCxwsGf4FV" element={
                    <ProtectedRoute allow={['admin']}>
                      <UsersAdmin/>
                    </ProtectedRoute>
                }/>
                <Route
                  path="/rbuvrD9G0kE6JYHvC39TuU0g8Lfj97IByG/45n6NfcPDShkIdeuc4Tv7CtY9zyTpnhCyxRImHyZLPDLXsHInpw"
                  element={
                    <ProtectedRoute requiredRole={['admin']}>
                      <PedidosEspecialesAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/e/gwQysFs3gp3skmr7JaaQbw9Ehet1NTVeXeqROMFPrk1nu/A80K86WwSvMNwc56tcByHjA4KAhUjJgAohtbrA"
                  element={
                    <ProtectedRoute requiredRole={['admin']}>
                      <BolsaTrabajoAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chWDrcJtqc4R7GqAaRD84hTBtiIVBVr7pRNnysODTRZYUM70/Bx/DUEhmZF9nDPpJn6ZVvER6CQW1iK5VbWEw"
                  element={
                    <ProtectedRoute requiredRole={['admin']}>
                      <FacturacionAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                path="/admin/seed"
                element={
                  <ProtectedRoute requiredRole={['admin']}>
                    <SeedData />
                  </ProtectedRoute>
                  }
                /> 
                <Route
                  path="/hyrfr/gwQysFs3gp3skmr7JaaQbw9Ehet1NTVeXeqROMFPrk1nu/A80K86WwSvMNwc56tcByHjA4KAhUjJgAohtbrA"
                  element={
                    <ProtectedRoute allow={['admin']}>
                      <NovedadesAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/heoie/gwQysFs3gp3skmr7JaaQbw9Ehet1NTVeXeqROMFPrk1nu/A80K86WwSvMNwc56tcByHjA4KAhUjJgAohtbrA"
                  element={
                    <ProtectedRoute allow={['admin']}>
                      <OrdersAdmin />
                    </ProtectedRoute>
                  }
                />
                {/* <Route
                  path="/admin/seed-i18n"
                  element={
                    <ProtectedRoute allow={['admin']}>
                      <SeedI18nProducts />
                    </ProtectedRoute>
                  }
                /> */}
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