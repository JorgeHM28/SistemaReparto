import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "../pages/LandingPage";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RegisterEmpresa from "../pages/auth/RegisterEmpresa";
import RecuperarPassword from "../pages/auth/RecuperarPassword";

import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import AdminLayout from "../components/layouts/AdminLayout";
import ClienteLayout from "../components/layouts/ClienteLayout";
import RepartidorLayout from "../components/layouts/RepartidorLayout";

import DashboardAdmin from "../pages/admin/Dashboard";
import Usuarios from "../pages/admin/Usuarios";
import Pedidos from "../pages/admin/Pedidos";
import Rutas from "../pages/admin/Rutas";
import Monitoreo from "../pages/admin/Monitoreo";
import Reportes from "../pages/admin/Reportes";

import DashboardCliente from "../pages/cliente/Dashboard";
import MisPedidos from "../pages/cliente/MisPedidos";
import Seguimiento from "../pages/cliente/Seguimiento";
import PerfilCliente from "../pages/cliente/Perfil";

import DashboardRepartidor from "../pages/repartidor/Dashboard";
import Entregas from "../pages/repartidor/Entregas";
import Ruta from "../pages/repartidor/Ruta";
import PerfilRepartidor from "../pages/repartidor/Perfil";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-empresa" element={<RegisterEmpresa />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="rutas" element={<Rutas />} />
          <Route path="monitoreo" element={<Monitoreo />} />
          <Route path="reportes" element={<Reportes />} />
        </Route>

        <Route
          path="/cliente"
          element={
            <ProtectedRoute roles={["cliente"]}>
              <ClienteLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardCliente />} />
          <Route path="pedidos" element={<MisPedidos />} />
          <Route path="seguimiento" element={<Seguimiento />} />
          <Route path="perfil" element={<PerfilCliente />} />
        </Route>

        <Route
          path="/repartidor"
          element={
            <ProtectedRoute roles={["repartidor"]}>
              <RepartidorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardRepartidor />} />
          <Route path="entregas" element={<Entregas />} />
          <Route path="ruta" element={<Ruta />} />
          <Route path="perfil" element={<PerfilRepartidor />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
