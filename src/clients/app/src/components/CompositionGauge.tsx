import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatMoney, formatPercent } from "../lib/amount";
import type { CompositionPart, PartKey } from "../lib/composition";
import { ARC, RESULT_BEAT, motionAllowed } from "../lib/motion";
import { Reveal } from "./Reveal";

/* Demi-cercle de 180° : rayon 80, centre (100, 100), tracé de gauche à droite par le haut. */
const ARC_PATH = "M 20 100 A 80 80 0 0 1 180 100";
/** Écart entre deux arcs, en % de la longueur totale (`pathLength` = 100). */
const ARC_GAP = 1.2;

interface ArcFrame {
  readonly dash: string;
  readonly offset: number;
}

/**
 * Couleurs ciblées sur la carte blanche, toutes ≥ 3 contre le fond (contrast.test.ts) : les coûts en encre
 * et ses nuances, la marge seule en `positive`. Jamais la couleur seule : la légende dit tout.
 */
const ARC_STROKE: Readonly<Record<PartKey, string>> = {
  direct: "stroke-foreground",
  fixed: "stroke-muted-foreground",
  fee: "stroke-foreground/50",
  margin: "stroke-positive",
};

const DOT_FILL: Readonly<Record<PartKey, string>> = {
  direct: "bg-foreground",
  fixed: "bg-muted-foreground",
  fee: "bg-foreground/50",
  margin: "bg-positive",
};

/** Longueur dessinée d'un arc : sa part moins l'écart ; une part minuscule reste visible, sans écart. */
function drawnLength(share: number): number {
  return share > ARC_GAP * 2 ? share - ARC_GAP : share * 0.5;
}

interface CompositionGaugeProps {
  readonly parts: readonly CompositionPart[];
}

/** Demi-cercle de composition du prix (docs/15 E06, 4) : d'où vient chaque franc, la marge au centre. */
export function CompositionGauge({ parts }: CompositionGaugeProps) {
  const margin = parts.find((part) => part.key === "margin");
  const marginShare = margin === undefined ? 0 : margin.share;
  const summary = parts.map((part) => `${part.label.toLowerCase()} ${formatMoney(part.amount)} F`).join(", ");

  let start = 0;
  const arcs = parts.map((part) => {
    const length = drawnLength(part.share);
    const arc = { part, dash: `${length} ${100 - length}`, offset: -start };
    start += part.share;
    return arc;
  });

  /*
   * Animation (GSAP, ADR-0011). Les attributs ci-dessus portent l'état final : sans animation, rien d'autre à faire.
   * À l'apparition, chaque arc se dessine à son tour ; quand la marge ou les frais changent, il glisse de son
   * ancienne forme à la nouvelle. `priorFrames` est lu au rendu (et non dans l'effet) : le mode strict de React
   * rejoue les effets, ce qui ne doit pas faire croire qu'un arc existait déjà.
   */
  const svgRef = useRef<SVGSVGElement>(null);
  const frames = new Map<string, ArcFrame>(arcs.map((arc) => [arc.part.key, { dash: arc.dash, offset: arc.offset }]));
  const lastFrames = useRef<ReadonlyMap<string, ArcFrame>>(new Map());
  const priorFrames = lastFrames.current;
  const signature = arcs.map((arc) => `${arc.part.key}:${arc.dash}:${arc.offset}`).join("|");

  useGSAP(
    () => {
      if (!motionAllowed() || svgRef.current === null) return;
      const paths = svgRef.current.querySelectorAll<SVGPathElement>("[data-part]");
      paths.forEach((path, index) => {
        const key = path.dataset.part ?? "";
        const next = frames.get(key);
        const prior = priorFrames.get(key);
        if (next === undefined) return;
        if (prior === undefined) {
          gsap.from(path, {
            attr: { "stroke-dasharray": "0 100" },
            duration: ARC.drawDuration,
            delay: index * ARC.stagger,
            ease: "power3.out",
          });
        } else if (prior.dash !== next.dash || prior.offset !== next.offset) {
          gsap.fromTo(
            path,
            { attr: { "stroke-dasharray": prior.dash, "stroke-dashoffset": prior.offset } },
            {
              attr: { "stroke-dasharray": next.dash, "stroke-dashoffset": next.offset },
              duration: ARC.slideDuration,
              ease: "power2.out",
              overwrite: "auto",
            },
          );
        }
      });
    },
    { dependencies: [signature], scope: svgRef },
  );
  useEffect(() => {
    lastFrames.current = frames;
  });

  return (
    <Reveal beat={RESULT_BEAT.composition} data-testid="composition-block" className="grid gap-6">
      <div
        data-testid="composition"
        role="img"
        aria-label={`Composition du prix : ${summary} ; marge ${formatPercent(marginShare)} % du prix`}
        className="relative mx-auto w-full max-w-72"
      >
        <svg ref={svgRef} viewBox="0 0 200 100" className="block h-auto w-full" aria-hidden="true" focusable="false">
          <path d={ARC_PATH} pathLength={100} fill="none" strokeWidth={18} className="stroke-border" />
          {arcs.map(({ part, dash, offset }) => (
            <path
              key={part.key}
              data-part={part.key}
              data-share={part.share}
              d={ARC_PATH}
              pathLength={100}
              fill="none"
              strokeWidth={18}
              strokeDasharray={dash}
              strokeDashoffset={offset}
              className={ARC_STROKE[part.key]}
            />
          ))}
        </svg>
        <div
          data-testid="composition-center"
          className="absolute inset-x-0 bottom-0 grid justify-items-center leading-none"
        >
          <span className="text-5xl font-light tabular-nums">{formatPercent(marginShare)} %</span>
          <span className="mt-2 text-base text-muted-foreground">de marge</span>
        </div>
      </div>
      <ul aria-label="Composition du prix" className="grid list-none gap-2 p-0">
        {parts.map((part) => (
          <li key={part.key} className="flex items-center gap-3">
            <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-full", DOT_FILL[part.key])} />
            <span className="flex-1">{part.label}</span>
            <span className="text-muted-foreground tabular-nums">{formatPercent(part.share)} %</span>
            <span className="min-w-20 text-right font-semibold tabular-nums">{formatMoney(part.amount)} F</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
