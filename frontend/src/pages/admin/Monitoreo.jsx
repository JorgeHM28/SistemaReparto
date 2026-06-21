import { useCallback, useState } from "react";
import { ubicacionService } from "../../services/ubicacionService";
import { rutaService } from "../../services/rutaService";
import { usePolling } from "../../hooks/usePolling";
import MapView from "../../components/Map/MapView";
import "../../assets/styles/admin.css";

export default function Monitoreo() {
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [rutasLineas, setRutasLineas] = useState([]);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const [mapaRes, rutasRes] = await Promise.all([
        ubicacionService.getMapa(),
        rutaService.getAll({ estado: "en_proceso" }),
      ]);

      setPedidos(mapaRes.data.pedidos);
      setRepartidores(mapaRes.data.repartidores);

      const lineas = await Promise.all(
        rutasRes.data.rutas.map(async (r) => {
          const det = await rutaService.getById(r.id);
          return det.data.paradas.map((p) => [
            parseFloat(p.latitud),
            parseFloat(p.longitud),
          ]);
        })
      );

      setRutasLineas(lineas);
      setUltimaActualizacion(new Date());
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar mapa");
    }
  }, []);

  usePolling(cargar, 3000);

  return (
    <div>
      <div className="page-header">
        <h1>Monitoreo en tiempo real</h1>
        {ultimaActualizacion && (
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            Actualizado: {ultimaActualizacion.toLocaleTimeString()} (cada 3s)
          </span>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
        <span className="badge badge-asignado">📦 {pedidos.length} pedidos activos</span>
        <span className="badge badge-entregado">🛵 {repartidores.length} repartidores en mapa</span>
      </div>

      <MapView
        height="calc(100vh - 220px)"
        pedidos={pedidos}
        repartidores={repartidores}
        rutas={rutasLineas}
      />
    </div>
  );
}
