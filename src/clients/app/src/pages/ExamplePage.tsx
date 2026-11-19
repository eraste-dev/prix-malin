import type { Driver } from "driver.js";
import { Compass } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { formatAmount } from "../lib/amount";
import { newCalcul, type Calcul } from "../lib/model";
import { computeOutcome } from "../lib/outcome";
import { memoryStorage } from "../lib/storage";
import { StoreProvider, useStores } from "../lib/storeContext";
import type { AppStores } from "../lib/stores";
import { startTour } from "../lib/tour";
import { CalculerPage } from "./CalculerPage";

/** Le bissap de docs/03 : 450 F. Il vit dans un stockage en mémoire, jamais dans les données de l'utilisateur. */
const EXAMPLE: Calcul = {
  ...newCalcul("making"),
  nom: "Jus de bissap (exemple)",
  unite: "bouteille",
  coutDirect: { mode: "total", total: 210, lignes: [] },
  chargesFixes: { mode: "total", total: 220000, lignes: [], source: "propre" },
  volume: 2000,
  remunerationRappelVu: true,
};

function examplePrice(): number {
  const outcome = computeOutcome(EXAMPLE);
  return "data" in outcome ? outcome.data.priceExclVat : 0;
}

/**
 * Exemple guidé (docs/14) : un calcul déjà rempli, essayable, **séparé** des données de l'utilisateur, et une vraie
 * visite guidée (ADR-0015). Il a ses propres stores en mémoire : rien de ce qu'on y fait n'arrive dans « Mes prix »
 * ni dans le brouillon (ONB-04).
 */
export function ExamplePage() {
  const real = useStores();
  return (
    <StoreProvider storage={memoryStorage()} seed={(stores) => stores.calc.getState().load(EXAMPLE)}>
      <ExampleFrame real={real} />
    </StoreProvider>
  );
}

function ExampleFrame({ real }: { readonly real: AppStores }) {
  const navigate = useNavigate();
  const [closed, setClosed] = useState(false);
  const tour = useRef<Driver | null>(null);
  const mounted = useRef(true);

  // En quittant l'écran, la visite est coupée sans rien déclencher.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      tour.current?.destroy();
    };
  }, []);

  function makeMine(): void {
    real.calc.getState().reset();
    void navigate("/calculer");
  }

  function begin(): void {
    tour.current?.destroy();
    setClosed(false);
    tour.current = startTour(examplePrice(), {
      onDone: () => {
        if (mounted.current) makeMine();
      },
      onClose: () => {
        if (mounted.current) setClosed(true);
      },
    });
  }

  return (
    <>
      <div
        data-testid="example-banner"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-foreground p-4 text-background"
      >
        <p className="font-semibold">Exemple : ces chiffres ne sont pas les vôtres.</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void navigate("/")}
          className="h-11 rounded-full px-4 text-base text-foreground"
        >
          Quitter l'exemple
        </Button>
      </div>

      <section aria-label="Visite guidée" className="grid gap-4 rounded-3xl bg-card p-6">
        <p className="flex items-start gap-3 text-xl font-light">
          <Compass className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          {closed
            ? "Vous pouvez relancer la visite quand vous voulez, ou faire votre propre calcul."
            : `Prenez une minute pour voir comment on arrive à ${formatAmount(examplePrice())} F.`}
        </p>
        <div className="flex flex-wrap gap-2">
          {closed ? (
            <>
              <Button type="button" onClick={begin} className="h-12 rounded-full px-6 text-base">
                Relancer la visite
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={makeMine}
                className="h-12 rounded-full bg-muted px-6 text-base hover:bg-muted/70"
              >
                Faire le mien
              </Button>
            </>
          ) : (
            <Button type="button" onClick={begin} className="h-12 rounded-full px-6 text-base">
              Commencer la visite
            </Button>
          )}
        </div>
      </section>

      <CalculerPage />
    </>
  );
}
