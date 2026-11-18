import { PillChoice, type PillOption } from "./PillChoice";
import { Reveal } from "./Reveal";

export const MARGIN_OPTIONS: readonly PillOption<number>[] = [
  { value: 10, label: "10 %" },
  { value: 20, label: "20 %" },
  { value: 30, label: "30 %" },
  { value: 40, label: "40 %" },
];

/** Frais de paiement (docs/15 E06) : espèces sans frais, Mobile Money 1 %. */
export const FEE_OPTIONS: readonly PillOption<number>[] = [
  { value: 0, label: "Espèces 0 %" },
  { value: 1, label: "Mobile Money 1 %" },
];

interface AdjustPanelProps {
  readonly marginPct: number;
  readonly feePct: number;
  readonly onMarginChange: (value: number) => void;
  readonly onFeeChange: (value: number) => void;
}

/** Contenu de l'étape « Ajuster » : marge et frais de paiement, avec recalcul immédiat. */
export function AdjustPanel({ marginPct, feePct, onMarginChange, onFeeChange }: AdjustPanelProps) {
  return (
    <Reveal beat={0} className="grid gap-8">
      <div className="grid gap-4">
        <p className="font-semibold">
          Ce que vous gardez sur chaque vente :{" "}
          <span data-testid="margin-current" className="tabular-nums">
            {marginPct} %
          </span>
        </p>
        <PillChoice label="Marge" options={MARGIN_OPTIONS} value={marginPct} onChange={onMarginChange} />
      </div>
      <div className="grid gap-4">
        <p className="font-semibold">Comment vos clients paient</p>
        <PillChoice label="Frais de paiement" options={FEE_OPTIONS} value={feePct} onChange={onFeeChange} />
      </div>
    </Reveal>
  );
}
