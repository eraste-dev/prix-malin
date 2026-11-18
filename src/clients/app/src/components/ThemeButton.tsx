import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { SWAP, motionAllowed } from "../lib/motion";
import type { ResolvedTheme } from "../lib/theme";
import { THEME_ICONS } from "./themeIcons";

interface ThemeButtonProps {
  readonly effective: ResolvedTheme;
  readonly onToggle: () => void;
}

/** Bouton rond d'en-tête, toujours visible : un clic bascule clair ↔ sombre. */
export function ThemeButton({ effective, onToggle }: ThemeButtonProps) {
  const Icon = THEME_ICONS[effective];
  const label = effective === "dark" ? "Passer en mode clair" : "Passer en mode sombre";
  const iconRef = useRef<SVGSVGElement>(null);

  // L'icône refait une petite rotation à chaque bascule (GSAP, ADR-0011).
  useGSAP(
    () => {
      if (!motionAllowed() || iconRef.current === null) return;
      gsap.from(iconRef.current, {
        rotation: SWAP.fromRotation,
        opacity: 0,
        duration: SWAP.duration,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
    },
    { dependencies: [effective], scope: iconRef },
  );

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onToggle}
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-card text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-muted focus-visible:outline-3 focus-visible:outline-ring"
    >
      <Icon ref={iconRef} className="size-5" aria-hidden="true" />
    </button>
  );
}
