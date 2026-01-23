// src/sections/LuxeHero.tsx

import "../styles/LuxeHero.css";

const LuxeHero = () => {
  return (
    <>
      {/* ======================= HERO SECTION ======================= */}
      <section className="luxe-hero">
        {/* LEFT CONTENT */}
        <div className="hero-left">
          <h4 className="hero-kicker">LIMITED EDITION</h4>

          <h1 className="hero-title">
            THE RED <span>N°5</span>
          </h1>

          <p className="hero-description">
            What color could be combined with the power of No.5? The symbol of a
            visionary spirit: Red. The color of life. The color of blood.
            According to Mademoiselle.
          </p>

          <div className="hero-notes">
            <div className="note-item">
              <img src="/images/Jasmine-hero.png" alt="Jasmine note" />
              <p>
                Jasmine <br /> Middle Notes
              </p>
            </div>

            <div className="note-item">
              <img src="/images/Rose-hero.png" alt="Rose note" />
              <p>
                Rose <br /> Middle Notes
              </p>
            </div>

            <div className="note-item">
              <img src="/images/Woody-hero.png" alt="Woody note" />
              <p>
                Woody <br /> Base Notes
              </p>
            </div>
          </div>

          <button className="hero-cta">DISCOVER</button>
        </div>

        {/* PERFUME BOTTLE */}

        <div className="product-hero">
          <div className="hero-product-wrap">
            <img
              src="/images/product1.png"
              className="hero-product philo-main-image"
              alt="Red Edition Perfume"
            />
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="hero-right">
          {/* BG FABRIC */}
          <div className="fabric-bg" />
        </div>
      </section>
    </>
  );
};

export default LuxeHero;
