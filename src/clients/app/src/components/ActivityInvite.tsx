import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { sharedTotalOf } from "../lib/stores";
import { useActivityCharges, usePrices, useSettings, useStores } from "../lib/storeContext";

/** Dès le deuxième produit : proposer de saisir ses charges une seule fois (E10). Une fois écartée, elle ne revient pas. */
export function ActivityInvite() {
  const stores = useStores();
  const pricesCount = usePrices((state) => state.prices.length);
  const hasCharges = useActivityCharges((state) => sharedTotalOf(state.charges) > 0);
  const dismissed = useSettings((state) => state.tipsSeen.includes("activite-invite"));
  if (pricesCount < 2 || hasCharges || dismissed) return null;

  return (
    <section aria-label="Vous avez plusieurs produits" className="grid gap-4 rounded-3xl bg-card p-6">
      <p className="text-xl font-light">Vous avez plusieurs produits.</p>
      <p className="text-muted-foreground">Voulez-vous saisir vos charges une seule fois, pour toute votre activité ?</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild className="h-12 rounded-full px-6 text-base">
          <Link to="/activite">Saisir mes charges</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => stores.settings.getState().markTip("activite-invite")}
          className="h-12 rounded-full px-6 text-base"
        >
          Plus tard
        </Button>
      </div>
    </section>
  );
}
