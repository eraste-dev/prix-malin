import type { PriceBreakdown, PriceVerdict } from "@prix-malin/domain";
import { CircleAlert, CircleCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeVerdict } from "../lib/verdict";

/** Une icône ET un texte pour chaque verdict : jamais la couleur seule (RES-04). */
const ICONS: Readonly<Record<PriceVerdict, LucideIcon>> = {
  LOSS_PER_SALE: TriangleAlert,
  FIXED_COSTS_NOT_COVERED: CircleAlert,
  PROFITABLE: CircleCheck,
};

interface VerdictProps {
  readonly verdict: PriceVerdict;
  readonly data: PriceBreakdown;
}

export function Verdict({ verdict, data }: VerdictProps) {
  const Icon = ICONS[verdict];
  const { title, sentence } = describeVerdict(verdict, data);
  return (
    <section
      aria-label="Verdict"
      data-verdict={verdict}
      className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-2xl bg-muted p-4"
    >
      <Icon
        className={cn("mt-0.5 size-6", verdict === "PROFITABLE" ? "text-positive" : "text-foreground")}
        aria-hidden="true"
      />
      <p data-testid="verdict-title" className="font-semibold">
        {title}
      </p>
      <p className="col-start-2 text-muted-foreground">{sentence}</p>
    </section>
  );
}
