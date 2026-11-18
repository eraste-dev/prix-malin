import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { STEP, motionAllowed } from "../lib/motion";
import { STEP_KEYS, type StepKey, type StepStatus } from "../lib/steps";

interface StepRailProps {
  readonly titles: Readonly<Record<StepKey, string>>;
  readonly statuses: Readonly<Record<StepKey, StepStatus>>;
  /** Une phrase par étape : ce qui est fait ou à faire (info-bulle et description accessible). */
  readonly summaries: Readonly<Record<StepKey, string>>;
}

/** Teintes neutres (gris, blanc, noir) ; seule l'étape en cours prend la couleur primaire. */
const NODE_CLASS: Readonly<Record<StepStatus, string>> = {
  locked: "bg-muted text-muted-foreground",
  available: "bg-card text-foreground ring-1 ring-foreground/30",
  current: "bg-primary text-primary-foreground",
  done: "bg-foreground text-background",
};

/** Seule l'étape en cours est grande : les autres se font discrètes. */
const NODE_SIZE: Readonly<Record<StepStatus, string>> = {
  locked: "size-6",
  available: "size-6",
  current: "size-9",
  done: "size-6",
};

/** Faire défiler jusqu'à l'étape, sans animation si l'utilisateur a demandé de réduire les animations. */
function scrollToStep(key: StepKey): void {
  document
    .getElementById(`step-${key}`)
    ?.scrollIntoView?.({ behavior: motionAllowed() ? "smooth" : "auto", block: "start" });
}

interface StepNodeProps {
  readonly status: StepStatus;
  readonly position: number;
}

/** Le rond : il rebondit à chaque changement d'état (déblocage, étape en cours, étape faite). */
function StepNode({ status, position }: StepNodeProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!motionAllowed() || ref.current === null) return;
      gsap.from(ref.current, {
        scale: 0.5,
        opacity: 0,
        duration: STEP.popDuration,
        ease: "back.out(2)",
        clearProps: "transform,opacity",
      });
    },
    { dependencies: [status], scope: ref },
  );

  return (
    <span
      ref={ref}
      className={cn(
        "grid place-items-center rounded-full text-base font-semibold",
        NODE_SIZE[status],
        NODE_CLASS[status],
      )}
    >
      {status === "done" && <Check className="size-3.5" aria-hidden="true" />}
      {status === "current" && position}
    </span>
  );
}

interface ConnectorProps {
  readonly to: StepKey;
  readonly filled: boolean;
}

/**
 * Le trait vers l'étape suivante : il se remplit de haut en bas quand elle se débloque.
 * L'état final est posé en ligne (visible sans animation) ; GSAP ne fait que l'atteindre.
 * `priorFilled` est lu au rendu : le mode strict de React rejoue les effets sans fausser « avant ».
 */
function Connector({ to, filled }: ConnectorProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const lastFilled = useRef(filled);
  const priorFilled = lastFilled.current;

  useGSAP(
    () => {
      if (!motionAllowed() || ref.current === null || priorFilled === filled) return;
      gsap.fromTo(
        ref.current,
        { scaleY: filled ? 0 : 1 },
        { scaleY: filled ? 1 : 0, duration: STEP.lineDuration, ease: "power2.out", overwrite: "auto" },
      );
    },
    { dependencies: [filled], scope: ref },
  );
  useEffect(() => {
    lastFilled.current = filled;
  });

  return (
    <span
      ref={ref}
      data-connector-to={to}
      data-filled={filled}
      style={{ transform: `scaleY(${filled ? 1 : 0})` }}
      className="absolute inset-0 origin-top bg-foreground"
    />
  );
}

/**
 * Rail vertical **fixe**, centré à mi-hauteur de l'écran : il ne défile pas avec les sections.
 * Chaque rond montre l'état de son étape, y mène d'un appui et résume l'étape au survol ou au focus.
 */
export function StepRail({ titles, statuses, summaries }: StepRailProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <nav
        aria-label="Progression"
        className="fixed top-1/2 left-[max(1.25rem,calc(50vw-16.75rem))] z-20 -translate-y-1/2"
      >
        <ol aria-label="Étapes" className="grid list-none p-0">
          {STEP_KEYS.map((key, position) => {
            const status = statuses[key];
            const nextKey = STEP_KEYS[position + 1];
            const summaryId = `step-${key}-summary`;
            return (
              <li key={key} className="relative flex flex-col items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={status === "locked"}
                      aria-label={`Aller à l'étape ${position + 1} : ${titles[key]}`}
                      aria-describedby={summaryId}
                      aria-current={status === "current" ? "step" : undefined}
                      onClick={() => scrollToStep(key)}
                      className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full outline-offset-2 focus-visible:outline-3 focus-visible:outline-ring disabled:cursor-not-allowed"
                    >
                      <StepNode status={status} position={position + 1} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={8}
                    className="max-w-64 text-base motion-reduce:animate-none"
                  >
                    {summaries[key]}
                  </TooltipContent>
                </Tooltip>
                <span id={summaryId} className="sr-only">
                  {summaries[key]}
                </span>
                {nextKey !== undefined && (
                  <span aria-hidden="true" className="relative h-6 w-0.5 overflow-hidden rounded-full bg-border">
                    <Connector to={nextKey} filled={statuses[nextKey] !== "locked"} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </TooltipProvider>
  );
}
