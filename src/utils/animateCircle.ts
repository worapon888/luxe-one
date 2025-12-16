// src/utils/animateCircle.ts
import gsap from "gsap";

export function animateCircle(path: SVGPathElement) {
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
