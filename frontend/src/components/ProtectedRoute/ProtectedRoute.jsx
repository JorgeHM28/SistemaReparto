import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ roles, children }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <p style={{ padding: "20px" }}>Cargando...</p>;
  }

  if (!usuario) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    const rutas = {
      admin: "/admin",
      cliente: "/cliente",
      repartidor: "/repartidor",
    };

    return <Navigate to={rutas[usuario.rol] || "/"} replace />;
  }

  return children;
}
