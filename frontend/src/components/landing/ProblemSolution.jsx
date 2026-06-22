function ProblemSolution() {
  return (
    <section
      className="problem-solution"
      id="problema"
      aria-labelledby="problema-title"
    >
      <div className="container">
        <header className="section-header">
          <p className="section-tag">El reto diario</p>
          <h2 id="problema-title">¿Tu operación de delivery sigue en el caos?</h2>
        </header>

        <div className="ps-grid">
          <article className="ps-card ps-card--problem">
            <div className="ps-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="10" width="36" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M14 18h20M14 24h14M14 30h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M38 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>El problema</h3>  
            <p>
              Miles de pymes en La Paz, Cochabamba y Santa Cruz administran sus entregas de forma manual: planillas de papel, llamadas constantes y mensajes sueltos de WhatsApp que se pierden entre decenas de chats.
            </p>
            <ul className="ps-list">
              <li>Retrasos por rutas improvisadas y falta de coordinación</li>
              <li>Gastos excesivos de combustible por recorridos duplicados</li>
              <li>Incertidumbre total: no sabes dónde está cada motociclista</li>
              <li>Clientes insatisfechos que no reciben actualizaciones</li>
            </ul>
          </article>

          <article className="ps-card ps-card--solution">
            <div className="ps-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
                <circle cx="24" cy="24" r="4" fill="currentColor" />
                <path d="M24 6v6M24 36v6M6 24h6M36 24h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 12l4 4M32 32l4 4M32 12l-4 4M16 32l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>La solución: DeliveryTrack</h3>
            <p>
              Una centralización web interactiva con mapas en vivo que elimina la falta de visibilidad operativa. Desde un solo panel ves pedidos, repartidores y rutas optimizadas — todo desde el navegador, sin instalar nada pesado en los celulares de tu flota.
            </p>
            <ul className="ps-list ps-list--check">
              <li>Visibilidad total de tu operación en un mapa centralizado</li>
              <li>Rutas calculadas automáticamente para ahorrar combustible</li>
              <li>Comunicación ordenada entre coordinador y motociclistas</li>
              <li>Decisiones basadas en datos, no en suposiciones</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

export default ProblemSolution;
