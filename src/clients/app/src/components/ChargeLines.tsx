import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoney } from "../lib/amount";
import { CHARGE_PRESETS, REMUNERATION_LABEL } from "../lib/charges";
import type { ChargeLineItem } from "../lib/model";
import { AmountField } from "./AmountField";
import { TextField } from "./TextField";

interface ChargeLinesProps {
  readonly lines: readonly ChargeLineItem[];
  /** Total du mois, ou `null` tant qu'aucune charge n'est cochée. */
  readonly total: number | null;
  /** La ligne qu'on vient d'ajouter : son montant reçoit le curseur. */
  readonly focusId: string | null;
  readonly onTogglePreset: (label: string) => void;
  readonly onAddCustom: () => void;
  readonly onUpdate: (id: string, patch: Partial<Omit<ChargeLineItem, "id">>) => void;
  readonly onRemove: (id: string) => void;
}

/** Charges du mois en détail : pastilles à cocher, un montant par charge cochée, « Ma rémunération » en tête (docs/15 E04). */
export function ChargeLines({
  lines,
  total,
  focusId,
  onTogglePreset,
  onAddCustom,
  onUpdate,
  onRemove,
}: ChargeLinesProps) {
  const isPreset = (label: string): boolean => CHARGE_PRESETS.includes(label);
  let customRank = 0;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {CHARGE_PRESETS.map((label) => {
          const pressed = lines.some((line) => line.label === label);
          return (
            <Button
              key={label}
              type="button"
              variant="outline"
              aria-pressed={pressed}
              onClick={() => onTogglePreset(label)}
              className={cn(
                "h-11 rounded-full px-4 text-base",
                label === REMUNERATION_LABEL && !pressed && "border-primary text-primary",
                pressed && "border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background",
              )}
            >
              {label}
            </Button>
          );
        })}
        <Button type="button" variant="outline" onClick={onAddCustom} className="h-11 rounded-full px-4 text-base">
          <Plus className="size-4" aria-hidden="true" />
          Autre charge
        </Button>
      </div>

      <ul className="grid list-none gap-4 p-0">
        {lines.map((line) => {
          const custom = !isPreset(line.label);
          if (custom) customRank += 1;
          const name = line.label === "" ? `charge ${customRank}` : line.label;
          return (
            <li key={line.id} className="grid gap-4 rounded-2xl bg-muted/60 p-4">
              {custom && (
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <TextField
                      id={`charge-label-${line.id}`}
                      label={`Nom de la charge ${customRank}`}
                      labelHidden
                      placeholder="ex. Assurance"
                      autoFocus={focusId === line.id}
                      value={line.label}
                      onChange={(label) => onUpdate(line.id, { label })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Supprimer la charge ${customRank}`}
                    onClick={() => onRemove(line.id)}
                    className="size-12 shrink-0 rounded-xl"
                  >
                    <Trash2 className="size-5" aria-hidden="true" />
                  </Button>
                </div>
              )}
              <AmountField
                id={`charge-amount-${line.id}`}
                label={`Montant : ${name}`}
                labelHidden={custom}
                unit="FCFA"
                autoFocus={!custom && focusId === line.id}
                value={line.amount === 0 ? null : line.amount}
                onChange={(amount) => onUpdate(line.id, { amount: amount ?? 0 })}
              />
            </li>
          );
        })}
      </ul>

      {total !== null && (
        <p className="flex justify-between gap-4 font-semibold">
          <span>Charges du mois</span>
          <span data-testid="charges-total" className="tabular-nums">
            {formatMoney(total)} F
          </span>
        </p>
      )}
    </div>
  );
}
