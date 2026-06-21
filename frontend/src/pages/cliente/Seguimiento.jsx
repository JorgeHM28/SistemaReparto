import { useCallback, useEffect, useState } from "react";
import { pedidoService, ESTADO_LABELS } from "../../services/pedidoService";
import { ubicacionService } from "../../services/ubicacionService";
import { usePolling } from "../../hooks/usePolling";
import MapView from "../../components/Map/MapView";
import "../../assets/styles/admin.css";

export default function Seguimiento() {
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [ubicacionRepartidor, setUbicacionRepartidor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        const { data } = await pedidoService.getAll();
        const activo = data.pedidos.find((p) =>
          ["asignado", "en_ruta"].includes(p.estado) && p.repartidor_id
        );
        setPedidoActivo(activo || null);
      } catch (err) {
        setError(err.response?.data?.error || "Error al cargar pedidos");
      } finally {
        setCargando(false);
      }
    };

    cargarPedido();
  }, []);

  const actualizarUbicacion = useCallback(async () => {
    if (!pedidoActivo?.repartidor_id) return;

    try {
      const { data } = await ubicacionService.getUltima(pedidoActivo.repartidor_id);
      setUbicacionRepartidor(data.ubicacion);
      setUltimaActualizacion(new Date());
    } catch {
      // Repartidor aún no compartió ubicación
    }
  }, [pedidoActivo]);

  usePolling(actualizarUbicacion, 3000, !!pedidoActivo?.repartidor_id);

  if (cargando) {
    return <div className="empty-state">Cargando...</div>;
  }

  if (!pedidoActivo) {
    return (
      <div>
        <h1>Seguimiento</h1>
        <div className="empty-state">
          No tenés pedidos en camino. Cuando un repartidor esté asignado, podrás verlo aquí.
        </div>
      </div>
    );
  }

  const repartidores = ubicacionRepartidor ? [ubicacionRepartidor] : [];

  return (
    <div>
      <div className="page-header">
        <h1>Seguimiento del pedido #{pedidoActivo.id}</h1>
        {ultimaActualizacion && (
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            GPS: {ultimaActualizacion.toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="siguiente-card" style={{ marginBottom: "16px" }}>
        <p style={{ margin: "0 0 4px" }}>
          <strong>Estado:</strong>{" "}
          <span className={`badge badge-${pedidoActivo.estado}`}>
            {ESTADO_LABELS[pedidoActivo.estado]}
          </span>
        </p>
        <p style={{ margin: "0 0 4px" }}>
          <strong>Dirección:</strong> {pedidoActivo.direccion_entrega}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Repartidor:</strong> {pedidoActivo.repartidor_nombre || "Asignado"}
          {!ubicacionRepartidor && " — esperando señal GPS..."}
        </p>
      </div>

      <MapView
        height="calc(100vh - 320px)"
        pedidos={[pedidoActivo]}
        repartidores={repartidores}
        fitBounds={!!ubicacionRepartidor}
      />
    </div>
  );
}
