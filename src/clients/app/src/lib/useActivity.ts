import { useState } from "react";
import {
  DEFAULT_ACTIVITY_ID,
  findActivity,
  type Activity,
  type ActivityId,
} from "./activity";

export interface ActivityState {
  readonly activity: Activity;
  readonly marginPct: number;
  readonly feePct: number;
  /** Type en attente de confirmation (EXG-03), ou `null`. */
  readonly pending: Activity | null;
  readonly setMarginPct: (value: number) => void;
  readonly setFeePct: (value: number) => void;
  /** Change de type tout de suite, ou demande confirmation si marge ou frais ont été ajustés. */
  readonly requestChange: (id: ActivityId) => void;
  readonly confirmChange: () => void;
  readonly cancelChange: () => void;
}

/** Type d'activité + réglages qui en dépendent. Les montants saisis ne sont jamais touchés ici. */
export function useActivity(): ActivityState {
  const initial = findActivity(DEFAULT_ACTIVITY_ID);
  const [activity, setActivity] = useState<Activity>(initial);
  const [marginPct, setMarginPct] = useState<number>(initial.marginPct);
  const [feePct, setFeePct] = useState<number>(initial.feePct);
  const [pending, setPending] = useState<Activity | null>(null);

  const isAdjusted = marginPct !== activity.marginPct || feePct !== activity.feePct;

  function apply(next: Activity): void {
    setActivity(next);
    setMarginPct(next.marginPct);
    setFeePct(next.feePct);
  }

  function requestChange(id: ActivityId): void {
    if (id === activity.id) return;
    const next = findActivity(id);
    if (isAdjusted) setPending(next);
    else apply(next);
  }

  function confirmChange(): void {
    if (pending !== null) apply(pending);
    setPending(null);
  }

  return {
    activity,
    marginPct,
    feePct,
    pending,
    setMarginPct,
    setFeePct,
    requestChange,
    confirmChange,
    cancelChange: () => setPending(null),
  };
}
