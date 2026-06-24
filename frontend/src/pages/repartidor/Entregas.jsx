import { useCallback, useEffect, useState } from "react";
import {
  pedidoService,
  ESTADO_LABELS,
} from "../../services/pedidoService";

export default function Entregas() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const { data } = await pedidoService.getAll();
      setPedidos(data.pedidos);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar entregas");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const cambiarEstado = async (pedido, estado) => {
    try {
      await pedidoService.update(pedido.id, { estado });
      cargarPedidos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar");
    }
  };

  const pendientes = pedidos.filter((p) =>
    ["asignado", "en_ruta"].includes(p.estado)
  );

  return (
    <div>
      <div className="page-header">
        <h1>Mis Entregas</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {cargando ? (
        <div className="empty-state">Cargando...</div>
      ) : pendientes.length === 0 ? (
        <div className="empty-state">No tenés entregas asignadas</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.cliente_nombre}</td>
                  <td>{p.direccion_entrega}</td>
                  <td>
                    <span className={`badge badge-${p.estado}`}>
                      {ESTADO_LABELS[p.estado]}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      {p.estado === "asignado" && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => cambiarEstado(p, "en_ruta")}
                        >
                          Iniciar ruta
                        </button>
                      )}
                      {p.estado === "en_ruta" && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => cambiarEstado(p, "entregado")}
                        >
                          Marcar entregado
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
