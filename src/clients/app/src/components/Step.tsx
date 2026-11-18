import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StepKey, StepStatus } from "../lib/steps";
import { Reveal } from "./Reveal";

interface StepProps {
  readonly stepKey: StepKey;
  readonly title: string;
  readonly status: StepStatus;
  /** Temps fort d'entrée de la chorégraphie (voir lib/motion.ts). */
  readonly beat: number;
  readonly children: ReactNode;
}

/** Une section de l'écran Calculer. Le rond qui y mène est dans le rail fixe (`StepRail`). */
export function Step({ stepKey, title, status, beat, children }: StepProps) {
  return (
    <Reveal
      as="section"
      variant="fade"
      beat={beat}
      id={`step-${stepKey}`}
      data-step={stepKey}
      data-status={status}
      aria-labelledby={`step-${stepKey}-title`}
      className="grid scroll-mt-6 content-start gap-4"
    >
      <h2
        id={`step-${stepKey}-title`}
        className={cn("text-xl font-light", status === "locked" && "text-muted-foreground")}
      >
        {title}
      </h2>
      {children}
    </Reveal>
  );
}
