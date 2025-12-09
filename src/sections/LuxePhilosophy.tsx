// src/sections/LuxePhilosophy.tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";

import "../styles/LuxePhilosophy.css";

const LuxePhilosophy = () => {
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

    // กัน element หาย
    if (
      !slides.length ||
      !postfix ||
      !subtextBlocks.length ||
      !link ||
      !linkWrapper ||
      !path
    ) {
      return;
    }

    const totalSlides = slides.length; // ตอนนี้มี 2 สไลด์
    let currentIndex = 0;
    let isAnimating = false;
    let currentTopValue = 0;

    // ตั้งค่าเริ่มต้น slide
    slides.forEach((slide, idx) => {
      const img = slide.querySelector("img");
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

    // ตั้งค่าเริ่มต้น subtext-block (ให้เห็นแค่ของ slide แรก)
    subtextBlocks.forEach((block, idx) => {
      if (idx === 0) {
        gsap.set(block, { autoAlpha: 1, y: 0 });
      } else {
        gsap.set(block, { autoAlpha: 0, y: 20 });
      }
    });

    // ฟังก์ชันสลับสไลด์
    const showSlide = (nextIndex: number, direction: "up" | "down") => {
      if (isAnimating || nextIndex === currentIndex) return;
      isAnimating = true;

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[nextIndex];

      const currentImg = currentSlide.querySelector("img");
      const nextImg = nextSlide.querySelector("img");

      const currentBlock = subtextBlocks[currentIndex];
      const nextBlock = subtextBlocks[nextIndex];

      if (!currentImg || !nextImg || !currentBlock || !nextBlock) {
        isAnimating = false;
        return;
      }

      gsap.set(nextSlide, {
        clipPath:
          direction === "up"
            ? "polygon(0 0, 100% 0, 100% 0, 0 0)"
            : "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        zIndex: 2,
      });
      gsap.set(nextImg, { scale: 2, top: "4em" });
      gsap.set(currentSlide, { zIndex: 1 });

      // เลื่อน postfix (Ideas / Essence / ...) แบบ Codegrid
      const lineHeightTitle = window.innerWidth < 900 ? 42 : 150;
      const displayNumber = nextIndex + 1;
      currentTopValue = -(displayNumber - 1) * lineHeightTitle;

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(currentSlide, { zIndex: 0 });
          gsap.set(nextSlide, { zIndex: 1 });
          currentIndex = nextIndex;
          isAnimating = false;
        },
      });

      // เลื่อนคำ postfix ขึ้นลง
      tl.to(
        postfix,
        {
          y: currentTopValue,
          duration: 2,
          ease: "power4.inOut",
        },
        0
      );

      // subtext-block: fade out ของเก่า + fade in ของใหม่
      tl.to(
        currentBlock,
        {
          autoAlpha: 0,
          y: -20,
          duration: 0.5,
          ease: "power4.inOut", // ใช้ ease นุ่ม ๆ เท่ากับภาพ
        },
        0 // เริ่มพร้อมกับฉาก
      ).fromTo(
        nextBlock,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 1,
          ease: "power4.inOut",
        },
        0.01 // หรือจะให้ตามหลังนิดหน่อย (0–0.1 ได้)
      );

      // วงกลมวิ่งรอบ
      tl.add(animateCircle(path), 0);

      // ภาพเข้าออก
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

    // วงกลม CTA follow เมาส์
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

    // ตั้งค่า stroke วงกลมเริ่มต้น
    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: 0,
      rotation: -90,
      transformOrigin: "center center",
    });

    // event
    window.addEventListener("wheel", onWheel, { passive: true });
    link.addEventListener("mousemove", onMove);
    link.addEventListener("mouseleave", onLeave);

    gsap.set(linkWrapper, {
      x: 0,
      y: 0,
      xPercent: -50,
      yPercent: -50,
    });

    return () => {
      window.removeEventListener("wheel", onWheel);
      link.removeEventListener("mousemove", onMove);
      link.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section className="luxe-philosophy" ref={rootRef}>
      <div className="philo-hero-container">
        {/* BACKGROUND SLIDES */}
        <div className="philo-hero-image" id="slide-1">
          <img
            src="/images/LuxePhilosophy_img.png"
            alt="Luxe.One Rouge Première"
          />
        </div>
        <div className="philo-hero-image" id="slide-2">
          <img
            src="/images/LuxePhilosophy_img2.png"
            alt="Luxe.One Rouge Première – Details"
          />
        </div>
        <div className="philo-hero-image" id="slide-3">
          <img
            src="/images/hero_img.png"
            alt="Luxe.One Rouge Première – Details"
          />
        </div>

        {/* TEXT LAYER */}
        <div className="philo-hero-content">
          <div className="philo-title-wrapper">
            <div className="philo-hero-title">
              <div className="philo-prefix">Developing</div>

              {/* เพิ่ม outer wrapper */}
              <div className="philo-postfix-outer">
                <div className="philo-postfix">
                  <div>Ideas</div>
                  <div>Essence</div>
                  <div>Ritual</div>
                </div>
              </div>
            </div>
          </div>

          {/* SUBTEXT STACK: 1 block ต่อสไลด์ */}
          <div className="philo-subtext-wrapper">
            {/* BLOCK ของ slide 1 */}
            <div className="philo-subtext-block">
              <p className="philo-subtext">
                Inspired by the artistry of fine fragrance, Rouge Première
                transforms raw ideas into a scent of depth, elegance, and modern
                sensuality — crafted to leave an unforgettable impression.
              </p>
            </div>

            {/* BLOCK ของ slide 2 */}
            <div className="philo-subtext-block">
              <p className="philo-subtext">
                From the first spark of imagination to the final whisper on
                skin, Rouge Première traces the journey from concept to pure
                essence — an intimate veil of red florals, warm amber, and
                luminous musk.
              </p>
            </div>
            {/* BLOCK ของ slide 3 */}
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

export default LuxePhilosophy;
