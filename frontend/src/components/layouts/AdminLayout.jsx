import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const menu = [
    {
      nombre: "Dashboard",
      path: "/admin",
    },
    {
      nombre: "Usuarios",
      path: "/admin/usuarios",
    },
    {
      nombre: "Pedidos",
      path: "/admin/pedidos",
    },
    {
      nombre: "Rutas",
      path: "/admin/rutas",
    },
    {
      nombre: "Monitoreo",
      path: "/admin/monitoreo",
    },
    {
      nombre: "Reportes",
      path: "/admin/reportes",
    },
  ];

  return (
    <>
      <Navbar />

      <div
        style={{
          display: "flex",
        }}
      >
        <Sidebar menu={menu} />

        <main
          style={{
            flex: 1,
            padding: "20px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
}
