import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout.jsx'
import { DashboardLayout } from './components/layout/DashboardLayout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { Home } from './pages/Home.jsx'
import { Login } from './pages/Login.jsx'
import { Signup } from './pages/Signup.jsx'
import { ResetPassword } from './pages/ResetPassword.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { DiagnosticUpload } from './pages/DiagnosticUpload.jsx'
import { DiagnosticResult } from './pages/DiagnosticResult.jsx'
import { Market } from './pages/Market.jsx'
import { Formations } from './pages/Formations.jsx'
import { SoilAnalysis } from './pages/SoilAnalysis.jsx'
import { Crops } from './pages/Crops.jsx'
import { FarmManagement } from './pages/FarmManagement.jsx'
import { WeatherStation } from './pages/WeatherStation.jsx'
import { TestConnection } from './pages/TestConnection.jsx'
import { DiagnosticText } from './pages/DiagnosticText.jsx'
import { DiagnosticMain } from './pages/DiagnosticMain.jsx'
import { ProductionTracking } from './pages/ProductionTracking.jsx'
import { Resources } from './pages/Resources.jsx'
import { Profile } from './pages/Profile.jsx'
import { Orders } from './pages/Orders.jsx'
import { OrderManagement } from './pages/OrderManagement.jsx'
import { AdminPriceManagement } from './pages/AdminPriceManagement.jsx'
import { SuperAdminDashboard } from './pages/SuperAdminDashboard.jsx'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* Public Routes with Main Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* SaaS Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="diagnostic"
            element={
              <ProtectedRoute>
                <DiagnosticMain />
              </ProtectedRoute>
            }
          />
          <Route
            path="diagnostic/photo"
            element={
              <ProtectedRoute>
                <DiagnosticUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="diagnostic/text"
            element={
              <ProtectedRoute>
                <DiagnosticText />
              </ProtectedRoute>
            }
          />
          <Route
            path="diagnostic/:id"
            element={
              <ProtectedRoute>
                <DiagnosticResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="soil-analysis"
            element={
              <ProtectedRoute>
                <SoilAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="market"
            element={
              <ProtectedRoute>
                <Market />
              </ProtectedRoute>
            }
          />
          <Route
            path="formations"
            element={
              <ProtectedRoute>
                <Formations />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="order-management"
            element={
              <ProtectedRoute>
                <OrderManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin-price-management"
            element={
              <ProtectedRoute>
                <AdminPriceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="super-admin"
            element={
              <ProtectedRoute>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="test"
            element={
              <ProtectedRoute>
                <TestConnection />
              </ProtectedRoute>
            }
          />
          <Route
            path="production-tracking"
            element={
              <ProtectedRoute>
                <ProductionTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="farm"
            element={
              <ProtectedRoute>
                <FarmManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="weather-station"
            element={
              <ProtectedRoute>
                <WeatherStation />
              </ProtectedRoute>
            }
          />
          <Route
            path="crops"
            element={
              <ProtectedRoute>
                <Crops />
              </ProtectedRoute>
            }
          />
          <Route
            path="resources"
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
