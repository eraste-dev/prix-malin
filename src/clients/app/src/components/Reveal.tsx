import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";
import { EMPHASIS_CLASS, FADE_CLASS, REVEAL_CLASS, revealDelay } from "../lib/motion";

const VARIANT_CLASS = { rise: REVEAL_CLASS, fade: FADE_CLASS, emphasis: EMPHASIS_CLASS } as const;

type RevealProps<T extends ElementType> = {
  readonly as?: T;
  /** Temps fort de la cascade (voir `lib/motion.ts`). */
  readonly beat: number;
  /** Rang de l'élément dans son temps fort : chacun s'anime à son tour. */
  readonly sub?: number;
  /** `rise` : fondu + montée ; `fade` : surface seule ; `emphasis` : révélation du résultat. */
  readonly variant?: keyof typeof VARIANT_CLASS;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "beat" | "sub" | "variant">;

/** Un élément qui entre seul, à son rang dans la chorégraphie commune. */
export function Reveal<T extends ElementType = "div">({
  as,
  beat,
  sub = 0,
  variant = "rise",
  className,
  style,
  ...rest
}: RevealProps<T>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={cn(VARIANT_CLASS[variant], className)}
      style={{ ...revealDelay(beat, sub), ...style }}
      {...rest}
    />
  );
}
