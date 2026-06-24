import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboardService";
import { ESTADO_LABELS } from "../../services/pedidoService";
import { StatCard, StatsGrid } from "../../components/dashboard/StatCard";

export default function Reportes() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardService.reportes()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || "Error al cargar reportes"));
  }, []);

  if (!data) {
    return <div className="empty-state">{error || "Cargando reportes..."}</div>;
  }

  const { generales, por_repartidor, por_estado, ultimos_entregados, ultimos_cancelados } = data;

  return (
    <div>
      <div className="page-header">
        <h1>Reportes</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-section">
        <h2>Estadísticas generales</h2>
        <StatsGrid>
          <StatCard value={generales.total_pedidos} label="Total pedidos" variant="primary" />
          <StatCard value={generales.entregados} label="Entregados" variant="success" />
          <StatCard value={generales.cancelados} label="Cancelados" variant="danger" />
          <StatCard value={generales.pendientes} label="Pendientes" variant="warning" />
          <StatCard value={generales.en_ruta} label="En ruta" variant="info" />
          <StatCard value={generales.pedidos_hoy} label="Pedidos hoy" variant="primary" />
          <StatCard value={generales.entregados_hoy} label="Entregados hoy" variant="success" />
        </StatsGrid>
      </div>

      <div className="dashboard-section">
        <h2>Pedidos por estado</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {por_estado.map((row) => (
                <tr key={row.estado}>
                  <td>
                    <span className={`badge badge-${row.estado}`}>
                      {ESTADO_LABELS[row.estado] || row.estado}
                    </span>
                  </td>
                  <td>{row.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Entregas por repartidor</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Repartidor</th>
                <th>Total asignados</th>
                <th>Entregados</th>
                <th>Pendientes</th>
                <th>Cancelados</th>
              </tr>
            </thead>
            <tbody>
              {por_repartidor.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombre}</td>
                  <td>{r.total_asignados}</td>
                  <td>{r.entregados}</td>
                  <td>{r.pendientes}</td>
                  <td>{r.cancelados}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Últimos entregados</h2>
        {ultimos_entregados.length === 0 ? (
          <div className="empty-state">Sin entregas registradas</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Repartidor</th>
                  <th>Fecha entrega</th>
                </tr>
              </thead>
              <tbody>
                {ultimos_entregados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.cliente_nombre}</td>
                    <td>{p.repartidor_nombre || "—"}</td>
                    <td>
                      {p.fecha_entrega
                        ? new Date(p.fecha_entrega).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Últimos cancelados</h2>
        {ultimos_cancelados.length === 0 ? (
          <div className="empty-state">Sin cancelaciones</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ultimos_cancelados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.cliente_nombre}</td>
                    <td>{p.direccion_entrega}</td>
                    <td>{new Date(p.updated_at).toLocaleDateString()}</td>
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
