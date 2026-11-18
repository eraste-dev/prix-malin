import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ComponentPropsWithoutRef, type ElementType } from "react";
import { REVEAL, REVEAL_CLEAR_PROPS, motionAllowed, revealDelayMs, type RevealVariant } from "../lib/motion";

gsap.registerPlugin(useGSAP);

type RevealProps<T extends ElementType> = {
  readonly as?: T;
  /** Temps fort de la cascade (voir `lib/motion.ts`). */
  readonly beat: number;
  /** Rang de l'élément dans son temps fort : chacun s'anime à son tour. */
  readonly sub?: number;
  /** `rise` : fondu + montée ; `fade` : surface seule ; `emphasis` : révélation du résultat. */
  readonly variant?: RevealVariant;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "beat" | "sub" | "variant">;

/**
 * Un élément qui entre seul, à son rang dans la chorégraphie commune (GSAP, ADR-0011).
 * Sous « réduire les animations », rien n'est posé : l'élément est visible tout de suite.
 */
export function Reveal<T extends ElementType = "div">({ as, beat, sub = 0, variant = "rise", ...rest }: RevealProps<T>) {
  const Component: ElementType = as ?? "div";
  const ref = useRef<HTMLElement>(null);
  const delayMs = revealDelayMs(beat, sub);

  useGSAP(
    () => {
      if (!motionAllowed() || ref.current === null) return;
      const { from, duration, ease } = REVEAL[variant];
      gsap.from(ref.current, { ...from, duration, ease, delay: delayMs / 1000, clearProps: REVEAL_CLEAR_PROPS });
    },
    { scope: ref },
  );

  return <Component ref={ref} data-reveal-delay={delayMs} {...rest} />;
}
