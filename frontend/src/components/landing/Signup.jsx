import { useRef, useState } from "react";
import SuccessModal from "./SuccessModal";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Signup() {
  const nombreRef = useRef(null);
  const emailRef = useRef(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [nombreError, setNombreError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  function validateNombre(value = nombre) {
    const trimmed = value.trim();
    if (trimmed === "") {
      setNombreError("El nombre es obligatorio.");
      return false;
    }
    setNombreError("");
    return true;
  }

  function validateEmail(value = email) {
    const trimmed = value.trim();
    if (trimmed === "") {
      setEmailError("El correo electrónico es obligatorio.");
      return false;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setEmailError("Ingresa un correo válido (ej: usuario@dominio.com).");
      return false;
    }
    setEmailError("");
    return true;
  }

  function handleNombreChange(e) {
    const value = e.target.value;
    setNombre(value);
    if (nombreError) {
      validateNombre(value);
    }
  }

  function handleEmailChange(e) {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const isNombreValid = validateNombre();
    const isEmailValid = validateEmail();

    if (!isNombreValid || !isEmailValid) {
      if (!isNombreValid) {
        nombreRef.current?.focus();
      } else {
        emailRef.current?.focus();
      }
      return;
    }

    setNombre("");
    setEmail("");
    setNombreError("");
    setEmailError("");
    setModalOpen(true);
  }

  return (
    <>
      <section className="signup" id="registro" aria-labelledby="signup-title">
        <div className="container signup-grid">
          <div className="signup-info">
            <p className="section-tag">Prueba gratuita</p>
            <h2 id="signup-title">Empieza hoy. Sin tarjeta de crédito.</h2>
            <p>
              Déjanos tu correo y te activamos tu acceso de prueba en minutos. Centraliza pedidos, optimiza rutas y rastrea tu flota desde cualquier dispositivo.
            </p>
            <ul className="signup-benefits">
              <li>14 días de prueba completa</li>
              <li>Configuración guiada incluida</li>
              <li>Cancela cuando quieras</li>
            </ul>
          </div>

          <form
            className="signup-form"
            id="signup-form"
            noValidate
            aria-label="Formulario de registro para prueba gratis"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="nombre">
                Nombre completo <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                ref={nombreRef}
                type="text"
                id="nombre"
                name="nombre"
                autoComplete="name"
                placeholder="Ej. Juan Pérez"
                required
                aria-required="true"
                aria-describedby="nombre-error"
                aria-invalid={nombreError ? "true" : "false"}
                className={nombreError ? "is-invalid" : ""}
                value={nombre}
                onChange={handleNombreChange}
                onBlur={() => validateNombre()}
              />
              <span className="form-error" id="nombre-error" role="alert">
                {nombreError}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Correo electrónico <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                ref={emailRef}
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder="Ej. juan@miempresa.bo"
                required
                aria-required="true"
                aria-describedby="email-error"
                aria-invalid={emailError ? "true" : "false"}
                className={emailError ? "is-invalid" : ""}
                value={email}
                onChange={handleEmailChange}
                onBlur={() => validateEmail()}
              />
              <span className="form-error" id="email-error" role="alert">
                {emailError}
              </span>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Inicia tu prueba gratis
            </button>
            <p className="form-disclaimer">
              Al registrarte aceptas nuestros{" "}
              <a href="#terminos">Términos de servicio</a> y{" "}
              <a href="#privacidad">Política de privacidad</a>.
            </p>
          </form>
        </div>
      </section>

      <SuccessModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

export default Signup;
