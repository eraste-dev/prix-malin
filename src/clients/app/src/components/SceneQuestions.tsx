import { ONBOARD } from "../lib/motion";
import { SCENE_CLEAR, useScene } from "../lib/useScene";

const ROWS = [
  { y: 36, title: 112, subtitle: 72 },
  { y: 112, title: 92, subtitle: 104 },
  { y: 188, title: 124, subtitle: 60 },
] as const;

/** Scène 2 : trois questions posées en lignes que l'on coche une à une (DESIGN.md « Onboarding »). */
export function SceneQuestions() {
  const ref = useScene((_root, part, timeline) => {
    timeline
      .from(part("row"), {
        y: 28,
        opacity: 0,
        duration: ONBOARD.rowDuration,
        stagger: ONBOARD.rowStagger,
        ease: "power3.out",
        clearProps: SCENE_CLEAR,
      })
      .from(
        part("check"),
        { strokeDashoffset: 1, duration: ONBOARD.checkDuration, stagger: ONBOARD.checkStagger, ease: "power2.out" },
        ">-0.1",
      );
  });

  return (
    <svg
      ref={ref}
      role="img"
      aria-label="Trois questions cochées l'une après l'autre : ce que vous vendez, ce que ça coûte, vos charges"
      viewBox="0 0 320 280"
      className="h-full max-h-72 w-full"
    >
      {ROWS.map((row, index) => {
        const middle = row.y + 28;
        return (
          <g key={row.y} data-part="row">
            <rect x="32" y={row.y} width="256" height="56" rx="16" className="fill-card" />
            <circle cx="64" cy={middle} r="16" className="fill-primary" />
            <text x="64" y={middle + 6} textAnchor="middle" className="fill-primary-foreground text-base font-semibold">
              {index + 1}
            </text>
            <rect x="94" y={middle - 12} width={row.title} height="8" rx="4" className="fill-foreground/70" />
            <rect x="94" y={middle + 4} width={row.subtitle} height="8" rx="4" className="fill-border" />
            <circle cx="258" cy={middle} r="14" className="fill-positive" />
            <path
              data-part="check"
              d={`M 251 ${middle} l 5 5 l 10 -11`}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="0"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-primary-foreground"
            />
          </g>
        );
      })}
    </svg>
  );
}
