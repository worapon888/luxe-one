import { useEffect, useRef } from "react";
import gsap from "gsap";
import LuxePage from "./LuxePhilosophy";
import "./../styles/LuxePreloader.css";

export default function LuxePreloader() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const page = root.querySelector<HTMLElement>(".luxe-page");
      const loader = root.querySelector<HTMLElement>(".loader");

      if (!page || !loader) return;

      /* ---------------- initial states ---------------- */
      gsap.set(page, {
        opacity: 0,
        scale: 1.01,
        filter: "blur(6px)", // 👈 เบาลง เพื่อไม่ให้ veil ขาว
      });

      gsap.set(".clip-top, .clip-bottom", { height: "33.3vh" });
      gsap.set(".marquee", { top: "200%" });

      const tl = gsap.timeline({ defaults: { ease: "power4.inOut" } });

      /* ---------------- loader animation (เดิม) ---------------- */
      tl.from(".clip-top, .clip-bottom", {
        duration: 2,
        delay: 1,
        height: "50vh",
      });

      tl.to(".marquee", { duration: 3.5, top: "50%" }, 0.75);

      tl.from(
        ".clip-top .marquee, .clip-bottom .marquee",
        { duration: 5, left: "100%", ease: "power3.inOut" },
        1
      );

      tl.from(
        ".clip-center .marquee",
        { duration: 5, left: "-50%", ease: "power3.inOut" },
        1
      );

      tl.to(".clip-top", { duration: 2, clipPath: "inset(0 0 100% 0)" }, 6);
      tl.to(".clip-bottom", { duration: 2, clipPath: "inset(100% 0 0 0)" }, 6);

      tl.to(
        ".clip-top .marquee, .clip-bottom .marquee, .clip-center .marquee span",
        { duration: 1, opacity: 0, ease: "power2.inOut" },
        6
      );

      /* =========================================================
         ✅ SOFT CROSS DISSOLVE (NO WHITE FLASH, LUXE FEEL)
         ========================================================= */

      const handoffAt = 7;

      // 🔑 ปิด blend ก่อน dissolve (สำคัญที่สุด)
      tl.add(() => {
        loader.classList.add("is-dissolving");
      }, handoffAt - 0.25);

      // page โผล่มาก่อน แบบ veil มืดนุ่ม ๆ
      tl.to(
        page,
        {
          duration: 1,
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          ease: "sine.out",
        },
        handoffAt
      );

      // loader ละลายตามหลัง (ไม่มี flash)
      tl.to(
        loader,
        {
          duration: 1,
          autoAlpha: 0,
          scale: 1.015,
          ease: "sine.inOut",
          pointerEvents: "none",
        },
        handoffAt + 0.12
      );

      // เอา loader ออกจริง ๆ
      tl.set(loader, { display: "none" }, handoffAt + 1.8);
    }, root);

    return () => ctx.revert();
  }, []);

  const tokens = Array.from({ length: 12 }, () => ". Luxe.one");

  return (
    <div ref={rootRef} className="luxe-preload-root">
      {/* page ใต้ loader */}
      <div className="luxe-page">
        <LuxePage />
      </div>

      {/* loader */}
      <div className="loader" aria-hidden="true">
        <div className="loader-clip clip-top">
          <div className="marquee">
            <div className="marquee-container">
              {tokens.map((t, i) => (
                <span key={`top-${i}`}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="loader-clip clip-bottom">
          <div className="marquee">
            <div className="marquee-container">
              {tokens.map((t, i) => (
                <span key={`bot-${i}`}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="clip-center">
          <div className="marquee">
            <div className="marquee-container">
              {tokens.map((t, i) => (
                <span key={`center-${i}`}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
