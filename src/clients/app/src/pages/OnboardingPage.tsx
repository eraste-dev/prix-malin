import { ListChecks, Lock, Receipt, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "../components/Reveal";
import { ONBOARDING_CARDS, type OnboardingCard } from "../content/onboarding";
import { useStores } from "../lib/storeContext";

const ICONS: Readonly<Record<OnboardingCard["icon"], LucideIcon>> = {
  receipt: Receipt,
  steps: ListChecks,
  lock: Lock,
};

/** Présentation en trois cartes (docs/14) : courte, passable à tout moment, sans rien demander. */
export function OnboardingPage() {
  const stores = useStores();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const card = ONBOARDING_CARDS[index] ?? ONBOARDING_CARDS[0];
  const last = index === ONBOARDING_CARDS.length - 1;
  if (card === undefined) return null;
  const Icon = ICONS[card.icon];

  function skip(): void {
    stores.settings.getState().markOnboardingSeen();
    void navigate("/", { replace: true });
  }

  function startOwn(): void {
    stores.settings.getState().markOnboardingSeen();
    stores.calc.getState().reset();
    void navigate("/calculer", { replace: true });
  }

  function showExample(): void {
    stores.settings.getState().markOnboardingSeen();
    void navigate("/exemple");
  }

  return (
    <main className="mx-auto grid min-h-dvh max-w-xl grid-rows-[auto_1fr_auto] gap-8 px-5 pt-6 pb-8">
      <div className="flex justify-end">
        <Button type="button" variant="ghost" onClick={skip} className="h-12 rounded-full px-5 text-base">
          Passer
        </Button>
      </div>

      <Reveal key={index} variant="fade" beat={0} className="grid content-center justify-items-start gap-6">
        <span className="grid size-16 place-items-center rounded-full bg-card">
          <Icon className="size-8" aria-hidden="true" />
        </span>
        <h1 className="text-4xl leading-tight font-light">{card.title}</h1>
        <p className="text-xl text-muted-foreground">{card.message}</p>
      </Reveal>

      <div className="grid gap-6">
        <ol aria-label={`Carte ${index + 1} sur ${ONBOARDING_CARDS.length}`} className="flex list-none gap-2 p-0">
          {ONBOARDING_CARDS.map((item, position) => (
            <li
              key={item.title}
              aria-hidden="true"
              className={position === index ? "h-2 w-8 rounded-full bg-foreground" : "h-2 w-2 rounded-full bg-border"}
            />
          ))}
        </ol>
        {last ? (
          <div className="grid gap-3">
            <Button type="button" onClick={startOwn} className="h-14 rounded-full text-lg">
              Calculer mon prix
            </Button>
            <Button type="button" variant="outline" onClick={showExample} className="h-14 rounded-full text-lg">
              Voir un exemple d'abord
            </Button>
          </div>
        ) : (
          <Button type="button" onClick={() => setIndex(index + 1)} className="h-14 rounded-full text-lg">
            Suivant
          </Button>
        )}
        {index > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIndex(index - 1)}
            className="h-12 rounded-full text-base"
          >
            Retour
          </Button>
        )}
      </div>
    </main>
  );
}
