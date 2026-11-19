import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { HomeStall } from "../components/HomeStall";
import { PageHeader } from "../components/PageHeader";
import { PriceCarousel } from "../components/PriceCarousel";
import { Reveal } from "../components/Reveal";
import { ResumeCard } from "../components/ResumeCard";
import { TipCarousel } from "../components/TipCarousel";
import { tipsFrom } from "../content/comprendre";
import { findActivity } from "../lib/activity";
import { chargesTotalOf, directTotalOf } from "../lib/model";
import { useCalc, usePrices, useStores } from "../lib/storeContext";
import type { SavedPrice } from "../lib/stores";

const LAST_PRICES_COUNT = 3;

/** Accueil (E01) : mener à un calcul en un appui et retrouver son travail. */
export function AccueilPage() {
  const stores = useStores();
  const navigate = useNavigate();
  const calcul = useCalc((state) => state.calcul);
  const prices = usePrices((state) => state.prices);
  const latest = prices.slice(0, LAST_PRICES_COUNT);
  const tips = useMemo(() => tipsFrom(new Date()), []);

  const filled = [directTotalOf(calcul), chargesTotalOf(calcul), calcul.volume].filter((value) => value !== null).length;
  const started = filled > 0 || calcul.nom.trim() !== "";

  function startNew(testOwnPrice: boolean): void {
    const draft = stores.calc.getState();
    draft.reset();
    if (testOwnPrice) draft.setModeResultat("monPrix");
    void navigate("/calculer");
  }

  function openPrice(price: SavedPrice): void {
    stores.calc.getState().load(price.calcul, price.id);
  }

  return (
    <>
      <PageHeader>
        Bonjour, trouvons <span className="font-normal">votre prix</span>
      </PageHeader>

      {started && (
        <ResumeCard
          title={calcul.nom.trim() === "" ? findActivity(calcul.type).label : calcul.nom.trim()}
          filled={filled}
        />
      )}

      <section aria-label="Calculer" className="overflow-hidden rounded-3xl bg-muted">
        <HomeStall price={latest[0]?.prixConseille ?? null} />
        <div className="flex flex-wrap gap-3 p-5">
          <Button type="button" onClick={() => startNew(false)} className="h-12 rounded-full px-6 text-base">
            Calculer un prix
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => startNew(true)}
            className="h-12 rounded-full bg-card px-6 text-base hover:bg-card/70"
          >
            Tester mon prix actuel
          </Button>
        </div>
      </section>

      <Reveal as="section" aria-label="Mes derniers prix" beat={3} className="grid gap-4">
        <h2 className="text-xl font-light">Mes derniers prix</h2>
        {latest.length === 0 ? (
          <div className="grid justify-items-start gap-2 rounded-3xl bg-card p-6">
            <p className="text-muted-foreground">
              Aucun prix enregistré pour l'instant. Calculez le premier : trois nombres suffisent.
            </p>
            <Link
              to="/exemple"
              className="inline-flex min-h-11 items-center rounded-md underline underline-offset-4 outline-offset-4 focus-visible:outline-3 focus-visible:outline-ring"
            >
              Voir la visite guidée
            </Link>
          </div>
        ) : (
          <PriceCarousel prices={latest} onOpen={openPrice} />
        )}
      </Reveal>

      <Reveal as="section" aria-label="Le conseil du moment" beat={4} className="rounded-3xl bg-card p-8">
        <TipCarousel tips={tips} />
      </Reveal>
    </>
  );
}
