import { useEffect, useRef } from "react";

function SuccessModal({ isOpen, onClose }) {
  const closeButtonRef = useRef(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      lastFocusedRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      lastFocusedRef.current?.focus?.();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="landing-modal-overlay is-visible"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-hidden="false"
      onClick={handleOverlayClick}
    >
      <div className="landing-modal-content">
        <button
          type="button"
          className="landing-modal-close"
          ref={closeButtonRef}
          aria-label="Cerrar ventana de confirmación"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <img
          src="/img/registro-exito.svg"
          alt="Ilustración de registro exitoso en DeliveryTrack"
          className="landing-modal-image"
          width="200"
          height="160"
        />
        <h2 id="modal-title" className="landing-modal-title">
          ¡Bienvenido a DeliveryTrack!
        </h2>
        <p className="landing-modal-text">
          Gracias por registrarte. Tu acceso de prueba está listo — revisa tu bandeja de entrada para activar tu cuenta y comenzar a optimizar tus entregas hoy mismo.
        </p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}

export default SuccessModal;
