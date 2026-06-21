import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export default function ClienteLayout() {
  const menu = [
    {
      nombre: "Dashboard",
      path: "/cliente",
    },
    {
      nombre: "Mis Pedidos",
      path: "/cliente/pedidos",
    },
    {
      nombre: "Seguimiento",
      path: "/cliente/seguimiento",
    },
    {
      nombre: "Perfil",
      path: "/cliente/perfil",
    },
  ];

  return (
    <>
      <Navbar />

      <div style={{ display: "flex" }}>
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
