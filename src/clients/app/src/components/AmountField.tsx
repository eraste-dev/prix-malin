import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAmount, parseAmount } from "../lib/amount";
import { Reveal } from "./Reveal";

interface AmountFieldProps {
  readonly id: string;
  readonly label: string;
  /** Consigne : lue par les lecteurs d'écran, non affichée (l'exemple la remplace à l'écran). */
  readonly hint?: string;
  /** Exemple clair, montré en filigrane tant que le champ est vide. */
  readonly example?: string;
  readonly unit?: string;
  /** Temps fort de la choregraphie d'entree (voir lib/motion.ts). */
  readonly beat?: number;
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
}

/** Champ numérique entier : clavier numérique, milliers séparés, unité dans le champ à droite. */
export function AmountField({ id, label, hint, example, unit, beat = 0, value, onChange }: AmountFieldProps) {
  const hintId = hint === undefined ? undefined : `${id}-hint`;

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const raw = event.target.value;
    const parsed = parseAmount(raw);
    // Saisie démesurée : on garde la valeur précédente au lieu de vider le champ.
    if (parsed === null && /\d/.test(raw)) return;
    onChange(parsed);
  }

  return (
    <div className="grid gap-2">
      <Reveal as={Label} beat={beat} htmlFor={id} className="text-base font-semibold">
        {label}
      </Reveal>
      {hint !== undefined && (
        <p id={hintId} className="sr-only">
          {hint}
        </p>
      )}
      <Reveal beat={beat} sub={1} className="relative">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-describedby={hintId}
          placeholder={example === undefined ? undefined : `ex. ${example}`}
          value={formatAmount(value)}
          onChange={handleChange}
          className="h-12 rounded-xl pr-20 text-xl tabular-nums md:text-xl"
        />
        {unit !== undefined && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-base text-muted-foreground"
          >
            {unit}
          </span>
        )}
      </Reveal>
    </div>
  );
}
