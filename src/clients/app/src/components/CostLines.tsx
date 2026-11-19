import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "../lib/amount";
import type { CostLineItem } from "../lib/model";
import { AmountField } from "./AmountField";
import { DecimalField } from "./DecimalField";
import { TextField } from "./TextField";

interface CostLinesProps {
  readonly lines: readonly CostLineItem[];
  readonly suggestions: readonly string[];
  /** Total par vente, ou `null` tant qu'aucune ligne n'existe. */
  readonly total: number | null;
  /** La ligne qu'on vient d'ajouter : son montant reçoit le curseur. */
  readonly focusId: string | null;
  readonly onAdd: (label?: string) => void;
  readonly onUpdate: (id: string, patch: Partial<Omit<CostLineItem, "id">>) => void;
  readonly onRemove: (id: string) => void;
}

/** Coût direct en détail : une ligne par dépense (quantité × prix), avec des suggestions à ajouter d'un appui (docs/15 E03). */
export function CostLines({ lines, suggestions, total, focusId, onAdd, onUpdate, onRemove }: CostLinesProps) {
  return (
    <div className="grid gap-4">
      <ul className="grid list-none gap-4 p-0">
        {lines.map((line, index) => {
          const rank = index + 1;
          return (
            <li key={line.id} className="grid gap-4 rounded-2xl bg-muted/60 p-4">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <TextField
                    id={`cost-label-${line.id}`}
                    label={`Libellé de la ligne ${rank}`}
                    labelHidden
                    placeholder="ex. Matières premières"
                    value={line.label}
                    onChange={(label) => onUpdate(line.id, { label })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Supprimer la ligne ${rank}`}
                  onClick={() => onRemove(line.id)}
                  className="size-12 shrink-0 rounded-xl"
                >
                  <Trash2 className="size-5" aria-hidden="true" />
                </Button>
              </div>
              <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3">
                <DecimalField
                  id={`cost-qty-${line.id}`}
                  label={`Quantité de la ligne ${rank}`}
                  value={line.quantity}
                  onChange={(quantity) => onUpdate(line.id, { quantity })}
                />
                <AmountField
                  id={`cost-price-${line.id}`}
                  label={`Prix unitaire de la ligne ${rank}`}
                  labelHidden
                  unit="FCFA"
                  autoFocus={focusId === line.id}
                  value={line.unitPrice === 0 ? null : line.unitPrice}
                  onChange={(unitPrice) => onUpdate(line.id, { unitPrice: unitPrice ?? 0 })}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((label) => (
          <Button
            key={label}
            type="button"
            variant="outline"
            onClick={() => onAdd(label)}
            className="h-11 rounded-full px-4 text-base"
          >
            + {label}
          </Button>
        ))}
        <Button type="button" variant="outline" onClick={() => onAdd()} className="h-11 rounded-full px-4 text-base">
          <Plus className="size-4" aria-hidden="true" />
          Ajouter une ligne
        </Button>
      </div>

      {total !== null && (
        <p className="flex justify-between gap-4 font-semibold">
          <span>Coût par vente</span>
          <span data-testid="cost-total" className="tabular-nums">
            {formatMoney(total)} F
          </span>
        </p>
      )}
    </div>
  );
}
