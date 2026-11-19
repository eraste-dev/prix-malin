import { ONBOARD } from "../lib/motion";
import { SCENE_CLEAR, useScene } from "../lib/useScene";

/** Scène 3 : un téléphone fermé par un cadenas, un nuage barré (DESIGN.md « Onboarding »). */
export function SceneLock() {
  const ref = useScene((_root, part, timeline) => {
    timeline
      .from(part("phone"), { y: 32, opacity: 0, duration: ONBOARD.sceneDuration, ease: "power3.out", clearProps: SCENE_CLEAR })
      .from(part("cloud"), { x: -24, opacity: 0, duration: ONBOARD.sceneDuration, ease: "power3.out", clearProps: SCENE_CLEAR }, 0.1)
      .from(part("slash"), { strokeDashoffset: 1, duration: ONBOARD.slashDuration, ease: "power2.inOut" }, ">")
      .from(part("lock"), { opacity: 0, duration: 0.2, clearProps: SCENE_CLEAR }, 0.3)
      .from(
        part("shackle"),
        { y: -ONBOARD.shackleLift, duration: ONBOARD.shackleDuration, ease: "bounce.out", clearProps: SCENE_CLEAR },
        0.4,
      );
  });

  return (
    <svg
      ref={ref}
      role="img"
      aria-label="Un téléphone fermé par un cadenas, et un nuage barré : rien ne quitte l'appareil"
      viewBox="0 0 320 280"
      className="h-full max-h-72 w-full"
    >
      <g data-part="phone">
        <rect x="100" y="24" width="120" height="232" rx="24" className="fill-card stroke-border" strokeWidth="2" />
        <rect x="112" y="44" width="96" height="192" rx="14" className="fill-muted" />
        <rect x="124" y="64" width="40" height="20" rx="6" className="fill-primary" />
        <rect x="124" y="98" width="72" height="8" rx="4" className="fill-foreground/70" />
        <rect x="124" y="114" width="48" height="8" rx="4" className="fill-border" />
        <rect x="124" y="140" width="72" height="8" rx="4" className="fill-border" />
        <rect x="124" y="156" width="56" height="8" rx="4" className="fill-border" />
      </g>

      <g data-part="cloud">
        <path
          d="M 36 112 a 18 18 0 0 1 8 -34 a 26 26 0 0 1 48 -4 a 20 20 0 0 1 4 38 z"
          className="fill-card stroke-border"
          strokeWidth="2"
        />
      </g>
      <path
        data-part="slash"
        d="M 32 128 L 100 60"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset="0"
        strokeWidth="6"
        strokeLinecap="round"
        className="stroke-primary"
      />

      <g data-part="lock">
        <path
          data-part="shackle"
          d="M 214 176 v -14 a 18 18 0 0 1 36 0 v 14"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-foreground"
        />
        <rect x="204" y="174" width="56" height="48" rx="12" className="fill-primary" />
        <circle cx="232" cy="196" r="5" className="fill-primary-foreground" />
        <rect x="230" y="198" width="4" height="12" rx="2" className="fill-primary-foreground" />
      </g>
    </svg>
  );
}
