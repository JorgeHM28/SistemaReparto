import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  pedidoService,
  ESTADOS_PEDIDO,
  ESTADO_LABELS,
} from "../../services/pedidoService";

const FORM_VACIO = {
  direccion_entrega: "",
  latitud: "-34.6037",
  longitud: "-58.3816",
};

import { useLocation } from "react-router-dom";

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const location = useLocation();

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;

      const { data } = await pedidoService.getAll(params);
      setPedidos(data.pedidos);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar pedidos");
    } finally {
      setCargando(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  useEffect(() => {
    if (location.state?.openModal) {
      setModalAbierto(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      await pedidoService.create({
        direccion_entrega: form.direccion_entrega,
        latitud: parseFloat(form.latitud),
        longitud: parseFloat(form.longitud),
      });
      setForm(FORM_VACIO);
      setModalAbierto(false);
      cargarPedidos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear pedido");
    } finally {
      setGuardando(false);
    }
  };

  const cancelarPedido = async (pedido) => {
    if (!confirm("¿Cancelar este pedido?")) return;

    try {
      await pedidoService.update(pedido.id, { estado: "cancelado" });
      cargarPedidos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cancelar");
    }
  };

  const historial = pedidos.filter((p) =>
    ["entregado", "cancelado"].includes(p.estado)
  );
  const activos = pedidos.filter((p) =>
    !["entregado", "cancelado"].includes(p.estado)
  );

  return (
    <div>
      <div className="page-header">
        <h1>Mis Pedidos</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setModalAbierto(true)}
        >
          + Nuevo pedido
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters">
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          {ESTADOS_PEDIDO.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      {cargando ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <>
          <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Pedidos activos</h2>
          <ListaPedidos
            pedidos={activos}
            onCancelar={cancelarPedido}
            vacio="No tenés pedidos activos"
          />

          <h2 style={{ fontSize: "18px", margin: "24px 0 12px" }}>Historial</h2>
          <ListaPedidos
            pedidos={historial}
            vacio="No hay pedidos en el historial"
          />
        </>
      )}

      {modalAbierto && createPortal(
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nuevo pedido</h2>

            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Dirección de entrega
                <input
                  type="text"
                  name="direccion_entrega"
                  value={form.direccion_entrega}
                  onChange={handleChange}
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                  required
                />
              </label>

              <label>
                Latitud
                <input
                  type="number"
                  step="any"
                  name="latitud"
                  value={form.latitud}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Longitud
                <input
                  type="number"
                  step="any"
                  name="longitud"
                  value={form.longitud}
                  onChange={handleChange}
                  required
                />
              </label>

              <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                Las coordenadas se usarán para el mapa en una próxima versión.
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? "Creando..." : "Crear pedido"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ListaPedidos({ pedidos, onCancelar, vacio }) {
  if (pedidos.length === 0) {
    return <div className="empty-state">{vacio}</div>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Dirección</th>
            <th>Repartidor</th>
            <th>Estado</th>
            <th>Fecha</th>
            {onCancelar && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.direccion_entrega}</td>
              <td>{p.repartidor_nombre || "Sin asignar"}</td>
              <td>
                <span className={`badge badge-${p.estado}`}>
                  {ESTADO_LABELS[p.estado]}
                </span>
              </td>
              <td>{new Date(p.created_at).toLocaleDateString()}</td>
              {onCancelar && (
                <td>
                  {p.estado === "pendiente" && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onCancelar(p)}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
