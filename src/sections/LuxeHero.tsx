// src/sections/LuxeHero.tsx
import { useEffect } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "../styles/LuxeHero.css";

const LuxeHero = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("hop", ".87,0,.13,1");

    /* ================================
     LENIS
  ================================= */
    const lenis = new Lenis();

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    /* ================================
     SELECT ELEMENTS
  ================================= */
    const textContainers = document.querySelectorAll<HTMLElement>(".menu-col");
    const menuToggleBtn =
      document.querySelector<HTMLElement>(".menu-toggle-btn");
    const menuOverlay = document.querySelector<HTMLElement>(".menu-overlay");
    const menuOverlayContainer = document.querySelector<HTMLElement>(
      ".menu-overlay-content"
    );
    const menuMediaWrapper = document.querySelector<HTMLElement>(
      ".menu-media-wrapper"
    );

    const menuToggleLabel = document.querySelector<HTMLElement>(
      ".menu-toggle-label p"
    );
    const hamburgerIcon = document.querySelector<HTMLElement>(
      ".menu-hamburger-icon"
    );
    const container = document.querySelector<HTMLElement>(".luxe-hero");

    // ถ้า element สำคัญหาย ให้หยุด effect ไปเลยกัน error
    if (
      !menuToggleBtn ||
      !menuOverlay ||
      !menuOverlayContainer ||
      !menuMediaWrapper ||
      !menuToggleLabel ||
      !hamburgerIcon ||
      !container
    ) {
      return () => {
        cancelAnimationFrame(rafId);

        lenis.destroy?.();
      };
    }

    /* ================================
     SPLIT TEXT TYPES
  ================================= */
    type SplitLinesResult = {
      lines: HTMLElement[];
    };

    const splitTextByContainer: SplitLinesResult[][] = [];

    textContainers.forEach((col) => {
      const textElements = col.querySelectorAll<HTMLElement>("a, p");
      const containerSplits: SplitLinesResult[] = [];

      textElements.forEach((element) => {
        const split = SplitText.create(element, {
          type: "lines",
          linesClass: "line",
        }) as unknown as SplitLinesResult; // 👈 ตรงนี้

        containerSplits.push(split);
        gsap.set(split.lines, { y: "-110%" });
      });

      splitTextByContainer.push(containerSplits);
    });

    /* ================================
     MENU TOGGLE LOGIC
  ================================= */
    let isMenuOpen = false;
    let isAnimating = false;

    const handleToggle = () => {
      if (isAnimating) return;

      if (!isMenuOpen) {
        // OPEN
        isAnimating = true;
        lenis.stop();

        const tl = gsap.timeline();

        tl.to(menuToggleLabel, {
          y: "-110%",
          duration: 1,
          ease: "hop",
        })
          .to(container, { y: "100svh", duration: 1, ease: "hop" }, "<")
          .to(
            menuOverlay,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 1,
              ease: "hop",
            },
            "<"
          )
          .to(
            menuOverlayContainer,
            { yPercent: 0, duration: 1, ease: "hop" },
            "<"
          )
          .to(
            menuMediaWrapper,
            {
              opacity: 1,
              duration: 0.75,
              ease: "power2.out",
              delay: 0.5,
            },
            "<"
          );

        // Animate text lines
        splitTextByContainer.forEach((containerSplits) => {
          const copyLines = containerSplits.flatMap((split) => split.lines);
          tl.to(
            copyLines,
            {
              y: "0%",
              duration: 2,
              ease: "hop",
              stagger: -0.075,
            },
            -0.15
          );
        });

        hamburgerIcon.classList.add("active");
        tl.call(() => {
          isAnimating = false;
        });

        isMenuOpen = true;
      } else {
        // CLOSE
        isAnimating = true;
        hamburgerIcon.classList.remove("active");

        const tl = gsap.timeline();

        tl.to(container, {
          y: "0svh",
          duration: 1,
          ease: "hop",
        })
          .to(
            menuOverlay,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              duration: 1,
              ease: "hop",
            },
            "<"
          )
          .to(
            menuOverlayContainer,
            { yPercent: -50, duration: 1, ease: "hop" },
            "<"
          )
          .to(
            menuToggleLabel,
            {
              y: "0%",
              duration: 1,
              ease: "hop",
            },
            "<"
          );

        tl.call(() => {
          // reset split text positions
          splitTextByContainer.forEach((containerSplits) => {
            const copyLines = containerSplits.flatMap((split) => split.lines);
            gsap.set(copyLines, { y: "-110%" });
          });

          gsap.set(menuMediaWrapper, { opacity: 0 });

          lenis.start();
          isAnimating = false;
        });

        isMenuOpen = false;
      }
    };

    menuToggleBtn.addEventListener("click", handleToggle);

    /* ================================
     CLEANUP
  ================================= */
    return () => {
      menuToggleBtn.removeEventListener("click", handleToggle);
      cancelAnimationFrame(rafId);

      lenis.destroy?.();
    };
  }, []);

  return (
    <>
      {/* ======================= NAV ======================= */}
      <nav className="menu-nav">
        <div className="menu-bar">
          <div className="menu-toggle-btn">
            <div className="menu-toggle-label">
              <p>Menu</p>
            </div>
            <div className="menu-hamburger-icon">
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <div className="menu-overlay">
          <div className="menu-overlay-content">
            <div className="menu-media-wrapper">
              <img src="images/product_nav2.png" alt="Menu Background" />
            </div>

            <div className="menu-content-wrapper">
              <div className="menu-content-main">
                {/* LEFT COLUMN — MAIN NAV */}
                <div className="menu-col">
                  <div className="menu-link">
                    <a href="#">Home</a>
                  </div>
                  <div className="menu-link">
                    <a href="#">Fragrances</a>
                  </div>
                  <div className="menu-link">
                    <a href="#">Limited Editions</a>
                  </div>
                  <div className="menu-link">
                    <a href="#">The Story</a>
                  </div>
                  <div className="menu-link">
                    <a href="#">Boutique</a>
                  </div>
                </div>

                {/* RIGHT COLUMN — TAGS / BRAND PILLARS */}
                <div className="menu-col">
                  <div className="menu-tag">
                    <a href="#">The Red N°5</a>
                  </div>
                  <div className="menu-tag">
                    <a href="#">Rouge Première</a>
                  </div>
                  <div className="menu-tag">
                    <a href="#">Eau de Parfum</a>
                  </div>
                  <div className="menu-tag">
                    <a href="#">Gifts & Sets</a>
                  </div>
                </div>
              </div>

              {/* FOOTER — BRAND LOCATION / CONTACT */}
              <div className="menu-footer">
                <div className="menu-col">
                  <p>Paris, France</p>
                </div>
                <div className="menu-col">
                  <p>luxe.one</p>
                  <p>contact@luxe.one</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ======================= HERO SECTION ======================= */}
      <section className="luxe-hero">
        {/* LOGO (Hero Logo) */}
        <div className="logo">LUXE.ONE</div>

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
          <img
            src="/images/product1.png"
            className="hero-product"
            alt="Red Edition Perfume"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="hero-right">
          {/* BG FABRIC */}
          <div className="fabric-bg" />

          {/* INDICATOR */}
          <div className="hero-indicator">
            <span className="indicator active">01</span>
            <div className="indicator-vline"></div>

            <span className="indicator">02</span>
            <div className="indicator-vline"></div>

            <span className="indicator">03</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default LuxeHero;
