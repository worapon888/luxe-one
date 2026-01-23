// src/hooks/useLuxePhilosophyAnimation.ts
import { useEffect } from "react";
import type React from "react";
import gsap from "gsap";
import Observer from "gsap/dist/Observer";

import { animateCircle } from "../utils/animateCircle";
import { selectPhiloElements, initSlidesAndBaseState } from "./philo/selectors";
import { createPostfixMeasurer, type PostfixMeasurer } from "./philo/postfix";
import { createCirclePlayer, type CirclePlayer } from "./philo/circle";
import {
  createIndicatorController,
  type IndicatorController,
} from "./philo/indicator";

gsap.registerPlugin(Observer);

export function useLuxePhilosophyAnimation(
  rootRef: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const els = selectPhiloElements(root);
    if (!els) return;

    const {
      slides,
      postfix,
      postfixOuter,
      subtextBlocks,
      link,
      linkWrapper,
      path,
      contentWrapper,
      indicator,
    } = els;

    const totalSlides = slides.length;
    let currentIndex = 0;
    let isAnimating = false;

    // ✅ เริ่มโชว์วงกลมตั้งแต่สไลด์ 2 (index 1)
    const LINK_START_INDEX = 1;

    const getContentIndex = (slideIndex: number) => slideIndex - 1;

    // ---------- INIT BASE STATE ----------
    initSlidesAndBaseState({
      slides,
      subtextBlocks,
      contentWrapper,
      link,
      path,
    });

    // ---------- POSTFIX ----------
    const postfixMeasurer: PostfixMeasurer = createPostfixMeasurer({
      root,
      postfixOuter,
    });
    postfixMeasurer.measure();

    // ---------- INDICATOR ----------
    const indicatorCtrl: IndicatorController | null = indicator
      ? createIndicatorController(indicator)
      : null;

    if (indicatorCtrl) indicatorCtrl.applyStatic(currentIndex);

    // ---------- CIRCLE ----------
    const circle: CirclePlayer = createCirclePlayer({
      path,
      animateCircle,
    });

    // ---------- RESIZE ----------
    const onResize = () => {
      if (isAnimating) return;
      postfixMeasurer.measure();

      const postfixIndexNow = Math.max(currentIndex - 1, 0);
      gsap.set(postfix, {
        y: -postfixIndexNow * postfixMeasurer.step,
        overwrite: true,
      });

      if (indicatorCtrl) indicatorCtrl.applyStatic(currentIndex);
    };
    window.addEventListener("resize", onResize);

    // ---------- MAIN FUNCTION ----------
    const showSlide = (nextIndex: number, direction: "up" | "down") => {
      if (isAnimating || nextIndex === currentIndex) return;
      isAnimating = true;

      indicatorCtrl?.killTweens();

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

      postfixMeasurer.measure();

      const postfixIndex = Math.max(nextIndex - 1, 0);
      const targetTop =
        nextIndex === 0 ? 0 : -postfixIndex * postfixMeasurer.step;

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
      if (indicatorCtrl) {
        const dir = direction === "down" ? "down" : "up";
        indicatorCtrl.animateTransition(
          tl,
          currentIndex,
          nextIndex,
          dir,
          totalSlides,
        );
        tl.add(() => indicatorCtrl.applyStatic(nextIndex), ">");
      }

      // Text layer
      if (currentIndex === 0 && nextIndex !== 0) {
        tl.fromTo(
          contentWrapper,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: textDuration, ease: "power2.out" },
          textDelay,
        );
      } else if (nextIndex === 0) {
        tl.to(
          contentWrapper,
          { autoAlpha: 0, duration: 0.8, ease: "power2.out" },
          0,
        );
      }

      // CTA show/hide
      const linkInAt = 0;
      if (!isLinkVisibleNow && shouldShowLinkNext) {
        tl.fromTo(
          link,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
          linkInAt,
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
        textDelay,
      );

      // Subtext blocks
      if (currentBlock) {
        tl.to(
          currentBlock,
          { autoAlpha: 0, y: -20, duration: 0.8, ease: "power4.inOut" },
          textDelay,
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
          textDelay + 0.1,
        );
      }

      // ✅ Circle logic
      if (shouldShowLinkNext || isLinkVisibleNow) {
        const isSlide1to2 = currentIndex === 0 && nextIndex === 1;
        circle.play(tl, isSlide1to2 ? "secondOnly" : "double", 0);
      }

      // BG images
      tl.to(
        currentImg,
        { scale: 2, top: "4em", duration: 2, ease: "power3.inOut" },
        0,
      )
        .to(
          nextSlide,
          {
            clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
            duration: 2,
            ease: "power4.inOut",
          },
          0,
        )
        .to(
          nextImg,
          { scale: 1, top: "0", duration: 2, ease: "power3.inOut" },
          0,
        );
    };

    // ---------- OBSERVER ----------
    const isInteractiveTarget = (t: EventTarget | null) => {
      if (!(t instanceof Element)) return false;
      return !!t.closest(
        "a,button,input,textarea,select,.menu-bar,.menu-overlay,.philo-link,.philo-link-wrapper",
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

      indicatorCtrl?.killTweens();
      circle.kill();
      gsap.killTweensOf(postfix);
    };
  }, [rootRef]);
}
