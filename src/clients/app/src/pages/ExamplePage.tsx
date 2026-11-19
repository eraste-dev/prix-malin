import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { formatAmount } from "../lib/amount";
import { newCalcul, type Calcul } from "../lib/model";
import { computeOutcome } from "../lib/outcome";
import { memoryStorage } from "../lib/storage";
import { StoreProvider, useStores } from "../lib/storeContext";
import type { AppStores } from "../lib/stores";
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
 * Exemple guidé (docs/14) : un calcul déjà rempli, essayable, **séparé** des données de l'utilisateur. Il a ses
 * propres stores en mémoire : rien de ce qu'on y fait n'arrive dans « Mes prix » ni dans le brouillon (ONB-04).
 */
export function ExamplePage() {
  const real = useStores();
  return (
    <StoreProvider storage={memoryStorage()} seed={(stores) => stores.calc.getState().load(EXAMPLE)}>
      <ExampleFrame real={real} />
    </StoreProvider>
  );
}

const COACH_STEPS = [
  () => `Voici le prix à viser : ${formatAmount(examplePrice())} F.`,
  () => "Voilà d'où vient ce prix : ce que ça vous coûte, vos charges, votre marge.",
  () => "Changez la marge, regardez le prix bouger.",
  () => "Gardez vos prix pour les retrouver.",
] as const;

function ExampleFrame({ real }: { readonly real: AppStores }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const last = step === COACH_STEPS.length - 1;
  const text = COACH_STEPS[step]?.() ?? "";

  function makeMine(): void {
    real.calc.getState().reset();
    void navigate("/calculer");
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

      <section aria-label="Visite de l'exemple" className="grid gap-4 rounded-3xl bg-card p-6">
        <p className="text-xl font-light">{text}</p>
        <div className="flex flex-wrap gap-2">
          {last ? (
            <Button type="button" onClick={makeMine} className="h-12 rounded-full px-6 text-base">
              Faire le mien
            </Button>
          ) : (
            <Button type="button" onClick={() => setStep(step + 1)} className="h-12 rounded-full px-6 text-base">
              Suivant
            </Button>
          )}
        </div>
      </section>

      <CalculerPage />
    </>
  );
}
