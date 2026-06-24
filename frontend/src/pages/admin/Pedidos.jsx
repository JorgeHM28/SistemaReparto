import { useCallback, useEffect, useState } from "react";
import { usuarioService } from "../../services/usuarioService";
import {
  pedidoService,
  ESTADOS_PEDIDO,
  ESTADO_LABELS,
} from "../../services/pedidoService";

const FORM_VACIO = {
  cliente_id: "",
  repartidor_id: "",
  direccion_entrega: "",
  latitud: "-34.6037",
  longitud: "-58.3816",
  estado: "pendiente",
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [resClientes, resRepartidores] = await Promise.all([
          usuarioService.getAll({ rol: "cliente" }),
          usuarioService.getAll({ rol: "repartidor" }),
        ]);
        setClientes(resClientes.data.usuarios);
        setRepartidores(resRepartidores.data.usuarios.filter((r) => r.activo));
      } catch {
        setError("Error al cargar clientes y repartidores");
      }
    };
    cargarCatalogos();
  }, []);

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const params = {};
      if (busqueda) params.search = busqueda;
      if (filtroEstado) params.estado = filtroEstado;

      const { data } = await pedidoService.getAll(params);
      setPedidos(data.pedidos);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar pedidos");
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroEstado]);

  useEffect(() => {
    const timer = setTimeout(cargarPedidos, 300);
    return () => clearTimeout(timer);
  }, [cargarPedidos]);

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setModalAbierto(true);
  };

  const abrirEditar = (pedido) => {
    setEditando(pedido);
    setForm({
      cliente_id: pedido.cliente_id,
      repartidor_id: pedido.repartidor_id || "",
      direccion_entrega: pedido.direccion_entrega,
      latitud: pedido.latitud,
      longitud: pedido.longitud,
      estado: pedido.estado,
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm(FORM_VACIO);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const payload = {
        direccion_entrega: form.direccion_entrega,
        latitud: parseFloat(form.latitud),
        longitud: parseFloat(form.longitud),
        repartidor_id: form.repartidor_id || null,
        estado: form.estado,
      };

      if (editando) {
        await pedidoService.update(editando.id, payload);
      } else {
        payload.cliente_id = parseInt(form.cliente_id, 10);
        await pedidoService.create(payload);
      }

      cerrarModal();
      cargarPedidos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar pedido");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (pedido) => {
    if (!confirm(`¿Eliminar pedido #${pedido.id}?`)) return;

    try {
      await pedidoService.delete(pedido.id);
      cargarPedidos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar");
    }
  };

  const cambiarEstado = async (pedido, estado) => {
    try {
      await pedidoService.update(pedido.id, { estado });
      cargarPedidos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar estado");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Gestión de Pedidos</h1>
        <button type="button" className="btn btn-primary" onClick={abrirCrear}>
          + Nuevo pedido
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por dirección, cliente o repartidor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          {ESTADOS_PEDIDO.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        {cargando ? (
          <div className="empty-state">Cargando...</div>
        ) : pedidos.length === 0 ? (
          <div className="empty-state">No se encontraron pedidos</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Repartidor</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.cliente_nombre}</td>
                  <td>{p.direccion_entrega}</td>
                  <td>{p.repartidor_nombre || "—"}</td>
                  <td>
                    <span className={`badge badge-${p.estado}`}>
                      {ESTADO_LABELS[p.estado]}
                    </span>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => abrirEditar(p)}
                      >
                        Editar
                      </button>
                      {p.estado === "pendiente" && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => cambiarEstado(p, "cancelado")}
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEliminar(p)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editando ? `Editar pedido #${editando.id}` : "Nuevo pedido"}</h2>

            <form className="form-grid" onSubmit={handleSubmit}>
              {!editando && (
                <label>
                  Cliente
                  <select
                    name="cliente_id"
                    value={form.cliente_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre} ({c.email})</option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                Dirección de entrega
                <input
                  type="text"
                  name="direccion_entrega"
                  value={form.direccion_entrega}
                  onChange={handleChange}
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

              <label>
                Repartidor
                <select
                  name="repartidor_id"
                  value={form.repartidor_id}
                  onChange={handleChange}
                >
                  <option value="">Sin asignar</option>
                  {repartidores.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </label>

              <label>
                Estado
                <select name="estado" value={form.estado} onChange={handleChange}>
                  {ESTADOS_PEDIDO.filter((e) => e.value).map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
