import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityInvite } from "../components/ActivityInvite";
import { PageHeader } from "../components/PageHeader";
import { HomeStall } from "../components/HomeStall";
import { SavedPriceList } from "../components/SavedPriceList";
import { usePrices, useStores } from "../lib/storeContext";
import type { SavedPrice } from "../lib/stores";

/** Un nombre de prix à partir duquel une recherche devient utile (docs/15 E09). */
const SEARCH_THRESHOLD = 6;
/** Délai pour annuler une suppression : pas de fenêtre bloquante (docs/15 E09). */
const UNDO_DELAY_MS = 6000;

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

      <ActivityInvite />

      {prices.length === 0 ? (
        <section aria-label="Aucun prix" className="overflow-hidden rounded-3xl bg-muted">
          <HomeStall price={null} />
          <div className="grid justify-items-start gap-4 p-6">
            <p className="text-xl font-light">Aucun prix enregistré</p>
            <p className="text-muted-foreground">
              Calculez un prix en trois nombres, puis enregistrez-le : vous le retrouverez ici.
            </p>
            <Button asChild className="h-12 rounded-full px-6 text-base">
              <Link to="/calculer">Calculer mon premier prix</Link>
            </Button>
          </div>
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

          <SavedPriceList
            prices={visible}
            onOpen={open}
            onDuplicate={(price) => stores.prices.getState().duplicate(price.id)}
            onRemove={remove}
          />
        </section>
      )}
    </>
  );
}
