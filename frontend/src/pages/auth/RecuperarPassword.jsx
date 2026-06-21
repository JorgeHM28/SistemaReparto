import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../services/authService";
import "../../assets/styles/auth.css";

export default function RecuperarPassword() {
  const [paso, setPaso] = useState(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [devToken, setDevToken] = useState("");
  const [enviando, setEnviando] = useState(false);

  const solicitarRecuperacion = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setEnviando(true);

    try {
      const { data } = await authService.recuperarPassword(email);
      setMensaje(data.message);
      if (data.dev_token) {
        setDevToken(data.dev_token);
        setToken(data.dev_token);
      }
      setPaso(2);
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar la solicitud");
    } finally {
      setEnviando(false);
    }
  };

  const restablecer = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setEnviando(true);

    try {
      const { data } = await authService.restablecerPassword({ token, password });
      setMensaje(data.message);
      setPaso(3);
    } catch (err) {
      setError(err.response?.data?.error || "Error al restablecer contraseña");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Recuperar contraseña</h1>

        {error && <div className="auth-error">{error}</div>}
        {mensaje && <div className="auth-success">{mensaje}</div>}

        {paso === 1 && (
          <form className="auth-form" onSubmit={solicitarRecuperacion}>
            <p>Ingresá tu email y te enviaremos instrucciones.</p>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="auth-btn" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar"}
            </button>
          </form>
        )}

        {paso === 2 && (
          <form className="auth-form" onSubmit={restablecer}>
            <p>Ingresá el token y tu nueva contraseña.</p>
            {devToken && (
              <div className="auth-dev-token">
                <strong>Token (solo desarrollo):</strong> {devToken}
              </div>
            )}
            <label>
              Token
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </label>
            <label>
              Nueva contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>
            <label>
              Confirmar contraseña
              <input
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                minLength={6}
              />
            </label>
            <button type="submit" className="auth-btn" disabled={enviando}>
              {enviando ? "Guardando..." : "Restablecer"}
            </button>
          </form>
        )}

        {paso === 3 && (
          <div className="auth-links">
            <Link to="/">Volver al login</Link>
          </div>
        )}

        {paso < 3 && (
          <div className="auth-links">
            <Link to="/">Volver al login</Link>
          </div>
        )}
      </div>
    </div>
  );
}
