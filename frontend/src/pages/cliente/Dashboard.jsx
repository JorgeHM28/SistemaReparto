import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService";
import { ESTADO_LABELS } from "../../services/pedidoService";
import { StatCard, StatsGrid } from "../../components/dashboard/StatCard";
import "../../assets/styles/admin.css";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardService.cliente()
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
        <StatCard value={stats.total_pedidos} label="Total pedidos" variant="primary" />
        <StatCard value={stats.pendientes} label="Pendientes" variant="warning" />
        <StatCard value={stats.en_camino} label="En camino" variant="info" />
        <StatCard value={stats.entregados} label="Entregados" variant="success" />
      </StatsGrid>

      <div className="quick-links">
        <Link to="/cliente/pedidos" className="btn btn-primary">+ Nuevo pedido</Link>
        <Link to="/cliente/seguimiento" className="btn btn-secondary">Seguimiento en vivo</Link>
      </div>

      {stats.pedido_activo && (
        <div className="siguiente-card dashboard-section">
          <h2 style={{ fontSize: "16px", margin: "0 0 8px" }}>Pedido en camino</h2>
          <p style={{ margin: "0 0 4px" }}>
            <strong>#{stats.pedido_activo.id}</strong> — {stats.pedido_activo.direccion_entrega}
          </p>
          <p style={{ margin: "0 0 8px" }}>
            <span className={`badge badge-${stats.pedido_activo.estado}`}>
              {ESTADO_LABELS[stats.pedido_activo.estado]}
            </span>
            {stats.pedido_activo.repartidor_nombre && (
              <> · Repartidor: {stats.pedido_activo.repartidor_nombre}</>
            )}
          </p>
          <Link to="/cliente/seguimiento" className="btn btn-primary btn-sm">
            Ver en mapa
          </Link>
        </div>
      )}

      <div className="dashboard-section">
        <h2>Pedidos recientes</h2>
        {stats.recientes.length === 0 ? (
          <div className="empty-state">Aún no hiciste pedidos</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats.recientes.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.direccion_entrega}</td>
                    <td>
                      <span className={`badge badge-${p.estado}`}>
                        {ESTADO_LABELS[p.estado]}
                      </span>
                    </td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
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
