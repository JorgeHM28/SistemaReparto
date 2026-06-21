import { useCallback, useEffect, useState } from "react";
import { usuarioService } from "../../services/usuarioService";
import { rutaService, ESTADO_RUTA_LABELS } from "../../services/rutaService";
import { ESTADO_LABELS } from "../../services/pedidoService";
import "../../assets/styles/admin.css";

const FORM_VACIO = {
  repartidor_id: "",
  fecha: new Date().toISOString().split("T")[0],
  pedido_ids: [],
};

export default function Rutas() {
  const [rutas, setRutas] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [pedidosDisponibles, setPedidosDisponibles] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalCrear, setModalCrear] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const cargarRutas = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;

      const { data } = await rutaService.getAll(params);
      setRutas(data.rutas);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar rutas");
    } finally {
      setCargando(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    cargarRutas();
  }, [cargarRutas]);

  const abrirCrear = async () => {
    try {
      const [resRep, resPed] = await Promise.all([
        usuarioService.getAll({ rol: "repartidor" }),
        rutaService.getDisponibles(),
      ]);
      setRepartidores(resRep.data.usuarios.filter((r) => r.activo));
      setPedidosDisponibles(resPed.data.pedidos);
      setForm(FORM_VACIO);
      setModalCrear(true);
    } catch {
      setError("Error al cargar datos para crear ruta");
    }
  };

  const verDetalle = async (id) => {
    try {
      const { data } = await rutaService.getById(id);
      setModalDetalle(data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar detalle");
    }
  };

  const togglePedido = (pedidoId) => {
    setForm((prev) => ({
      ...prev,
      pedido_ids: prev.pedido_ids.includes(pedidoId)
        ? prev.pedido_ids.filter((id) => id !== pedidoId)
        : [...prev.pedido_ids, pedidoId],
    }));
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      await rutaService.create({
        repartidor_id: parseInt(form.repartidor_id, 10),
        fecha: form.fecha,
        pedido_ids: form.pedido_ids,
      });
      setModalCrear(false);
      cargarRutas();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear ruta");
    } finally {
      setGuardando(false);
    }
  };

  const optimizar = async (id) => {
    try {
      const { data } = await rutaService.optimizar(id);
      setModalDetalle(data);
      cargarRutas();
    } catch (err) {
      setError(err.response?.data?.error || "Error al optimizar");
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await rutaService.update(id, { estado });
      cargarRutas();
      if (modalDetalle?.ruta?.id === id) {
        verDetalle(id);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar estado");
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar esta ruta?")) return;

    try {
      await rutaService.delete(id);
      setModalDetalle(null);
      cargarRutas();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar");
    }
  };

  const historial = rutas.filter((r) => r.estado === "finalizada");
  const activas = rutas.filter((r) => r.estado !== "finalizada");

  return (
    <div>
      <div className="page-header">
        <h1>Gestión de Rutas</h1>
        <button type="button" className="btn btn-primary" onClick={abrirCrear}>
          + Nueva ruta
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters">
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En proceso</option>
          <option value="finalizada">Finalizada</option>
        </select>
      </div>

      {cargando ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <>
          <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Rutas activas</h2>
          <TablaRutas
            rutas={activas}
            onVer={verDetalle}
            onOptimizar={optimizar}
            onEstado={cambiarEstado}
            onEliminar={eliminar}
            vacio="No hay rutas activas"
          />

          <h2 style={{ fontSize: "18px", margin: "24px 0 12px" }}>Historial</h2>
          <TablaRutas
            rutas={historial}
            onVer={verDetalle}
            vacio="No hay rutas finalizadas"
          />
        </>
      )}

      {modalCrear && (
        <div className="modal-overlay" onClick={() => setModalCrear(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nueva ruta</h2>

            <form className="form-grid" onSubmit={handleCrear}>
              <label>
                Repartidor
                <select
                  value={form.repartidor_id}
                  onChange={(e) => setForm({ ...form, repartidor_id: e.target.value })}
                  required
                >
                  <option value="">Seleccionar repartidor</option>
                  {repartidores.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </label>

              <label>
                Fecha
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  required
                />
              </label>

              <label>
                Pedidos ({form.pedido_ids.length} seleccionados)
                <div className="checkbox-list">
                  {pedidosDisponibles.length === 0 ? (
                    <p style={{ margin: 0, color: "#6b7280" }}>No hay pedidos disponibles</p>
                  ) : (
                    pedidosDisponibles.map((p) => (
                      <label key={p.id}>
                        <input
                          type="checkbox"
                          checked={form.pedido_ids.includes(p.id)}
                          onChange={() => togglePedido(p.id)}
                        />
                        #{p.id} — {p.direccion_entrega} ({p.cliente_nombre})
                      </label>
                    ))
                  )}
                </div>
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalCrear(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={guardando || form.pedido_ids.length === 0}
                >
                  {guardando ? "Creando..." : "Crear ruta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDetalle && (
        <div className="modal-overlay" onClick={() => setModalDetalle(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <h2>Ruta #{modalDetalle.ruta.id}</h2>
            <p style={{ margin: "0 0 16px", color: "#6b7280" }}>
              {modalDetalle.ruta.repartidor_nombre} — {modalDetalle.ruta.fecha}
              {" · "}
              <span className={`badge badge-${modalDetalle.ruta.estado}`}>
                {ESTADO_RUTA_LABELS[modalDetalle.ruta.estado]}
              </span>
            </p>

            <h3 style={{ fontSize: "15px", marginBottom: "8px" }}>Orden de entregas</h3>
            <ul className="paradas-list">
              {modalDetalle.paradas.map((p) => (
                <li key={p.pedido_id}>
                  <span className={`parada-num ${p.estado === "entregado" ? "completada" : ""}`}>
                    {p.orden_entrega}
                  </span>
                  <div>
                    <strong>#{p.pedido_id}</strong> — {p.direccion_entrega}
                    <br />
                    <small>{p.cliente_nombre} · </small>
                    <span className={`badge badge-${p.estado}`}>{ESTADO_LABELS[p.estado]}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="modal-actions">
              {modalDetalle.paradas.length >= 2 && modalDetalle.ruta.estado !== "finalizada" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => optimizar(modalDetalle.ruta.id)}
                >
                  Optimizar (vecino más cercano)
                </button>
              )}
              {modalDetalle.ruta.estado === "pendiente" && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => cambiarEstado(modalDetalle.ruta.id, "en_proceso")}
                >
                  Iniciar ruta
                </button>
              )}
              {modalDetalle.ruta.estado === "en_proceso" && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => cambiarEstado(modalDetalle.ruta.id, "finalizada")}
                >
                  Finalizar
                </button>
              )}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => eliminar(modalDetalle.ruta.id)}
              >
                Eliminar
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setModalDetalle(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TablaRutas({ rutas, onVer, onOptimizar, onEstado, onEliminar, vacio }) {
  if (rutas.length === 0) {
    return <div className="empty-state">{vacio}</div>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Repartidor</th>
            <th>Fecha</th>
            <th>Paradas</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rutas.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.repartidor_nombre}</td>
              <td>{r.fecha}</td>
              <td>{r.total_paradas}</td>
              <td>
                <span className={`badge badge-${r.estado}`}>
                  {ESTADO_RUTA_LABELS[r.estado]}
                </span>
              </td>
              <td>
                <div className="actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onVer(r.id)}>
                    Ver
                  </button>
                  {onOptimizar && r.total_paradas >= 2 && r.estado !== "finalizada" && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => onOptimizar(r.id)}>
                      Optimizar
                    </button>
                  )}
                  {onEliminar && r.estado !== "finalizada" && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => onEliminar(r.id)}>
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
