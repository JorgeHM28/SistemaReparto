function Pricing() {
  return (
    <section className="pricing" id="precios" aria-labelledby="pricing-title">
      <div className="container">
        <header className="section-header section-header--center">
          <p className="section-tag">Planes adaptados al mercado</p>
          <h2 id="pricing-title">Invierte en control, ahorra en combustible</h2>
          <p className="section-desc">
            Precios pensados para emprendedores y empresas en crecimiento en Bolivia. Sin contratos largos ni sorpresas.
          </p>
        </header>

        <div className="pricing-grid">
          <article className="pricing-card">
            <header className="pricing-card-header">
              <h3>Plan Emprendedor</h3>
              <p className="pricing-tagline">Ideal para empezar</p>
            </header>
            <div className="pricing-amount">
              <span className="pricing-currency">Bs.</span>
              <span className="pricing-value">0</span>
              <span className="pricing-period">/mes</span>
            </div>
            <p className="pricing-desc">
              Freemium para negocios que están dando sus primeros pasos en delivery organizado.
            </p>
            <ul className="pricing-features">
              <li>Hasta 3 repartidores simultáneos</li>
              <li>50 pedidos por mes</li>
              <li>Mapa interactivo básico</li>
              <li>Rutas sugeridas con OSM</li>
              <li>Soporte por correo (48 h)</li>
            </ul>
            <a href="#registro" className="btn btn-outline btn-block">
              Comenzar gratis
            </a>
          </article>

          <article className="pricing-card pricing-card--featured">
            <span className="pricing-badge">Más popular</span>
            <header className="pricing-card-header">
              <h3>Plan Empresa Pro</h3>
              <p className="pricing-tagline">Para operaciones en crecimiento</p>
            </header>
            <div className="pricing-amount">
              <span className="pricing-currency">Bs.</span>
              <span className="pricing-value">349</span>
              <span className="pricing-period">/mes</span>
            </div>
            <p className="pricing-desc">
              Control total de flota con soporte prioritario y capacidad ampliada para escalar.
            </p>
            <ul className="pricing-features">
              <li>Hasta 20 repartidores simultáneos</li>
              <li>Pedidos ilimitados</li>
              <li>Monitoreo WebSocket en tiempo real</li>
              <li>Historial y reportes de rutas</li>
              <li>Soporte prioritario por WhatsApp</li>
              <li>Onboarding personalizado</li>
            </ul>
            <a href="#registro" className="btn btn-primary btn-block">
              Iniciar prueba Pro
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
