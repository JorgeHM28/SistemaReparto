import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, rutaPorRol } from "../../context/AuthContext";
import "../../assets/styles/auth.css";

export default function RegisterEmpresa() {
  const { registerEmpresa, estaAutenticado, usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    empresa_nombre: "",
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    confirmar: "",
  });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (estaAutenticado && usuario) {
    return <Navigate to={rutaPorRol(usuario.rol)} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setEnviando(true);

    try {
      const u = await registerEmpresa({
        empresa_nombre: form.empresa_nombre,
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono || undefined,
        password: form.password,
      });
      navigate(rutaPorRol(u.rol));
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar la empresa");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Registrar empresa</h1>
        <p>Creá tu empresa y cuenta de administrador</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Nombre de la empresa
            <input
              type="text"
              name="empresa_nombre"
              value={form.empresa_nombre}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Tu nombre
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
            Teléfono (opcional)
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>

          <label>
            Confirmar contraseña
            <input
              type="password"
              name="confirmar"
              value={form.confirmar}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>

          <button type="submit" className="auth-btn" disabled={enviando}>
            {enviando ? "Registrando..." : "Crear empresa"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">¿Ya tenés cuenta? Iniciar sesión</Link>
          <Link to="/register">Registrarse como cliente</Link>
        </div>
      </div>
    </div>
  );
}
