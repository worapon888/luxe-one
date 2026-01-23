// src/hooks/philo/indicator.ts
import gsap from "gsap";
import type { PhiloIndicatorEls } from "./selectors";

export type IndicatorController = {
  applyStatic: (activeIndex: number) => void;
  killTweens: () => void;

  animateTransition: (
    tl: gsap.core.Timeline,
    fromIndex: number,
    toIndex: number,
    dir: "down" | "up",
    total: number,
  ) => void;
};

const OPACITY_FUTURE = 0.25;
const OPACITY_PASSED = 1;

export function createIndicatorController(
  ind: PhiloIndicatorEls,
): IndicatorController {
  const { items, lines, fills } = ind;

  function applyStatic(activeIndex: number) {
    items.forEach((el, i) => {
      const isPassed = i <= activeIndex;
      el.classList.toggle("active", i === activeIndex);

      gsap.set(el, {
        opacity: isPassed ? OPACITY_PASSED : OPACITY_FUTURE,
        scale: 1,
        overwrite: true,
      });
    });

    fills.forEach((fill, i) => {
      gsap.set(fill, { scaleY: i < activeIndex ? 1 : 0, overwrite: true });
    });

    lines.forEach((line) => gsap.set(line, { opacity: 1, overwrite: true }));
  }

  function killTweens() {
    gsap.killTweensOf(items);
    gsap.killTweensOf(fills);
  }

  function buildPath(
    from: number,
    to: number,
    dir: "down" | "up",
    total: number,
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

  function animateStep(
    tl: gsap.core.Timeline,
    fromIndex: number,
    toIndex: number,
    at: number | string = ">",
  ) {
    const isDown = toIndex > fromIndex;

    tl.set(
      items[toIndex],
      { opacity: isDown ? OPACITY_FUTURE : OPACITY_PASSED, overwrite: true },
      at,
    );

    const lineIdx = isDown ? fromIndex : toIndex;
    const fill = fills[lineIdx];

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
        at,
      );
    }

    if (isDown) {
      tl.to(
        items[toIndex],
        {
          opacity: OPACITY_PASSED,
          duration: NUM_DUR,
          ease: "power1.inOut",
          overwrite: true,
        },
        ">+=0.04",
      );
    } else {
      tl.to(
        items[fromIndex],
        {
          opacity: OPACITY_FUTURE,
          duration: NUM_DUR,
          ease: "sine.out",
          overwrite: true,
        },
        ">+=0.04",
      );
    }

    tl.add(() => {
      items[fromIndex]?.classList.remove("active");
      items[toIndex]?.classList.add("active");
    }, "<");
  }

  function animateTransition(
    tl: gsap.core.Timeline,
    fromIndex: number,
    toIndex: number,
    dir: "down" | "up",
    total: number,
  ) {
    const steps = buildPath(fromIndex, toIndex, dir, total);
    let from = fromIndex;

    steps.forEach((to) => {
      animateStep(tl, from, to, ">");
      from = to;
    });
  }

  return {
    applyStatic,
    killTweens,
    animateTransition,
  };
}
