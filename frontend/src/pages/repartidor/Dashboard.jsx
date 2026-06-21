import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService";
import { ESTADO_LABELS } from "../../services/pedidoService";
import { ESTADO_RUTA_LABELS } from "../../services/rutaService";
import { StatCard, StatsGrid } from "../../components/dashboard/StatCard";
import "../../assets/styles/admin.css";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardService.repartidor()
      .then(({ data }) => setStats(data.stats))
      .catch((err) => setError(err.response?.data?.error || "Error al cargar"));
  }, []);

  if (!stats) {
    return <div className="empty-state">{error || "Cargando..."}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Mi Panel</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <StatsGrid>
        <StatCard value={stats.entregas_pendientes} label="Entregas pendientes" variant="warning" />
        <StatCard value={stats.entregadas_hoy} label="Entregadas hoy" variant="success" />
        <StatCard
          value={stats.ruta_activa ? stats.ruta_activa.total_paradas : 0}
          label="Paradas en ruta"
          variant="info"
        />
      </StatsGrid>

      <div className="quick-links">
        <Link to="/repartidor/ruta" className="btn btn-primary">Ver mi ruta</Link>
        <Link to="/repartidor/entregas" className="btn btn-secondary">Gestionar entregas</Link>
      </div>

      {stats.ruta_activa && (
        <div className="siguiente-card dashboard-section">
          <h2 style={{ fontSize: "16px", margin: "0 0 8px" }}>Ruta de hoy</h2>
          <p style={{ margin: "0 0 4px" }}>
            {stats.ruta_activa.total_paradas} paradas ·{" "}
            <span className={`badge badge-${stats.ruta_activa.estado}`}>
              {ESTADO_RUTA_LABELS[stats.ruta_activa.estado]}
            </span>
          </p>
          <Link to="/repartidor/ruta" className="btn btn-primary btn-sm">
            Abrir ruta y GPS
          </Link>
        </div>
      )}

      {stats.siguiente_entrega && (
        <div className="dashboard-section">
          <h2>Próxima entrega</h2>
          <div className="table-container" style={{ padding: "16px" }}>
            <p style={{ margin: "0 0 4px" }}>
              <strong>#{stats.siguiente_entrega.id}</strong> — {stats.siguiente_entrega.direccion_entrega}
            </p>
            <p style={{ margin: 0 }}>
              Cliente: {stats.siguiente_entrega.cliente_nombre} ·{" "}
              <span className={`badge badge-${stats.siguiente_entrega.estado}`}>
                {ESTADO_LABELS[stats.siguiente_entrega.estado]}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="dashboard-section">
        <h2>Entregas recientes</h2>
        {stats.entregas_recientes.length === 0 ? (
          <div className="empty-state">Sin entregas asignadas</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.entregas_recientes.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.cliente_nombre}</td>
                    <td>{p.direccion_entrega}</td>
                    <td>
                      <span className={`badge badge-${p.estado}`}>
                        {ESTADO_LABELS[p.estado]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
