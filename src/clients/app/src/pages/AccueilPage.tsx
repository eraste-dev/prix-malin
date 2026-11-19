import { Lightbulb } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../components/PageHeader";
import { Reveal } from "../components/Reveal";
import { tipOfTheDay } from "../content/comprendre";
import { findActivity } from "../lib/activity";
import { formatAmount } from "../lib/amount";
import { chargesTotalOf, directTotalOf } from "../lib/model";
import { useCalc, usePrices, useStores } from "../lib/storeContext";

const LAST_PRICES_COUNT = 3;

/** Accueil (E01) : mener à un calcul en un appui et retrouver son travail. */
export function AccueilPage() {
  const stores = useStores();
  const navigate = useNavigate();
  const calcul = useCalc((state) => state.calcul);
  const prices = usePrices((state) => state.prices);
  const latest = prices.slice(0, LAST_PRICES_COUNT);
  const tip = useMemo(() => tipOfTheDay(new Date()), []);

  const filled = [directTotalOf(calcul), chargesTotalOf(calcul), calcul.volume].filter((value) => value !== null).length;
  const started = filled > 0 || calcul.nom.trim() !== "";

  function startNew(testOwnPrice: boolean): void {
    const draft = stores.calc.getState();
    draft.reset();
    if (testOwnPrice) draft.setModeResultat("monPrix");
    void navigate("/calculer");
  }

  return (
    <>
      <PageHeader>
        Bonjour, trouvons <span className="font-normal">votre prix</span>
      </PageHeader>

      {started && (
        <Reveal as="section" aria-label="Reprendre" beat={1} className="grid gap-4 rounded-3xl bg-card p-8">
          <div className="grid gap-1">
            <p className="text-xl font-light">
              Reprendre : {calcul.nom.trim() === "" ? findActivity(calcul.type).label : calcul.nom.trim()}
            </p>
            <p className="text-muted-foreground">{filled} sur 3 nombres renseignés</p>
          </div>
          <Button asChild className="h-12 w-fit rounded-full px-6 text-base">
            <Link to="/calculer">Reprendre</Link>
          </Button>
        </Reveal>
      )}

      <Reveal beat={2} className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => startNew(false)} className="h-14 rounded-full px-8 text-lg">
          Calculer un prix
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => startNew(true)}
          className="h-14 rounded-full px-8 text-lg"
        >
          Tester mon prix actuel
        </Button>
      </Reveal>

      <Reveal as="section" aria-label="Mes derniers prix" beat={3} className="grid gap-4">
        <h2 className="text-xl font-light">Mes derniers prix</h2>
        {latest.length === 0 ? (
          <p className="rounded-3xl bg-card p-6 text-muted-foreground">
            Aucun prix enregistré pour l'instant. Calculez le premier : trois nombres suffisent.
          </p>
        ) : (
          <ul aria-label="Derniers prix" className="grid list-none gap-3 p-0">
            {latest.map((price) => (
              <li key={price.id}>
                <Link
                  to="/calculer"
                  onClick={() => stores.calc.getState().load(price.calcul, price.id)}
                  className="flex items-baseline justify-between gap-4 rounded-3xl bg-card p-5 outline-offset-4 focus-visible:outline-3 focus-visible:outline-ring"
                >
                  <span className="truncate text-lg">{price.nom === "" ? "Sans nom" : price.nom}</span>{" "}
                  <span className="shrink-0 text-2xl font-light tabular-nums">
                    {formatAmount(price.prixConseille)} F
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      <Reveal as="section" aria-label="Le conseil du moment" beat={4} className="grid gap-3 rounded-3xl bg-card p-8">
        <p className="flex items-center gap-2 text-muted-foreground">
          <Lightbulb className="size-5" aria-hidden="true" />
          Le conseil du moment
        </p>
        <p className="text-xl font-light">{tip.text}</p>
        <Link
          to={`/comprendre/${tip.slug}`}
          className="w-fit rounded-md text-muted-foreground underline underline-offset-4 outline-offset-4 focus-visible:outline-3 focus-visible:outline-ring"
        >
          En savoir plus
        </Link>
      </Reveal>
    </>
  );
}
