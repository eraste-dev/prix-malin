import { CircleAlert, CircleCheck, Copy, MoreHorizontal, Trash2, TriangleAlert, type LucideIcon } from "lucide-react";
import type { PriceVerdict } from "@prix-malin/domain";
import { useMemo } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { findActivity } from "../lib/activity";
import { formatAmount, formatPercent } from "../lib/amount";
import { formatDay } from "../lib/dateLabel";
import { LIST, listDelay } from "../lib/motion";
import { computeOutcome } from "../lib/outcome";
import type { SavedPrice } from "../lib/stores";
import { SCENE_CLEAR, useScene } from "../lib/useScene";
import { describeVerdict } from "../lib/verdict";

const VERDICT_ICONS: Readonly<Record<PriceVerdict, LucideIcon>> = {
  LOSS_PER_SALE: TriangleAlert,
  FIXED_COSTS_NOT_COVERED: CircleAlert,
  PROFITABLE: CircleCheck,
};

interface SavedPriceListProps {
  readonly prices: readonly SavedPrice[];
  readonly onOpen: (price: SavedPrice) => void;
  readonly onDuplicate: (price: SavedPrice) => void;
  readonly onRemove: (price: SavedPrice) => void;
}

/** Liste des prix enregistrés : les étiquettes s'accrochent l'une après l'autre à l'arrivée, une seule fois. */
export function SavedPriceList({ prices, onOpen, onDuplicate, onRemove }: SavedPriceListProps) {
  const ref = useScene<HTMLUListElement>((_root, part, timeline) => {
    timeline.from(part("row"), {
      y: -LIST.dropPx,
      rotation: -LIST.tiltDeg,
      opacity: 0,
      transformOrigin: "24px 0",
      duration: LIST.duration,
      delay: (index: number) => listDelay(index),
      ease: "back.out(1.4)",
      clearProps: `${SCENE_CLEAR}`,
    });
  });

  return (
    <ul ref={ref} className="grid list-none gap-3 p-0">
      {prices.map((price) => (
        <li key={price.id} data-part="row" data-price-id={price.id}>
          <PriceCard
            price={price}
            onOpen={() => onOpen(price)}
            onDuplicate={() => onDuplicate(price)}
            onRemove={() => onRemove(price)}
          />
        </li>
      ))}
    </ul>
  );
}

interface PriceCardProps {
  readonly price: SavedPrice;
  readonly onOpen: () => void;
  readonly onDuplicate: () => void;
  readonly onRemove: () => void;
}

/** Une carte : nom et menu en tête, puis l'étiquette de prix à gauche, et à droite type, marge, verdict, date. */
function PriceCard({ price, onOpen, onDuplicate, onRemove }: PriceCardProps) {
  const outcome = useMemo(() => computeOutcome(price.calcul), [price.calcul]);
  const data = "data" in outcome ? outcome.data : null;
  const verdict = price.verdict ?? null;
  const VerdictIcon = verdict === null ? null : VERDICT_ICONS[verdict];
  const name = price.nom === "" ? "Sans nom" : price.nom;

  return (
    <div className="grid gap-3 rounded-3xl bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-xl font-light">
          <Link
            to="/calculer"
            onClick={onOpen}
            className="rounded-md outline-offset-4 focus-visible:outline-3 focus-visible:outline-ring"
          >
            {name}
          </Link>
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Actions pour ${name}`}
              className="-mr-2 size-12 shrink-0 rounded-full"
            >
              <MoreHorizontal className="size-5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-base">
            <DropdownMenuItem onSelect={onDuplicate} className="min-h-11 text-base">
              <Copy className="size-4" aria-hidden="true" />
              Dupliquer
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onRemove} className="min-h-11 text-base">
              <Trash2 className="size-4" aria-hidden="true" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-stretch gap-4">
        <PriceTag amount={price.prixConseille} />
        <div className="grid min-w-0 content-center gap-1 text-muted-foreground">
          <p>{findActivity(price.calcul.type).label}</p>
          {data !== null && <p className="tabular-nums">Marge {formatPercent(data.markupRate * 100)} %</p>}
          {VerdictIcon !== null && verdict !== null && data !== null && (
            <p className="inline-flex items-center gap-1">
              <VerdictIcon className="size-4 shrink-0" aria-hidden="true" />
              {describeVerdict(verdict, data).title}
            </p>
          )}
          <p>{formatDay(price.modifieLe)}</p>
        </div>
      </div>
    </div>
  );
}

/** L'étiquette de prix : fond teinté, œillet rond à gauche comme une vraie étiquette, le prix et son unité. */
function PriceTag({ amount }: { readonly amount: number }) {
  return (
    <div
      data-testid="price-tag"
      className="relative grid shrink-0 content-center rounded-2xl bg-muted py-3 pr-4 pl-8 text-right"
    >
      <span aria-hidden="true" className="absolute top-1/2 left-3 size-2.5 -translate-y-1/2 rounded-full bg-card" />
      <p className="text-3xl font-normal tabular-nums">{formatAmount(amount)}</p>
      <p className="text-base text-muted-foreground">F CFA</p>
    </div>
  );
}
