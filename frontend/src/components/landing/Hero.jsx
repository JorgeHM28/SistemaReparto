import {Link} from "react-router-dom";

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-content">
          <p className="hero-badge">SaaS logístico · Bolivia</p>
          <h1 id="hero-title" className="hero-title">
            Optimiza tus rutas de reparto y reduce costos de combustible en tiempo real
          </h1>
          <p className="hero-subtitle">
            La plataforma SaaS diseñada para pymes bolivianas que centraliza tus pedidos, calcula rutas eficientes y rastrea a tus motociclistas sin necesidad de instalar aplicaciones pesadas.
          </p>
          <div className="hero-actions">
            <Link to="/register">
              <a  className="btn btn-primary">
              Inicia prueba gratis 👤
            </a>
            </Link>
          <Link to="/login">
            <a  className="btn btn-ghost">
              Logueate ➡️
            </a>
          </Link>

          </div>
          <ul className="hero-stats" aria-label="Indicadores clave">
            <li>
              <strong>−32%</strong>
              <span>Combustible</span>
            </li>
            <li>
              <strong>+48%</strong>
              <span>Entregas/día</span>
            </li>
            <li>
              <strong>100%</strong>
              <span>Web, sin apps</span>
            </li>
          </ul>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="mockup-frame">
            <div className="mockup-toolbar">
              <span className="mockup-dot mockup-dot--red"></span>
              <span className="mockup-dot mockup-dot--yellow"></span>
              <span className="mockup-dot mockup-dot--green"></span>
              <span className="mockup-url">app.deliverytrack.bo/panel</span>
            </div>
            <div className="mockup-body">
              <aside className="mockup-sidebar">
                <div className="mockup-sidebar-item mockup-sidebar-item--active"></div>
                <div className="mockup-sidebar-item"></div>
                <div className="mockup-sidebar-item"></div>
                <div className="mockup-sidebar-item"></div>
              </aside>
              <div className="mockup-main">
                <div className="mockup-map">
                  <img
                    src="/mockup-mapa.svg"
                    alt=""
                    className="mockup-map-img"
                  />
                  <span className="mockup-pin mockup-pin--1" aria-hidden="true"></span>
                  <span className="mockup-pin mockup-pin--2" aria-hidden="true"></span>
                  <span className="mockup-pin mockup-pin--3" aria-hidden="true"></span>
                  <span className="mockup-route" aria-hidden="true"></span>
                </div>
                <div className="mockup-cards">
                  <div className="mockup-card">
                    <span className="mockup-card-label">Pedidos activos</span>
                    <span className="mockup-card-value">24</span>
                  </div>
                  <div className="mockup-card">
                    <span className="mockup-card-label">Repartidores</span>
                    <span className="mockup-card-value">8</span>
                  </div>
                  <div className="mockup-card mockup-card--highlight">
                    <span className="mockup-card-label">Tiempo prom.</span>
                    <span className="mockup-card-value">18 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
