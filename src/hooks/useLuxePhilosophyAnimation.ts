// src/hooks/useLuxePhilosophyAnimation.ts
import { useEffect } from "react";
import gsap from "gsap";
import Observer from "gsap/dist/Observer";
import { animateCircle } from "../utils/animateCircle";

gsap.registerPlugin(Observer);

export function useLuxePhilosophyAnimation(
  rootRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // ---------- SELECT ELEMENTS ----------
    const slides = Array.from(
      root.querySelectorAll<HTMLElement>(".philo-hero-image")
    );
    const postfix = root.querySelector<HTMLElement>(".philo-postfix");
    const postfixOuter = root.querySelector<HTMLElement>(
      ".philo-postfix-outer"
    );

    const subtextBlocks = Array.from(
      root.querySelectorAll<HTMLElement>(".philo-subtext-block")
    );

    const link = root.querySelector<HTMLElement>(".philo-link");
    const linkWrapper = root.querySelector<HTMLElement>(".philo-link-wrapper");
    const path = root.querySelector<SVGPathElement>("#philo-link-svg");
    const contentWrapper = root.querySelector<HTMLElement>(
      ".philo-hero-content"
    );

    // ---------- INDICATOR ----------
    const indicatorTrack = root.querySelector<HTMLElement>(
      ".philo-indicator-track"
    );
    const indItems = Array.from(
      root.querySelectorAll<HTMLElement>(".philo-ind-item")
    );
    const indLines = Array.from(
      root.querySelectorAll<HTMLElement>(".philo-ind-line")
    );
    const indLineFills = Array.from(
      root.querySelectorAll<HTMLElement>(".philo-ind-line-fill")
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

    const totalSlides = slides.length;
    let currentIndex = 0;
    let isAnimating = false;

    const getContentIndex = (slideIndex: number) => slideIndex - 1;

    const hasIndicator =
      !!indicatorTrack &&
      indItems.length > 0 &&
      indLineFills.length > 0 &&
      indLines.length > 0;

    const OPACITY_FUTURE = 0.25;
    const OPACITY_PASSED = 1;

    // ✅ เริ่มโชว์วงกลมตั้งแต่สไลด์ 2 (index 1)
    const LINK_START_INDEX = 1;

    // =========================
    // POSTFIX: measure real step
    // =========================
    let postfixStep = 0;

    const measurePostfixStep = () => {
      const first = root.querySelector<HTMLElement>(".philo-postfix > div");
      const h = first?.offsetHeight || 0;

      postfixStep = h > 0 ? h : window.innerWidth < 900 ? 42 : 150;

      if (postfixOuter) {
        gsap.set(postfixOuter, { overflow: "hidden", height: postfixStep });
      }
    };

    measurePostfixStep();

    // ---------- INDICATOR HELPERS ----------
    function applyIndicatorStatic(activeIndex: number) {
      if (!hasIndicator) return;

      indItems.forEach((el, i) => {
        const isPassed = i <= activeIndex;
        el.classList.toggle("active", i === activeIndex);

        gsap.set(el, {
          opacity: isPassed ? OPACITY_PASSED : OPACITY_FUTURE,
          scale: 1,
          overwrite: true,
        });
      });

      indLineFills.forEach((fill, i) => {
        gsap.set(fill, { scaleY: i < activeIndex ? 1 : 0, overwrite: true });
      });

      indLines.forEach((line) =>
        gsap.set(line, { opacity: 1, overwrite: true })
      );
    }

    function killIndicatorTweens() {
      if (!hasIndicator) return;
      gsap.killTweensOf(indItems);
      gsap.killTweensOf(indLineFills);
    }

    function buildIndicatorPath(
      from: number,
      to: number,
      dir: "down" | "up",
      total: number
    ) {
      const steps: number[] = [];
      const isWrapDown = dir === "down" && from === total - 1 && to === 0;
      const isWrapUp = dir === "up" && from === 0 && to === total - 1;

      if (isWrapDown) {
        for (let i = from - 1; i >= 0; i--) steps.push(i);
        return steps;
      }
      if (isWrapUp) {
        for (let i = from + 1; i <= total - 1; i++) steps.push(i);
        return steps;
      }

      if (to > from) for (let i = from + 1; i <= to; i++) steps.push(i);
      else if (to < from) for (let i = from - 1; i >= to; i--) steps.push(i);

      return steps;
    }

    function animateIndicatorStep(
      tl: gsap.core.Timeline,
      fromIndex: number,
      toIndex: number,
      at: number | string = ">"
    ) {
      if (!hasIndicator) return;

      const isDown = toIndex > fromIndex;

      tl.set(
        indItems[toIndex],
        { opacity: isDown ? OPACITY_FUTURE : OPACITY_PASSED, overwrite: true },
        at
      );

      const lineIdx = isDown ? fromIndex : toIndex;
      const fill = indLineFills[lineIdx];

      const LINE_DUR = 0.35;
      const NUM_DUR = 0.25;

      if (fill) {
        tl.to(
          fill,
          {
            scaleY: isDown ? 1 : 0,
            duration: LINE_DUR,
            ease: "power1.inOut",
            overwrite: true,
          },
          at
        );
      }

      if (isDown) {
        tl.to(
          indItems[toIndex],
          {
            opacity: OPACITY_PASSED,
            duration: NUM_DUR,
            ease: "power1.inOut",
            overwrite: true,
          },
          ">+=0.04"
        );
      } else {
        tl.to(
          indItems[fromIndex],
          {
            opacity: OPACITY_FUTURE,
            duration: NUM_DUR,
            ease: "sine.out",
            overwrite: true,
          },
          ">+=0.04"
        );
      }

      tl.add(() => {
        indItems[fromIndex]?.classList.remove("active");
        indItems[toIndex]?.classList.add("active");
      }, "<");
    }

    // ---------- INIT SLIDES ----------
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

    // content + link init
    gsap.set(contentWrapper, { autoAlpha: 0 });
    gsap.set(link, { autoAlpha: 0 });

    subtextBlocks.forEach((b) => gsap.set(b, { autoAlpha: 0, y: 20 }));

    // circle init
    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length, // start "not drawn"
      rotation: -90,
      transformOrigin: "center center",
    });

    if (hasIndicator) applyIndicatorStatic(currentIndex);

    const onResize = () => {
      if (isAnimating) return;
      measurePostfixStep();
      const postfixIndexNow = Math.max(currentIndex - 1, 0);
      gsap.set(postfix, { y: -postfixIndexNow * postfixStep, overwrite: true });
      if (hasIndicator) applyIndicatorStatic(currentIndex);
    };
    window.addEventListener("resize", onResize);

    // =========================
    // ✅ Circle helpers (KEY FIX)
    // =========================

    // “รอบที่สองอย่างเดียว” = start จาก strokeDashoffset = length แล้ววิ่งไป 0
    const animateCircleSecondRoundOnly = (p: SVGPathElement) => {
      const L = p.getTotalLength();
      const t = gsap.timeline();

      t.set(p, { strokeDasharray: L, strokeDashoffset: L, scale: 1 }).to(p, {
        strokeDashoffset: 0,
        duration: 1,
        ease: "power2.inOut",
      });

      return t;
    };

    const playCircle = (
      tl: gsap.core.Timeline,
      mode: "secondOnly" | "double",
      at: number | string = 0
    ) => {
      // กันซ้อนจาก tween เก่า (สำคัญมาก)
      gsap.killTweensOf(path);

      // set rotation ทุกครั้งให้เหมือนเดิม
      tl.set(
        path,
        {
          rotation: -90,
          transformOrigin: "center center",
        },
        at
      );

      // ✅ 1→2 = secondOnly
      // ✅ ที่เหลือ = double (animateCircle เดิม 2 phase)
      tl.add(
        mode === "secondOnly"
          ? animateCircleSecondRoundOnly(path)
          : animateCircle(path),
        at
      );
    };

    // ---------- MAIN FUNCTION ----------
    const showSlide = (nextIndex: number, direction: "up" | "down") => {
      if (isAnimating || nextIndex === currentIndex) return;
      isAnimating = true;

      if (hasIndicator) killIndicatorTweens();

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[nextIndex];

      const currentImg =
        currentSlide.querySelector<HTMLElement>(".philo-main-image");
      const nextImg = nextSlide.querySelector<HTMLElement>(".philo-main-image");

      if (!currentImg || !nextImg) {
        isAnimating = false;
        return;
      }

      const shouldShowLinkNext = nextIndex >= LINK_START_INDEX;
      const isLinkVisibleNow = currentIndex >= LINK_START_INDEX;

      const currentContentIndex = getContentIndex(currentIndex);
      const nextContentIndex = getContentIndex(nextIndex);

      const currentBlock =
        currentContentIndex >= 0 ? subtextBlocks[currentContentIndex] : null;
      const nextBlock =
        nextContentIndex >= 0 ? subtextBlocks[nextContentIndex] : null;

      const isSlowTextSlide = nextIndex === 1 || nextIndex === 3;
      const textDelay = isSlowTextSlide ? 0.8 : 0;
      const textDuration = isSlowTextSlide ? 2.0 : 1.1;

      gsap.set(nextSlide, {
        clipPath:
          direction === "up"
            ? "polygon(0 0, 100% 0, 100% 0, 0 0)"
            : "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        zIndex: 2,
      });
      gsap.set(nextImg, { scale: 2, top: "4em" });
      gsap.set(currentSlide, { zIndex: 1 });

      measurePostfixStep();

      const postfixIndex = Math.max(nextIndex - 1, 0);
      const targetTop = nextIndex === 0 ? 0 : -postfixIndex * postfixStep;

      gsap.killTweensOf(postfix);

      const tl = gsap.timeline({
        defaults: { overwrite: true },
        onComplete: () => {
          gsap.set(currentSlide, { zIndex: 0 });
          gsap.set(nextSlide, { zIndex: 1 });
          currentIndex = nextIndex;
          isAnimating = false;
        },
      });

      // Indicator
      if (hasIndicator) {
        const dir = direction === "down" ? "down" : "up";
        const steps = buildIndicatorPath(
          currentIndex,
          nextIndex,
          dir,
          totalSlides
        );
        let from = currentIndex;

        steps.forEach((to) => {
          animateIndicatorStep(tl, from, to, ">");
          from = to;
        });

        tl.add(() => applyIndicatorStatic(nextIndex), ">");
      }

      // Text layer
      if (currentIndex === 0 && nextIndex !== 0) {
        tl.fromTo(
          contentWrapper,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: textDuration, ease: "power2.out" },
          textDelay
        );
      } else if (nextIndex === 0) {
        tl.to(
          contentWrapper,
          { autoAlpha: 0, duration: 0.8, ease: "power2.out" },
          0
        );
      }

      // CTA show/hide
      const linkInAt = 0;
      if (!isLinkVisibleNow && shouldShowLinkNext) {
        tl.fromTo(
          link,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
          linkInAt
        );
      } else if (isLinkVisibleNow && !shouldShowLinkNext) {
        tl.to(link, { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, 0);
      }

      // Postfix
      tl.to(
        postfix,
        {
          y: targetTop,
          duration: isSlowTextSlide ? 2.4 : 2,
          ease: "power4.inOut",
        },
        textDelay
      );

      // Subtext blocks
      if (currentBlock) {
        tl.to(
          currentBlock,
          { autoAlpha: 0, y: -20, duration: 0.8, ease: "power4.inOut" },
          textDelay
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
          textDelay + 0.1
        );
      }

      // ✅ Circle logic (THE FIX)
      if (shouldShowLinkNext || isLinkVisibleNow) {
        const isSlide1to2 = currentIndex === 0 && nextIndex === 1;
        playCircle(tl, isSlide1to2 ? "secondOnly" : "double", 0);
      }

      // BG images
      tl.to(
        currentImg,
        { scale: 2, top: "4em", duration: 2, ease: "power3.inOut" },
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
          { scale: 1, top: "0", duration: 2, ease: "power3.inOut" },
          0
        );
    };

    // ---------- OBSERVER ----------
    const isInteractiveTarget = (t: EventTarget | null) => {
      if (!(t instanceof Element)) return false;
      return !!t.closest(
        "a,button,input,textarea,select,.menu-bar,.menu-overlay,.philo-link,.philo-link-wrapper"
      );
    };

    const observer = Observer.create({
      target: root,
      type: "wheel,touch",
      tolerance: 12,
      wheelSpeed: 1,
      preventDefault: true,
      onDown: (self) => {
        if (isAnimating) return;
        if (isInteractiveTarget(self.event?.target)) return;
        showSlide((currentIndex + 1) % totalSlides, "down");
      },
      onUp: (self) => {
        if (isAnimating) return;
        if (isInteractiveTarget(self.event?.target)) return;
        showSlide((currentIndex - 1 + totalSlides) % totalSlides, "up");
      },
    });

    // ---------- CIRCLE FOLLOW MOUSE ----------
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

    link.addEventListener("mousemove", onMove);
    link.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("resize", onResize);
      observer.kill();

      link.removeEventListener("mousemove", onMove);
      link.removeEventListener("mouseleave", onLeave);

      if (hasIndicator) killIndicatorTweens();
      gsap.killTweensOf(path);
      gsap.killTweensOf(postfix);
    };
  }, [rootRef]);
}
