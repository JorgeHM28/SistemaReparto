const FEATURE_IMAGES = [
  { src: "/illustration-feature-admin.svg", alt: "Panel administrador con mapa y estadísticas" },
  { src: "/illustration-feature-repartidor.svg", alt: "Vista móvil del repartidor con ruta sugerida" },
  { src: "/illustration-feature-geo.svg", alt: "Geolocalización GPS en tiempo real" },
  { src: "/illustration-feature-realtime.svg", alt: "Monitoreo sincronizado en tiempo real" },
];

function Features() {
  const cards = [
    {
      number: "01",
      icon: (
        <svg viewBox="0 0 40 40" fill="none">
          <rect x="4" y="6" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M4 14h32" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="22" r="2" fill="currentColor" />
          <circle cx="20" cy="22" r="2" fill="currentColor" />
          <circle cx="28" cy="22" r="2" fill="currentColor" />
        </svg>
      ),
      title: "Módulo Administrador",
      text: "Gestión centralizada de pedidos y visualización de repartidores activos en un mapa interactivo. Asigna entregas, filtra por zona y controla el estado de cada pedido desde un solo panel.",
    },
    {
      number: "02",
      icon: (
        <svg viewBox="0 0 40 40" fill="none">
          <rect x="12" y="2" width="16" height="36" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M16 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 10h12M14 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      title: "Módulo Repartidor",
      text: "Interfaz móvil simple para que tus motociclistas vean rutas sugeridas basadas en OpenStreetMap y Leaflet. Sin apps nativas: abren el navegador y listo.",
    },
    {
      number: "03",
      icon: (
        <svg viewBox="0 0 40 40" fill="none">
          <path d="M20 4C13.4 4 8 9.4 8 16c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" stroke="currentColor" strokeWidth="2" />
          <circle cx="20" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      title: "Geolocalización Integrada",
      text: "Captura de coordenadas GPS mediante la API nativa del navegador. Ubicación precisa de cada repartidor sin hardware adicional ni costos extra de rastreo.",
    },
    {
      number: "04",
      icon: (
        <svg viewBox="0 0 40 40" fill="none">
          <path d="M6 20c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 6v8l5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="20" r="3" fill="currentColor" />
          <path d="M8 28l-2 6 6-2M32 28l2 6-6-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Monitoreo en Tiempo Real",
      text: "Sincronización instantánea mediante WebSockets sin recargar el navegador. Cada cambio de estado, nueva ubicación o pedido asignado se refleja al instante para todo el equipo.",
    },
  ];

  return (
    <section
      className="features"
      id="caracteristicas"
      aria-labelledby="features-title"
    >
      <div className="container">
        <header className="section-header section-header--center">
          <p className="section-tag">Funcionalidades clave</p>
          <h2 id="features-title">Todo lo que necesitas para dominar tus entregas</h2>
          <p className="section-desc">
            Cuatro módulos integrados que trabajan juntos para transformar tu operación logística desde el primer día.
          </p>
        </header>

        <div className="features-grid">
          {cards.map((card, index) => (
            <article key={card.number} className="feature-card">
              <div className="feature-number" aria-hidden="true">{card.number}</div>
              <img
                src={FEATURE_IMAGES[index].src}
                alt={FEATURE_IMAGES[index].alt}
                className="feature-illustration"
                width="200"
                height="140"
                loading="lazy"
              />
              <div className="feature-icon" aria-hidden="true">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
