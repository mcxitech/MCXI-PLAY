import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import AdminLayout from '@/components/AdminLayout'
import HomePage from '@/pages/HomePage'
import GameDetailPage from '@/pages/GameDetailPage'
import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'
import DemoPage from '@/pages/DemoPage'
import CustomizePage from '@/pages/CustomizePage'
import OrderPage from '@/pages/OrderPage'
import GiftPage from '@/pages/GiftPage'
import BuyerManagePage from '@/pages/BuyerManagePage'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminOrderDetail from '@/pages/admin/AdminOrderDetail'
import AdminTemplates from '@/pages/admin/AdminTemplates'
import AdminAuditLog from '@/pages/admin/AdminAuditLog'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="juego/:slug" element={<GameDetailPage />} />
          <Route path="demo/:slug" element={<DemoPage />} />
          <Route path="personalizar/:slug" element={<CustomizePage />} />
          <Route path="pedido/:orderNumber" element={<OrderPage />} />
          <Route path="mi-regalo/:buyerToken" element={<BuyerManagePage />} />
          <Route path="privacidad" element={<PrivacyPage />} />
          <Route path="condiciones" element={<TermsPage />} />
          <Route
            path="*"
            element={
              <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-white mb-4">Página no encontrada</h1>
                <a href="/" className="text-purple-400 hover:text-purple-300 underline">
                  Volver al inicio
                </a>
              </div>
            }
          />
        </Route>
        {/* Recipient page has no site chrome: the gift is the whole screen */}
        <Route path="regalo/:publicSlug" element={<GiftPage />} />
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="pedidos/:id" element={<AdminOrderDetail />} />
          <Route path="plantillas" element={<AdminTemplates />} />
          <Route path="auditoria" element={<AdminAuditLog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
