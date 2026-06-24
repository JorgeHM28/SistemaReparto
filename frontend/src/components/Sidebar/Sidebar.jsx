import { NavLink } from "react-router-dom";

export default function Sidebar({ menu }) {
  return (
    <aside className="dashboard-sidebar">
      <nav className="dashboard-sidebar-nav" aria-label="Menú principal">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.split("/").length <= 2}
            className={({ isActive }) =>
              `dashboard-sidebar-link${isActive ? " active" : ""}`
            }
          >
            {item.nombre}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
