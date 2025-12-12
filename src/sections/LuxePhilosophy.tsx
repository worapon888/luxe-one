// src/sections/LuxePhilosophy.tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
import LuxeNav from "./LuxeNav";
import LuxeHero from "./LuxeHero";
import "../styles/LuxePhilosophy.css";
import "../styles/LuxeHero.css";

const LuxePage = () => {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const slides = Array.from(
      root.querySelectorAll<HTMLElement>(".philo-hero-image")
    );
    const postfix = root.querySelector<HTMLElement>(".philo-postfix");
    const subtextBlocks = Array.from(
      root.querySelectorAll<HTMLElement>(".philo-subtext-block")
    );
    const link = root.querySelector<HTMLElement>(".philo-link");
    const linkWrapper = root.querySelector<HTMLElement>(".philo-link-wrapper");
    const path = root.querySelector<SVGPathElement>("#philo-link-svg");
    const contentWrapper = root.querySelector<HTMLElement>(
      ".philo-hero-content"
    );

    if (
      !slides.length ||
      !postfix ||
      !subtextBlocks.length ||
      !link ||
      !linkWrapper ||
      !path ||
      !contentWrapper
    ) {
      return;
    }

    const totalSlides = slides.length; // 4: [0 = hero, 1,2,3 = bg images]
    let currentIndex = 0;
    let isAnimating = false;
    let currentTopValue = 0;

    // helper: map slideIndex -> contentIndex (-1 = ไม่มี subtext)
    const getContentIndex = (slideIndex: number) => slideIndex - 1; // 1 -> 0, 2 -> 1, 3 -> 2

    // ตั้งค่าเริ่มต้น slide
    slides.forEach((slide, idx) => {
      const img = slide.querySelector<HTMLElement>(".philo-main-image");
      if (!img) return;

      if (idx === 0) {
        gsap.set(slide, {
          zIndex: 1,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        });
        gsap.set(img, { scale: 1, top: "0" });
      } else {
        gsap.set(slide, {
          zIndex: 0,
          clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        });
        gsap.set(img, { scale: 2, top: "4em" });
      }
    });

    // ซ่อน hero-content ตอนเริ่ม (เพราะ slide 0 = hero, ไม่มี text)
    gsap.set(contentWrapper, { autoAlpha: 0 });
    gsap.set(link, { autoAlpha: 0 });
    // ตั้งค่า subtext เริ่มต้น: ซ่อนทุก block
    subtextBlocks.forEach((block) => {
      gsap.set(block, { autoAlpha: 0, y: 20 });
    });

    const showSlide = (nextIndex: number, direction: "up" | "down") => {
      if (isAnimating || nextIndex === currentIndex) return;
      isAnimating = true;

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[nextIndex];
      const shouldShowLinkNext = nextIndex >= 2; // index 2–3 = slide 3–4
      const isLinkVisibleNow = currentIndex >= 2;

      const currentImg =
        currentSlide.querySelector<HTMLElement>(".philo-main-image");
      const nextImg = nextSlide.querySelector<HTMLElement>(".philo-main-image");

      const currentContentIndex = getContentIndex(currentIndex);
      const nextContentIndex = getContentIndex(nextIndex);

      const currentBlock =
        currentContentIndex >= 0 ? subtextBlocks[currentContentIndex] : null;
      const nextBlock =
        nextContentIndex >= 0 ? subtextBlocks[nextContentIndex] : null;

      if (!currentImg || !nextImg) {
        isAnimating = false;
        return;
      }

      // 👉 เลือก slide ที่อยากให้ตัวหนังสือขึ้นช้าลง (slide 2 & 4)
      const isSlowTextSlide = nextIndex === 1 || nextIndex === 3;
      const textDelay = isSlowTextSlide ? 0.8 : 0; // หน่วงเวลาเริ่ม text
      const textDuration = isSlowTextSlide ? 2.0 : 1.1; // ยืด duration ให้ลื่นช้าๆ

      gsap.set(nextSlide, {
        clipPath:
          direction === "up"
            ? "polygon(0 0, 100% 0, 100% 0, 0 0)"
            : "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        zIndex: 2,
      });
      gsap.set(nextImg, { scale: 2, top: "4em" });
      gsap.set(currentSlide, { zIndex: 1 });

      const lineHeightTitle = window.innerWidth < 900 ? 42 : 150;

      // postfix index: slide 1 -> 0 (Ideas), 2 -> 1 (Essence), 3 -> 2 (Ritual)
      const postfixIndex = Math.max(nextIndex - 1, 0);
      currentTopValue = -postfixIndex * lineHeightTitle;

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(currentSlide, { zIndex: 0 });
          gsap.set(nextSlide, { zIndex: 1 });
          currentIndex = nextIndex;
          isAnimating = false;
        },
      });

      // ✨ logic แสดง/ซ่อน hero-content
      if (currentIndex === 0 && nextIndex !== 0) {
        // จาก hero → slide 1/2/3: fade-in text แต่เริ่มช้าลงถ้าเป็น slide 2 หรือ 4
        tl.fromTo(
          contentWrapper,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: textDuration,
            ease: "power2.out",
          },
          textDelay // 🔥 จากเดิม 0
        );
      } else if (nextIndex === 0) {
        // กลับไป hero: fade-out text
        tl.to(
          contentWrapper,
          {
            autoAlpha: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          0
        );
      }
      // ✨ logic แสดง/ซ่อน hero-content
      if (currentIndex === 0 && nextIndex !== 0) {
        // จาก hero → slide 1/2/3
        tl.fromTo(
          contentWrapper,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: textDuration,
            ease: "power2.out",
          },
          textDelay
        );
      } else if (nextIndex === 0) {
        // กลับไป hero: fade-out text
        tl.to(
          contentWrapper,
          {
            autoAlpha: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          0
        );
      }

      /* 🔵 วงกลม CTA – แสดงเฉพาะ slide index 2–3 (เลข 03–04 ทางขวา)
   - hero (0) และ slide 1 (01) = ซ่อน
   - slide 2–3 (02–03) = โผล่
*/
      if (!isLinkVisibleNow && shouldShowLinkNext) {
        // จาก slide ที่ไม่มี → มีวงกลม
        tl.fromTo(
          link,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.8,
            ease: "power2.out",
          },
          textDelay + 0.3 // ดีเลย์ตาม text นิดหน่อย
        );
      } else if (isLinkVisibleNow && !shouldShowLinkNext) {
        // จาก slide ที่มีวงกลม → ไป slide ที่ไม่ควรมี
        tl.to(
          link,
          {
            autoAlpha: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          0
        );
      }

      // เลื่อน postfix (Ideas / Essence / Ritual) ให้ sync กับ textDelay ด้วย
      tl.to(
        postfix,
        {
          y: currentTopValue,
          duration: isSlowTextSlide ? 2.4 : 2, // จะให้ยืดเวลานิดนึงก็ได้
          ease: "power4.inOut",
        },
        textDelay
      );

      // subtext: ทำเฉพาะ slide 1–3
      if (currentBlock) {
        tl.to(
          currentBlock,
          {
            autoAlpha: 0,
            y: -20,
            duration: 0.8,
            ease: "power4.inOut",
          },
          textDelay // ให้ fade-out เริ่มช้าตาม textDelay
        );
      }

      if (nextBlock) {
        tl.fromTo(
          nextBlock,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: isSlowTextSlide ? 1.4 : 0.8,
            ease: "power4.inOut",
          },
          textDelay + 0.1 // ตามหลังนิดหน่อย
        );
      }

      // วงกลม CTA
      tl.add(animateCircle(path), 0);

      // BG images
      tl.to(
        currentImg,
        {
          scale: 2,
          top: "4em",
          duration: 2,
          ease: "power3.inOut",
        },
        0
      )
        .to(
          nextSlide,
          {
            clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
            duration: 2,
            ease: "power4.inOut",
          },
          0
        )
        .to(
          nextImg,
          {
            scale: 1,
            top: "0",
            duration: 2,
            ease: "power3.inOut",
          },
          0
        );
    };

    const onWheel = (e: WheelEvent) => {
      if (isAnimating) return;
      if (e.deltaY > 0) {
        const next = (currentIndex + 1) % totalSlides;
        showSlide(next, "down");
      } else if (e.deltaY < 0) {
        const next = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(next, "up");
      }
    };

    // วงกลม CTA follow mouse
    const xTo = gsap.quickTo(linkWrapper, "x", {
      duration: 0.4,
      ease: "power3",
    });
    const yTo = gsap.quickTo(linkWrapper, "y", {
      duration: 0.4,
      ease: "power3",
    });

    const onMove = (e: MouseEvent) => {
      const rect = link.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      xTo(relX * 0.5);
      yTo(relY * 0.5);
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: 0,
      rotation: -90,
      transformOrigin: "center center",
    });

    // ใช้ root แทน window
    root.addEventListener("wheel", onWheel, { passive: true });
    link.addEventListener("mousemove", onMove);
    link.addEventListener("mouseleave", onLeave);

    gsap.set(linkWrapper, {
      x: 0,
      y: 0,
      xPercent: -50,
      yPercent: -50,
    });

    return () => {
      root.removeEventListener("wheel", onWheel);
      link.removeEventListener("mousemove", onMove);
      link.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <section className="luxe-philosophy" ref={rootRef}>
        <div className="logo">LUXE.ONE</div>
        <LuxeNav />
        {/* GLOBAL INDICATOR */}
        <div className="philo-indicator">
          <span className="philo-ind-item active">01</span>
          <div className="philo-ind-line"></div>

          <span className="philo-ind-item">02</span>
          <div className="philo-ind-line"></div>

          <span className="philo-ind-item">03</span>
          <div className="philo-ind-line"></div>

          <span className="philo-ind-item">04</span>
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

          {/* TEXT LAYER (ใช้ร่วมกันสำหรับ slide 1–3 เท่านั้น) */}
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
                  transforms raw ideas into a scent of depth, elegance, and
                  modern sensuality — crafted to leave an unforgettable
                  impression.
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
    </>
  );
};

function animateCircle(path: SVGPathElement) {
  const length = path.getTotalLength();
  const tl = gsap.timeline();

  tl.set(path, {
    strokeDashoffset: 0,
    strokeDasharray: length,
    scale: 1,
  })
    .to(path, {
      strokeDashoffset: -length,
      duration: 1,
      ease: "power2.inOut",
    })
    .set(path, {
      strokeDashoffset: length,
    })
    .to(path, {
      strokeDashoffset: 0,
      duration: 1,
      ease: "power2.inOut",
    });

  return tl;
}

export default LuxePage;
