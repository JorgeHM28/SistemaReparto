import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "../../assets/styles/admin.css";

export default function AdminLayout() {
  const menu = [
    { nombre: "Dashboard", path: "/admin" },
    { nombre: "Usuarios", path: "/admin/usuarios" },
    { nombre: "Pedidos", path: "/admin/pedidos" },
    { nombre: "Rutas", path: "/admin/rutas" },
    { nombre: "Monitoreo", path: "/admin/monitoreo" },
    { nombre: "Reportes", path: "/admin/reportes" },
  ];

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-shell-body">
        <Sidebar menu={menu} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
