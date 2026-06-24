function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#inicio" className="logo logo--footer">
            <img
              src="/public/logo-deliverytrack.svg"
              alt=""
              width="32"
              height="32"
              className="logo-icon"
            />
            <span className="logo-text">
              Delivery<span className="logo-accent">Track</span>
            </span>
          </a>
          <p className="footer-tagline">
            Optimización y seguimiento de entregas para pymes bolivianas.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Enlaces legales">
          <h3 className="footer-nav-title">Legal</h3>
          <ul>
            <li>
              <a href="#terminos" id="terminos">
                Términos de servicio
              </a>
            </li>
            <li>
              <a href="#privacidad" id="privacidad">
                Política de privacidad
              </a>
            </li>
            <li>
              <a href="#cookies">Política de cookies</a>
            </li>
          </ul>
        </nav>

        <nav className="footer-nav" aria-label="Enlaces de producto">
          <h3 className="footer-nav-title">Producto</h3>
          <ul>
            <li>
              <a href="#caracteristicas">Características</a>
            </li>
            <li>
              <a href="#precios">Precios</a>
            </li>
            <li>
              <a href="#registro">Prueba gratis</a>
            </li>
          </ul>
        </nav>

        <div className="footer-contact">
          <h3 className="footer-nav-title">Contacto</h3>
          <address>
            <p>Santa Cruz de la Sierra, Bolivia</p>
            <p>
              <a href="mailto:hola@deliverytrack.bo">hola@deliverytrack.bo</a>
            </p>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2026 DeliveryTrack. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
