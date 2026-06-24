import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "../../assets/styles/admin.css";

export default function RepartidorLayout() {
  const menu = [
    { nombre: "Dashboard", path: "/repartidor" },
    { nombre: "Entregas", path: "/repartidor/entregas" },
    { nombre: "Mi Ruta", path: "/repartidor/ruta" },
    { nombre: "Perfil", path: "/repartidor/perfil" },
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
