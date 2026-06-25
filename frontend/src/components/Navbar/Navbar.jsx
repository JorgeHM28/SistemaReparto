import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="dashboard-navbar">
      <a href="/" className="dashboard-navbar-brand">
        <img src="/logo-deliverytrack.svg" alt="" width="32" height="32" />
        <span>
          Delivery<span className="dashboard-navbar-brand-accent">Track</span>
        </span>
      </a>

      {usuario && (
        <div className="dashboard-navbar-actions">
          <ThemeToggle className="theme-toggle--dashboard" />
          <span className="dashboard-navbar-user">
            {usuario.empresa_nombre && (
              <span className="dashboard-navbar-user-role">{usuario.empresa_nombre} · </span>
            )}
            {usuario.nombre}{" "}
            <span className="dashboard-navbar-user-role">({usuario.rol})</span>
          </span>
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}
