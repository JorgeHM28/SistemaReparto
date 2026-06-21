import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, rutaPorRol } from "../../context/AuthContext";
import "../../assets/styles/auth.css";

export default function Register() {
  const { register, estaAutenticado, usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
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
      const u = await register({
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono || undefined,
        password: form.password,
      });
      navigate(rutaPorRol(u.rol));
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Registro</h1>
        <p>Crear cuenta de cliente</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
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
            {enviando ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/">¿Ya tenés cuenta? Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
