import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService";
import { usePolling } from "../../hooks/usePolling";
import MapView from "../../components/Map/MapView";
import { StatCard, StatsGrid } from "../../components/dashboard/StatCard";
import "../../assets/styles/admin.css";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [mapa, setMapa] = useState({ pedidos: [], repartidores: [] });
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      const { data } = await dashboardService.admin();
      setStats(data.stats);
      setMapa(data.mapa);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar dashboard");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  usePolling(cargar, 10000);

  if (!stats) {
    return <div className="empty-state">{error || "Cargando dashboard..."}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard Administrador</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <StatsGrid>
        <StatCard value={stats.pedidos_pendientes} label="Pedidos pendientes" variant="warning" />
        <StatCard value={stats.pedidos_entregados} label="Pedidos entregados" variant="success" />
        <StatCard value={stats.pedidos_del_dia} label="Pedidos del día" variant="primary" />
        <StatCard value={stats.repartidores_activos} label="Repartidores activos" variant="info" />
        <StatCard value={stats.pedidos_en_ruta} label="En ruta" variant="info" />
        <StatCard value={stats.pedidos_cancelados} label="Cancelados" variant="danger" />
      </StatsGrid>

      <div className="quick-links">
        <Link to="/admin/pedidos" className="btn btn-secondary">Gestionar pedidos</Link>
        <Link to="/admin/rutas" className="btn btn-secondary">Gestionar rutas</Link>
        <Link to="/admin/monitoreo" className="btn btn-secondary">Monitoreo en vivo</Link>
        <Link to="/admin/reportes" className="btn btn-secondary">Ver reportes</Link>
      </div>

      <div className="dashboard-section">
        <h2>Mapa en tiempo real</h2>
        <MapView
          height="400px"
          pedidos={mapa.pedidos}
          repartidores={mapa.repartidores}
        />
      </div>
    </div>
  );
}
