import { useState } from "react";
import { findActivity, type Activity, type ActivityId } from "./activity";
import { isCalculModified } from "./model";
import { useCalc, useStores } from "./storeContext";

export interface ActivityState {
  readonly activity: Activity;
  readonly marginPct: number;
  readonly feePct: number;
  /** Type en attente de confirmation (EXG-03), ou `null`. */
  readonly pending: Activity | null;
  readonly setMarginPct: (value: number) => void;
  readonly setFeePct: (value: number) => void;
  /** Change de type tout de suite, ou demande confirmation si marge, frais, arrondi ou TVA ont été réglés. */
  readonly requestChange: (id: ActivityId) => void;
  readonly confirmChange: () => void;
  readonly cancelChange: () => void;
}

/** Type d'activité du brouillon et réglages qui en dépendent. Les montants saisis ne sont jamais touchés ici. */
export function useActivity(): ActivityState {
  const stores = useStores();
  const calcul = useCalc((state) => state.calcul);
  const [pending, setPending] = useState<Activity | null>(null);

  function apply(next: Activity): void {
    stores.calc.getState().setType(next.id);
    stores.settings.getState().setLastActivity(next.id);
  }

  function requestChange(id: ActivityId): void {
    if (id === calcul.type) return;
    const next = findActivity(id);
    if (isCalculModified(calcul)) setPending(next);
    else apply(next);
  }

  function confirmChange(): void {
    if (pending !== null) apply(pending);
    setPending(null);
  }

  return {
    activity: findActivity(calcul.type),
    marginPct: calcul.marge,
    feePct: calcul.frais,
    pending,
    setMarginPct: (value) => stores.calc.getState().setMarge(value),
    setFeePct: (value) => stores.calc.getState().setFrais(value),
    requestChange,
    confirmChange,
    cancelChange: () => setPending(null),
  };
}
