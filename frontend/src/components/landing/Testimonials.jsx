function Testimonials() {
  return (
    <section
      className="testimonials"
      id="testimonios"
      aria-labelledby="testimonials-title"
    >
      <div className="container">
        <header className="section-header section-header--center">
          <p className="section-tag">Lo dicen nuestros clientes</p>
          <h2 id="testimonials-title">
            Pymes bolivianas que ya optimizaron sus entregas
          </h2>
        </header>

        <div className="testimonials-grid">
          <blockquote className="testimonial-card">
            <div className="testimonial-stars" aria-label="5 de 5 estrellas">
              ★★★★★
            </div>
            <p className="testimonial-text">
              "Antes perdíamos 2 horas al día coordinando por WhatsApp. Con DeliveryTrack redujimos el tiempo promedio de entrega de 35 a 22 minutos y ahorramos casi Bs. 800 al mes en combustible."
            </p>
            <footer className="testimonial-author">
              <img
                src="/public/avatar-mariana.svg"
                alt=""
                width="48"
                height="48"
                className="testimonial-avatar"
              />
              <div>
                <cite className="testimonial-name">Mariana Quispe COÑOOOOO</cite>
                <span className="testimonial-role">Dueña · Sabor Paceño, La Paz</span>
              </div>
            </footer>
          </blockquote>

          <blockquote className="testimonial-card">
            <div className="testimonial-stars" aria-label="5 de 5 estrellas">
              ★★★★★
            </div>
            <p className="testimonial-text">
              "Como coordinador logístico, necesitaba ver dónde estaba cada moto en tiempo real. El panel administrativo nos dio el control que nunca tuvimos con planillas. Pasamos de 40 a 58 entregas diarias."
            </p>
            <footer className="testimonial-author">
              <img
                src="/avatar-carlos.svg"
                alt=""
                width="48"
                height="48"
                className="testimonial-avatar"
              />
              <div>
                <cite className="testimonial-name">Carlos Mendoza</cite>
                <span className="testimonial-role">Coordinador · DistriFarma CBBA</span>
              </div>
            </footer>
          </blockquote>

          <blockquote className="testimonial-card">
            <div className="testimonial-stars" aria-label="5 de 5 estrellas">
              ★★★★★
            </div>
            <p className="testimonial-text">
              "Lo mejor es que mis repartidores no tuvieron que instalar otra app. Abren el link en el celular, ven la ruta y listo. En dos semanas recuperamos la inversión del plan Pro."
            </p>
            <footer className="testimonial-author">
              <img
                src="/avatar-roberto.svg"
                alt=""
                width="48"
                height="48"
                className="testimonial-avatar"
              />
              <div>
                <cite className="testimonial-name">Roberto Sánchez</cite>
                <span className="testimonial-role">Gerente · Express SCZ Delivery</span>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
