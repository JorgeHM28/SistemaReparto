import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, rutaPorRol } from "../../context/AuthContext";
import "../../assets/styles/auth.css";

export default function Login() {
  const { login, estaAutenticado, usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
    setEnviando(true);

    try {
      const u = await login(form);
      navigate(rutaPorRol(u.rol));
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Iniciar sesión</h1>
        <p>Sistema de Repartos</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="auth-btn" disabled={enviando}>
            {enviando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/register">Crear cuenta</Link>
          {" · "}
          <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
    </div>
  );
}
