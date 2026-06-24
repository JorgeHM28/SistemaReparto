import { useCallback, useEffect, useState, useRef } from "react";
import { rutaService, ESTADO_RUTA_LABELS } from "../../services/rutaService";
import { ESTADO_LABELS } from "../../services/pedidoService";
import { ubicacionService } from "../../services/ubicacionService";
import { useGeolocationTracker } from "../../hooks/useGeolocationTracker";
import MapView from "../../components/Map/MapView";

export default function Ruta() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [gpsActivo, setGpsActivo] = useState(false);
  const [miUbicacion, setMiUbicacion] = useState(null);
  const optimizadaRef = useRef(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const res = await rutaService.getActiva();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar ruta");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const enviarUbicacion = useCallback(async (lat, lng) => {
    try {
      const res = await ubicacionService.enviar({ latitud: lat, longitud: lng });
      setMiUbicacion(res.data.ubicacion);

      if (!optimizadaRef.current && data?.ruta && data?.paradas?.length > 1 && data.ruta.estado === "en_proceso") {
        optimizadaRef.current = true;
        try {
          await rutaService.optimizar(data.ruta.id, { latitud_inicio: lat, longitud_inicio: lng });
          await cargar();
        } catch (err) {
          console.error("Error al optimizar automáticamente la ruta:", err);
          optimizadaRef.current = false;
        }
      }
    } catch {
      // Ignorar errores puntuales de red
    }
  }, [data, cargar]);

  const rutaEnProceso = data?.ruta?.estado === "en_proceso";
  const { activo: gpsConectado, error: gpsError } = useGeolocationTracker(
    enviarUbicacion,
    gpsActivo && rutaEnProceso,
    3000
  );

  const iniciarRuta = async () => {
    try {
      await rutaService.update(data.ruta.id, { estado: "en_proceso" });
      setGpsActivo(true);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar ruta");
    }
  };

  if (cargando) {
    return <div className="empty-state">Cargando ruta...</div>;
  }

  if (!data?.ruta) {
    return (
      <div>
        <h1>Mi Ruta</h1>
        <div className="empty-state">No tenés ruta asignada para hoy</div>
      </div>
    );
  }

  const { ruta, paradas, siguiente_entrega } = data;

  const pedidosMapa = paradas.map((p) => ({
    id: p.pedido_id,
    latitud: p.latitud,
    longitud: p.longitud,
    direccion_entrega: p.direccion_entrega,
    cliente_nombre: p.cliente_nombre,
    estado: p.estado,
  }));

  const repartidoresMapa = miUbicacion ? [miUbicacion] : [];
  const rutaLinea = paradas.map((p) => [parseFloat(p.latitud), parseFloat(p.longitud)]);

  return (
    <div>
      <div className="page-header">
        <h1>Mi Ruta</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          {ruta.estado === "pendiente" && (
            <button type="button" className="btn btn-primary" onClick={iniciarRuta}>
              Iniciar ruta
            </button>
          )}
          {rutaEnProceso && (
            <button
              type="button"
              className={`btn ${gpsActivo ? "btn-danger" : "btn-primary"}`}
              onClick={() => setGpsActivo(!gpsActivo)}
            >
              {gpsActivo ? "Detener GPS" : "Compartir GPS"}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {gpsError && <div className="alert alert-error">{gpsError}</div>}

      <p style={{ marginBottom: "12px", color: "#6b7280" }}>
        Fecha: {ruta.fecha} ·{" "}
        <span className={`badge badge-${ruta.estado}`}>
          {ESTADO_RUTA_LABELS[ruta.estado]}
        </span>
        {" · "}{paradas.length} paradas
        {gpsActivo && rutaEnProceso && (
          <>
            {" · "}
            <span className={`badge badge-${gpsConectado ? "entregado" : "pendiente"}`}>
              GPS {gpsConectado ? "activo" : "conectando..."}
            </span>
          </>
        )}
      </p>

      <MapView
        height="350px"
        pedidos={pedidosMapa}
        repartidores={repartidoresMapa}
        rutas={[rutaLinea]}
      />

      {siguiente_entrega && (
        <div className="siguiente-card" style={{ marginTop: "16px" }}>
          <h3>Próxima entrega</h3>
          <p style={{ margin: 0 }}>
            <strong>#{siguiente_entrega.pedido_id}</strong> — {siguiente_entrega.direccion_entrega}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
            Cliente: {siguiente_entrega.cliente_nombre}
          </p>
        </div>
      )}

      <h2 style={{ fontSize: "18px", margin: "20px 0 12px" }}>Orden de entregas</h2>
      <div className="table-container">
        <ul className="paradas-list">
          {paradas.map((p) => {
            const esSiguiente = siguiente_entrega?.pedido_id === p.pedido_id;
            const completada = p.estado === "entregado";

            return (
              <li key={p.pedido_id}>
                <span className={`parada-num ${esSiguiente ? "siguiente" : ""} ${completada ? "completada" : ""}`}>
                  {p.orden_entrega}
                </span>
                <div>
                  <strong>#{p.pedido_id}</strong> — {p.direccion_entrega}
                  <br />
                  <small>{p.cliente_nombre} · </small>
                  <span className={`badge badge-${p.estado}`}>{ESTADO_LABELS[p.estado]}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
