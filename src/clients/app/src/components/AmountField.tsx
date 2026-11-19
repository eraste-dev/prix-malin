import type { ChangeEvent, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
  /** Libellé lu par les lecteurs d'écran seulement (champs répétés d'une liste). */
  readonly labelHidden?: boolean;
  /** Place le curseur dans le champ à son apparition (ligne qu'on vient d'ajouter). */
  readonly autoFocus?: boolean;
  /** Contrôle placé à droite du libellé (ex. bascule Total / Détail), qui passe à la ligne si la place manque. */
  readonly action?: ReactNode;
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
}

/** Champ numérique entier : clavier numérique, milliers séparés, unité dans le champ à droite. */
export function AmountField({
  id,
  label,
  hint,
  example,
  unit,
  beat = 0,
  labelHidden = false,
  autoFocus = false,
  action,
  value,
  onChange,
}: AmountFieldProps) {
  const hintId = hint === undefined ? undefined : `${id}-hint`;

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const raw = event.target.value;
    const parsed = parseAmount(raw);
    // Saisie démesurée : on garde la valeur précédente au lieu de vider le champ.
    if (parsed === null && /\d/.test(raw)) return;
    onChange(parsed);
  }

  return (
    <div className="grid gap-4">
      {labelHidden ? (
        <Label htmlFor={id} className="sr-only">
          {label}
        </Label>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Reveal as={Label} beat={beat} htmlFor={id} className="text-base font-semibold">
            {label}
          </Reveal>
          {action}
        </div>
      )}
      {hint !== undefined && (
        <p id={hintId} className="sr-only">
          {hint}
        </p>
      )}
      <Reveal beat={beat} sub={1} className="relative">
        <Input
          id={id}
          name={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          aria-describedby={hintId}
          placeholder={example === undefined ? undefined : `ex. ${example}`}
          value={formatAmount(value)}
          onChange={handleChange}
          className={cn("h-12 rounded-xl pr-20 text-xl tabular-nums md:text-xl")}
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
