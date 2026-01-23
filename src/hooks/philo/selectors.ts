// src/hooks/philo/selectors.ts
import gsap from "gsap";

export type PhiloIndicatorEls = {
  track: HTMLElement;
  items: HTMLElement[];
  lines: HTMLElement[];
  fills: HTMLElement[];
};

export type PhiloEls = {
  slides: HTMLElement[];
  postfix: HTMLElement;
  postfixOuter: HTMLElement | null;
  subtextBlocks: HTMLElement[];
  link: HTMLElement;
  linkWrapper: HTMLElement;
  path: SVGPathElement;
  contentWrapper: HTMLElement;
  indicator: PhiloIndicatorEls | null;
};

export function selectPhiloElements(root: HTMLElement): PhiloEls | null {
  const slides = Array.from(
    root.querySelectorAll<HTMLElement>(".philo-hero-image"),
  );
  const postfix = root.querySelector<HTMLElement>(".philo-postfix");
  const postfixOuter = root.querySelector<HTMLElement>(".philo-postfix-outer");

  const subtextBlocks = Array.from(
    root.querySelectorAll<HTMLElement>(".philo-subtext-block"),
  );

  const link = root.querySelector<HTMLElement>(".philo-link");
  const linkWrapper = root.querySelector<HTMLElement>(".philo-link-wrapper");
  const path = root.querySelector<SVGPathElement>("#philo-link-svg");
  const contentWrapper = root.querySelector<HTMLElement>(".philo-hero-content");

  if (
    !slides.length ||
    !postfix ||
    !subtextBlocks.length ||
    !link ||
    !linkWrapper ||
    !path ||
    !contentWrapper
  ) {
    return null;
  }

  const indicatorTrack = root.querySelector<HTMLElement>(
    ".philo-indicator-track",
  );
  const indItems = Array.from(
    root.querySelectorAll<HTMLElement>(".philo-ind-item"),
  );
  const indLines = Array.from(
    root.querySelectorAll<HTMLElement>(".philo-ind-line"),
  );
  const indLineFills = Array.from(
    root.querySelectorAll<HTMLElement>(".philo-ind-line-fill"),
  );

  const hasIndicator =
    !!indicatorTrack &&
    indItems.length > 0 &&
    indLineFills.length > 0 &&
    indLines.length > 0;

  const indicator = hasIndicator
    ? {
        track: indicatorTrack!,
        items: indItems,
        lines: indLines,
        fills: indLineFills,
      }
    : null;

  return {
    slides,
    postfix,
    postfixOuter,
    subtextBlocks,
    link,
    linkWrapper,
    path,
    contentWrapper,
    indicator,
  };
}

export function initSlidesAndBaseState(args: {
  slides: HTMLElement[];
  subtextBlocks: HTMLElement[];
  contentWrapper: HTMLElement;
  link: HTMLElement;
  path: SVGPathElement;
}) {
  const { slides, subtextBlocks, contentWrapper, link, path } = args;

  // slides initial
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
    strokeDashoffset: length,
    rotation: -90,
    transformOrigin: "center center",
  });
}
