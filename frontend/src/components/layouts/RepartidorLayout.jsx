import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export default function RepartidorLayout() {
  const menu = [
    {
      nombre: "Dashboard",
      path: "/repartidor",
    },
    {
      nombre: "Entregas",
      path: "/repartidor/entregas",
    },
    {
      nombre: "Mi Ruta",
      path: "/repartidor/ruta",
    },
    {
      nombre: "Perfil",
      path: "/repartidor/perfil",
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
