import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Lightbulb, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Tip } from "../content/comprendre";
import { TIP, motionAllowed } from "../lib/motion";
import { SCENE_CLEAR } from "../lib/useScene";

gsap.registerPlugin(useGSAP);

interface TipCarouselProps {
  readonly tips: readonly Tip[];
}

const FOCUS_RING = "outline-offset-4 focus-visible:outline-3 focus-visible:outline-ring";

/**
 * « Le conseil du moment » en carrousel (E01) : un conseil à la fois, qui glisse vers le suivant toutes les
 * 7 s. Le défilement s'arrête au survol, au focus et avec le bouton pause (WCAG 2.2.2), et n'existe pas sous
 * « réduire les animations » (MOV-01). Les conseils masqués restent dans le DOM (hauteur stable) mais sont
 * invisibles et hors de l'arbre d'accessibilité.
 */
export function TipCarousel({ tips }: TipCarouselProps) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const canMove = motionAllowed();
  const running = canMove && !userPaused && !hovered && !focused && tips.length > 1;

  const slidesRef = useRef<HTMLDivElement>(null);
  const previous = useRef(0);

  // Le prochain conseil arrive de la droite (ou de la gauche si l'on revient en arrière).
  useGSAP(
    () => {
      const from = previous.current;
      previous.current = index;
      const root = slidesRef.current;
      if (from === index || !canMove || root === null) return;
      const incoming = root.querySelector(`[data-slide="${index}"]`);
      if (incoming === null) return;
      gsap.from(incoming, {
        x: index > from ? TIP.slidePx : -TIP.slidePx,
        opacity: 0,
        duration: TIP.duration,
        ease: "power3.out",
        clearProps: SCENE_CLEAR,
      });
    },
    { scope: slidesRef, dependencies: [index] },
  );

  // Minuteur remis à zéro à chaque changement : un choix manuel laisse un temps de lecture complet.
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % tips.length);
    }, TIP.intervalMs);
    return () => window.clearTimeout(timer);
  }, [running, index, tips.length]);

  return (
    <div
      role="group"
      aria-label="Conseils"
      aria-roledescription="carrousel"
      className="grid gap-3"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <p className="flex items-center gap-2 text-muted-foreground">
        <Lightbulb className="size-5" aria-hidden="true" />
        Le conseil du moment
      </p>

      <div ref={slidesRef} className="grid overflow-hidden">
        {tips.map((tip, position) => {
          const active = position === index;
          return (
            <div
              key={tip.slug}
              data-slide={position}
              aria-hidden={!active}
              className={`col-start-1 row-start-1 grid content-start gap-3 ${active ? "" : "invisible"}`}
            >
              <p className="text-xl font-light">{tip.text}</p>
              <Link
                to={`/comprendre/${tip.slug}`}
                tabIndex={active ? 0 : -1}
                className={`w-fit rounded-md text-muted-foreground underline underline-offset-4 ${FOCUS_RING}`}
              >
                En savoir plus
              </Link>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-1">
        {tips.map((tip, position) => (
          <button
            key={tip.slug}
            type="button"
            aria-label={`Conseil ${position + 1} sur ${tips.length}`}
            aria-current={position === index}
            onClick={() => setIndex(position)}
            className={`grid size-11 cursor-pointer place-items-center rounded-full ${FOCUS_RING}`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-[width,background-color] ${
                position === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/50"
              }`}
            />
          </button>
        ))}
        {canMove && tips.length > 1 && (
          <button
            type="button"
            aria-label={userPaused ? "Reprendre le défilement" : "Mettre en pause le défilement"}
            onClick={() => setUserPaused((paused) => !paused)}
            className={`ml-auto grid size-11 cursor-pointer place-items-center rounded-full text-muted-foreground ${FOCUS_RING}`}
          >
            {userPaused ? <Play className="size-5" aria-hidden="true" /> : <Pause className="size-5" aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}
