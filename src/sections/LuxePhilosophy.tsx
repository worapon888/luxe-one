// src/sections/LuxePhilosophy.tsx
import { useRef } from "react";
import LuxeNav from "./LuxeNav";
import LuxeHero from "./LuxeHero";
import { useLuxePhilosophyAnimation } from "../hooks/useLuxePhilosophyAnimation";

import "../styles/LuxePhilosophy.css";
import "../styles/LuxeHero.css";

const LuxePage = () => {
  const rootRef = useRef<HTMLElement | null>(null);

  // hook จัดการ GSAP ทั้งหมด
  useLuxePhilosophyAnimation(rootRef);

  return (
    <section className="luxe-philosophy" ref={rootRef}>
      <LuxeNav />

      {/* GLOBAL INDICATOR */}
      <div className="philo-indicator">
        <div className="philo-indicator-track">
          <span className="philo-ind-item active">01</span>

          <div className="philo-ind-line">
            <span className="philo-ind-line-fill" />
          </div>

          <span className="philo-ind-item">02</span>

          <div className="philo-ind-line">
            <span className="philo-ind-line-fill" />
          </div>

          <span className="philo-ind-item">03</span>

          <div className="philo-ind-line">
            <span className="philo-ind-line-fill" />
          </div>

          <span className="philo-ind-item">04</span>
        </div>
      </div>

      <div className="philo-hero-container">
        {/* SLIDE 0 = HERO (ไม่มี bg-slide) */}
        <div className="philo-hero-image" id="slide-0">
          <LuxeHero />
        </div>

        {/* SLIDE 1–3 = BG IMAGES */}
        <div className="philo-hero-image bg-slide" id="slide-1">
          <img
            src="/images/LuxePhilosophy_img.png"
            className="philo-main-image"
            alt="Luxe.One Rouge Première"
          />
        </div>

        <div className="philo-hero-image bg-slide" id="slide-2">
          <img
            src="/images/LuxePhilosophy_img2.png"
            className="philo-main-image"
            alt="Luxe.One Rouge Première – Details"
          />
        </div>

        <div className="philo-hero-image bg-slide" id="slide-3">
          <img
            src="/images/hero_img.png"
            className="philo-main-image"
            alt="Luxe.One Rouge Première – Details"
          />
        </div>

        {/* TEXT LAYER */}
        <div className="philo-hero-content">
          <div className="philo-title-wrapper">
            <div className="philo-hero-title">
              <div className="philo-prefix">Developing</div>

              <div className="philo-postfix-outer">
                <div className="philo-postfix">
                  <div>Ideas</div>
                  <div>Essence</div>
                  <div>Ritual</div>
                </div>
              </div>
            </div>
          </div>

          {/* SUBTEXT STACK — ผูกกับ slide 1,2,3 */}
          <div className="philo-subtext-wrapper">
            <div className="philo-subtext-block">
              <p className="philo-subtext">
                Inspired by the artistry of fine fragrance, Rouge Première
                transforms raw ideas into a scent of depth, elegance, and modern
                sensuality — crafted to leave an unforgettable impression.
              </p>
            </div>

            <div className="philo-subtext-block">
              <p className="philo-subtext">
                From the first spark of imagination to the final whisper on
                skin, Rouge Première traces the journey from concept to pure
                essence — an intimate veil of red florals, warm amber, and
                luminous musk.
              </p>
            </div>

            <div className="philo-subtext-block">
              <p className="philo-subtext">
                As it settles, Rouge Première reveals its true character — a
                quiet, slow-burning warmth that feels instinctive. It lingers
                not as a fragrance, but as a presence: refined, intimate, and
                unmistakably personal.
              </p>
            </div>
          </div>
        </div>

        {/* CIRCLE LINK */}
        <div className="philo-link">
          <div className="philo-link-wrapper">
            <a href="#">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="300"
                height="300"
                viewBox="0 0 100 100"
              >
                <path
                  id="philo-link-svg"
                  d="M50,10 A40,40 0 1,1 49.9999,10"
                  stroke="#f9b165"
                  strokeWidth="0.75"
                  fill="none"
                />
              </svg>

              <div className="philo-link-label">
                <div className="philo-line philo-line-1">
                  <p>View</p>
                </div>
                <div className="philo-line philo-line-2">
                  <p>Product</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LuxePage;
