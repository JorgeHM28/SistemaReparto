import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usuarioService } from "../../services/usuarioService";
import "../../assets/styles/admin.css";

const ROLES = [
  { value: "", label: "Todos los roles" },
  { value: "admin", label: "Administrador" },
  { value: "repartidor", label: "Repartidor" },
  { value: "cliente", label: "Cliente" },
];

const ROL_LABELS = {
  admin: "Administrador",
  repartidor: "Repartidor",
  cliente: "Cliente",
};

const FORM_VACIO = {
  nombre: "",
  email: "",
  telefono: "",
  password: "",
  rol: "cliente",
  activo: 1,
};

export default function Usuarios() {
  const { usuario: authUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const params = {};
      if (busqueda) params.search = busqueda;
      if (filtroRol) params.rol = filtroRol;

      const { data } = await usuarioService.getAll(params);
      setUsuarios(data.usuarios);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroRol]);

  useEffect(() => {
    const timer = setTimeout(cargarUsuarios, 300);
    return () => clearTimeout(timer);
  }, [cargarUsuarios]);

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setModalAbierto(true);
  };

  const abrirEditar = (usuario) => {
    setEditando(usuario);
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono || "",
      password: "",
      rol: usuario.rol,
      activo: usuario.activo,
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm(FORM_VACIO);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "select-one" && name === "activo" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const payload = {
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono || null,
        rol: form.rol,
        activo: form.activo,
      };

      if (form.password) {
        payload.password = form.password;
      }

      if (editando) {
        await usuarioService.update(editando.id, payload);
      } else {
        if (!form.password) {
          setError("La contraseña es obligatoria al crear");
          setGuardando(false);
          return;
        }
        payload.password = form.password;
        await usuarioService.create(payload);
      }

      cerrarModal();
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (usuario) => {
    if (!confirm(`¿Eliminar a ${usuario.nombre}?`)) return;

    try {
      await usuarioService.delete(usuario.id);
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar");
    }
  };

  const toggleActivo = async (usuario) => {
    try {
      await usuarioService.update(usuario.id, {
        activo: usuario.activo ? 0 : 1,
      });
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar estado");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <button type="button" className="btn btn-primary" onClick={abrirCrear}>
          + Nuevo usuario
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        {cargando ? (
          <div className="empty-state">Cargando...</div>
        ) : usuarios.length === 0 ? (
          <div className="empty-state">No se encontraron usuarios</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.telefono || "—"}</td>
                  <td>
                    <span className={`badge badge-${u.rol}`}>
                      {ROL_LABELS[u.rol]}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${u.activo ? "activo" : "inactivo"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => abrirEditar(u)}
                      >
                        Editar
                      </button>
                      {u.rol === "repartidor" && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleActivo(u)}
                          disabled={u.id === authUser?.id}
                        >
                          {u.activo ? "Desactivar" : "Activar"}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEliminar(u)}
                        disabled={u.id === authUser?.id}
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
            <h2>{editando ? "Editar usuario" : "Nuevo usuario"}</h2>

            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Nombre
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Teléfono
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </label>

              <label>
                Rol
                <select name="rol" value={form.rol} onChange={handleChange} required>
                  <option value="cliente">Cliente</option>
                  <option value="repartidor">Repartidor</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>

              <label>
                Estado
                <select name="activo" value={form.activo} onChange={handleChange}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </label>

              <label>
                Contraseña {editando && "(dejar vacío para no cambiar)"}
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editando}
                  minLength={6}
                />
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
