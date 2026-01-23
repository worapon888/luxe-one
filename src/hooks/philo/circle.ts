// src/hooks/philo/circle.ts
import gsap from "gsap";

export type CircleMode = "secondOnly" | "double";

export type CirclePlayer = {
  play: (
    tl: gsap.core.Timeline,
    mode: CircleMode,
    at?: number | string,
  ) => void;
  kill: () => void;
};

export function createCirclePlayer(args: {
  path: SVGPathElement;
  animateCircle: (p: SVGPathElement) => gsap.core.Timeline;
}): CirclePlayer {
  const { path, animateCircle } = args;

  const animateSecondOnly = (p: SVGPathElement) => {
    const L = p.getTotalLength();
    const t = gsap.timeline();

    t.set(p, { strokeDasharray: L, strokeDashoffset: L, scale: 1 }).to(p, {
      strokeDashoffset: 0,
      duration: 1,
      ease: "power2.inOut",
    });

    return t;
  };

  return {
    play: (tl, mode, at = 0) => {
      // กันซ้อนจาก tween เก่า (สำคัญมาก)
      gsap.killTweensOf(path);

      // set rotation ทุกครั้งให้เหมือนเดิม
      tl.set(path, { rotation: -90, transformOrigin: "center center" }, at);

      tl.add(
        mode === "secondOnly" ? animateSecondOnly(path) : animateCircle(path),
        at,
      );
    },
    kill: () => {
      gsap.killTweensOf(path);
    },
  };
}
