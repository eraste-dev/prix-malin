import { CircleAlert, CircleCheck, Copy, MoreHorizontal, Tag, Trash2, TriangleAlert, type LucideIcon } from "lucide-react";
import type { PriceVerdict } from "@prix-malin/domain";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PageHeader } from "../components/PageHeader";
import { Reveal } from "../components/Reveal";
import { findActivity } from "../lib/activity";
import { formatAmount, formatPercent } from "../lib/amount";
import { formatDay } from "../lib/dateLabel";
import { computeOutcome } from "../lib/outcome";
import { usePrices, useStores } from "../lib/storeContext";
import type { SavedPrice } from "../lib/stores";
import { describeVerdict } from "../lib/verdict";

/** Un nombre de prix à partir duquel une recherche devient utile (docs/15 E09). */
const SEARCH_THRESHOLD = 6;
/** Délai pour annuler une suppression : pas de fenêtre bloquante (docs/15 E09). */
const UNDO_DELAY_MS = 6000;

const VERDICT_ICONS: Readonly<Record<PriceVerdict, LucideIcon>> = {
  LOSS_PER_SALE: TriangleAlert,
  FIXED_COSTS_NOT_COVERED: CircleAlert,
  PROFITABLE: CircleCheck,
};

/** Mes prix (E09) : retrouver, rouvrir, dupliquer, supprimer (avec annulation). */
export function MesPrixPage() {
  const stores = useStores();
  const navigate = useNavigate();
  const prices = usePrices((state) => state.prices);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle === "" ? prices : prices.filter((price) => price.nom.toLowerCase().includes(needle));
  }, [prices, query]);

  function open(price: SavedPrice): void {
    stores.calc.getState().load(price.calcul, price.id);
  }

  function startNew(): void {
    stores.calc.getState().reset();
    void navigate("/calculer");
  }

  function remove(price: SavedPrice): void {
    const removed = stores.prices.getState().remove(price.id);
    if (removed === null) return;
    if (stores.calc.getState().linkedPriceId === price.id) stores.calc.getState().linkTo(null);
    toast("Prix supprimé", {
      duration: UNDO_DELAY_MS,
      action: { label: "Annuler", onClick: () => stores.prices.getState().restore(removed) },
    });
  }

  return (
    <>
      <PageHeader>Mes prix</PageHeader>

      {prices.length === 0 ? (
        <section aria-label="Aucun prix" className="grid justify-items-start gap-4 rounded-3xl bg-card p-8">
          <Tag className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-xl font-light">Aucun prix enregistré</p>
          <p className="text-muted-foreground">
            Calculez un prix en trois nombres, puis enregistrez-le : vous le retrouverez ici.
          </p>
          <Button asChild className="h-12 rounded-full px-6 text-base">
            <Link to="/calculer">Calculer mon premier prix</Link>
          </Button>
        </section>
      ) : (
        <section aria-label="Prix enregistrés" className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground">
              {prices.length === 1
                ? "Un premier prix est enregistré. Calculez-en d'autres pour les comparer."
                : `${prices.length} prix enregistrés`}
            </p>
            <Button type="button" onClick={startNew} className="h-12 rounded-full px-6 text-base">
              Nouveau calcul
            </Button>
          </div>

          {prices.length >= SEARCH_THRESHOLD && (
            <Input
              type="search"
              aria-label="Rechercher un prix"
              placeholder="Rechercher un prix"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 rounded-xl text-base md:text-base"
            />
          )}

          <ul className="grid list-none gap-3 p-0">
            {visible.map((price, index) => (
              <Reveal as="li" key={price.id} beat={Math.min(index, 5)} data-price-id={price.id}>
                <PriceRow
                  price={price}
                  onOpen={() => open(price)}
                  onDuplicate={() => stores.prices.getState().duplicate(price.id)}
                  onRemove={() => remove(price)}
                />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

interface PriceRowProps {
  readonly price: SavedPrice;
  readonly onOpen: () => void;
  readonly onDuplicate: () => void;
  readonly onRemove: () => void;
}

function PriceRow({ price, onOpen, onDuplicate, onRemove }: PriceRowProps) {
  const outcome = useMemo(() => computeOutcome(price.calcul), [price.calcul]);
  const data = "data" in outcome ? outcome.data : null;
  const verdict = price.verdict ?? null;
  const VerdictIcon = verdict === null ? null : VERDICT_ICONS[verdict];

  return (
    <div className="flex items-start gap-2 rounded-3xl bg-card p-5">
      <div className="grid min-w-0 flex-1 gap-1">
        <h2 className="truncate text-xl font-light">
          <Link
            to="/calculer"
            onClick={onOpen}
            className="rounded-md outline-offset-4 focus-visible:outline-3 focus-visible:outline-ring"
          >
            {price.nom === "" ? "Sans nom" : price.nom}
          </Link>
        </h2>
        <p className="text-4xl font-light tabular-nums">
          {formatAmount(price.prixConseille)} <span className="text-base text-muted-foreground">F CFA</span>
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
          <span>{findActivity(price.calcul.type).label}</span>
          {data !== null && <span className="tabular-nums">Marge {formatPercent(data.markupRate * 100)} %</span>}
          {VerdictIcon !== null && verdict !== null && data !== null && (
            <span className="inline-flex items-center gap-1">
              <VerdictIcon className="size-4" aria-hidden="true" />
              {describeVerdict(verdict, data).title}
            </span>
          )}
          <span>{formatDay(price.modifieLe)}</span>
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Actions pour ${price.nom === "" ? "Sans nom" : price.nom}`}
            className="size-12 shrink-0 rounded-full"
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
  );
}
