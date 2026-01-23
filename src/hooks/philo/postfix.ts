// src/hooks/philo/postfix.ts
import gsap from "gsap";

export type PostfixMeasurer = {
  step: number;
  measure: () => void;
};

export function createPostfixMeasurer(args: {
  root: HTMLElement;
  postfixOuter: HTMLElement | null;
}): PostfixMeasurer {
  const { root, postfixOuter } = args;

  const state: PostfixMeasurer = {
    step: 0,
    measure: () => {
      const first = root.querySelector<HTMLElement>(".philo-postfix > div");
      const h = first?.offsetHeight || 0;

      state.step = h > 0 ? h : window.innerWidth < 900 ? 42 : 150;

      if (postfixOuter) {
        gsap.set(postfixOuter, { overflow: "hidden", height: state.step });
      }
    },
  };

  return state;
}
