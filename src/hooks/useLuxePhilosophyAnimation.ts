// src/hooks/useLuxePhilosophyAnimation.ts
import { useEffect } from "react";
import gsap from "gsap";
import { animateCircle } from "../utils/animateCircle";

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

    // ต้องมีของหลัก ๆ ถึงจะทำต่อ
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

    const totalSlides = slides.length; // 0..3
    let currentIndex = 0;
    let isAnimating = false;
    let currentTopValue = 0;

    const getContentIndex = (slideIndex: number) => slideIndex - 1;

    const hasIndicator =
      !!indicatorTrack &&
      indItems.length > 0 &&
      indLineFills.length > 0 &&
      indLines.length > 0;

    const OPACITY_FUTURE = 0.25;
    const OPACITY_PASSED = 1;

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

    /**
     * ✅ สร้าง step path “สำหรับ Indicator แบบเส้นตรง”
     *
     * - ปกติ: 1 step (เช่น 1->2)
     * - Jump (เช่น 1->4): [2,3,4]
     * - Wrap ที่เกิดจาก modulo:
     *    - scroll DOWN จาก 4 -> 1 (3 -> 0): ให้ถอยกลับ [3->2->1->0] = [2,1,0]
     *    - scroll UP   จาก 1 -> 4 (0 -> 3): ให้ไปข้างหน้า [0->1->2->3] = [1,2,3]
     */
    function buildIndicatorPath(
      from: number,
      to: number,
      wheelDir: "down" | "up",
      total: number
    ) {
      const steps: number[] = [];

      // case: modulo wrap
      const isWrapDown = wheelDir === "down" && from === total - 1 && to === 0;
      const isWrapUp = wheelDir === "up" && from === 0 && to === total - 1;

      if (isWrapDown) {
        // 4 -> 1 : ถอยกลับ 4->3->2->1
        for (let i = from - 1; i >= 0; i--) steps.push(i);
        return steps;
      }

      if (isWrapUp) {
        // 1 -> 4 : ไปข้างหน้า 1->2->3->4
        for (let i = from + 1; i <= total - 1; i++) steps.push(i);
        return steps;
      }

      // non-wrap jump ปกติ (linear)
      if (to > from) {
        for (let i = from + 1; i <= to; i++) steps.push(i);
      } else if (to < from) {
        for (let i = from - 1; i >= to; i--) steps.push(i);
      }

      return steps;
    }

    /**
     * ✅ 1 STEP ONLY: เลขวิ่งตามเส้น
     * - DOWN: เส้น fill ก่อน -> แล้วเลขปลายทางค่อยขาว
     * - UP:   เส้น retract ก่อน -> แล้วเลขต้นทางค่อยเทา
     */
    function animateIndicatorStep(
      tl: gsap.core.Timeline,
      fromIndex: number,
      toIndex: number,
      at: number | string = ">"
    ) {
      if (!hasIndicator) return;

      const isDown = toIndex > fromIndex;

      // กัน flash ของปลายทาง
      tl.set(
        indItems[toIndex],
        { opacity: isDown ? OPACITY_FUTURE : OPACITY_PASSED, overwrite: true },
        at
      );

      // ✅ fill index สำหรับ 1 step
      // DOWN: เติมเส้น between from->to = fromIndex
      // UP:   ถอยเส้น between to->from = toIndex
      const lineIdx = isDown ? fromIndex : toIndex;
      const fill = indLineFills[lineIdx];

      const LINE_DUR = 0.35;
      const NUM_DUR = 0.25;

      // 1) เส้นวิ่งก่อน
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

      // 2) เลข “ตามเส้น”
      if (isDown) {
        // เส้นจบ -> ค่อยทำให้เลขปลายทางขาว
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
        // เส้นถอยจบ -> ค่อยทำให้เลขต้นทางเทา
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

      // 3) active ขยับตาม step
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

    gsap.set(contentWrapper, { autoAlpha: 0 });
    gsap.set(link, { autoAlpha: 0 });
    subtextBlocks.forEach((block) => gsap.set(block, { autoAlpha: 0, y: 20 }));

    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: 0,
      rotation: -90,
      transformOrigin: "center center",
    });

    // ---------- INDICATOR INIT ----------
    if (hasIndicator) applyIndicatorStatic(currentIndex);

    const onResize = () => {
      if (isAnimating) return;
      if (hasIndicator) applyIndicatorStatic(currentIndex);
    };
    window.addEventListener("resize", onResize);

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

      const shouldShowLinkNext = nextIndex >= 2;
      const isLinkVisibleNow = currentIndex >= 2;

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

      const lineHeightTitle = window.innerWidth < 900 ? 42 : 150;
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

      // ✅ INDICATOR: เลขต้องวิ่งตามเส้นแบบ step-by-step
      if (hasIndicator) {
        const wheelDir = direction === "down" ? "down" : "up";
        const steps = buildIndicatorPath(
          currentIndex,
          nextIndex,
          wheelDir,
          totalSlides
        );

        let from = currentIndex;

        // สำคัญ: ต่อคิวด้วย ">" เท่านั้น
        steps.forEach((to) => {
          animateIndicatorStep(tl, from, to, ">");
          from = to;
        });

        // lock state ทีเดียวหลังจบ jump ทั้งหมด
        tl.add(() => applyIndicatorStatic(nextIndex), ">");
      }

      // ---------- TEXT ----------
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

      // ---------- CIRCLE CTA ----------
      if (!isLinkVisibleNow && shouldShowLinkNext) {
        tl.fromTo(
          link,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.8, ease: "power2.out" },
          textDelay + 0.3
        );
      } else if (isLinkVisibleNow && !shouldShowLinkNext) {
        tl.to(link, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0);
      }

      // ---------- Postfix ----------
      tl.to(
        postfix,
        {
          y: currentTopValue,
          duration: isSlowTextSlide ? 2.4 : 2,
          ease: "power4.inOut",
        },
        textDelay
      );

      // ---------- Subtext blocks ----------
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

      // ---------- วงแหวนหมุน ----------
      tl.add(animateCircle(path), 0);

      // ---------- BG images ----------
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

    // ---------- WHEEL ----------
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

    root.addEventListener("wheel", onWheel, { passive: true });

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

    gsap.set(linkWrapper, { x: 0, y: 0, xPercent: -50, yPercent: -50 });

    return () => {
      window.removeEventListener("resize", onResize);

      root.removeEventListener("wheel", onWheel);
      link.removeEventListener("mousemove", onMove);
      link.removeEventListener("mouseleave", onLeave);

      if (hasIndicator) killIndicatorTweens();
    };
  }, [rootRef]);
}
