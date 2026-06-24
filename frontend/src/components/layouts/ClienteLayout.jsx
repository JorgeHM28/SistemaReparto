import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "../../assets/styles/admin.css";

export default function ClienteLayout() {
  const menu = [
    { nombre: "Dashboard", path: "/cliente" },
    { nombre: "Mis Pedidos", path: "/cliente/pedidos" },
    { nombre: "Seguimiento", path: "/cliente/seguimiento" },
    { nombre: "Perfil", path: "/cliente/perfil" },
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
