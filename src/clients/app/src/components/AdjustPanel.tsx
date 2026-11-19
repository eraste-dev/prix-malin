import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_VAT_RATE_PCT } from "@prix-malin/domain";
import { useCalc, useStores } from "../lib/storeContext";
import { AmountField } from "./AmountField";
import { HelpButton } from "./HelpButton";
import { PillChoice, type PillOption } from "./PillChoice";
import { Reveal } from "./Reveal";
import { Segmented } from "./Segmented";

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

/** Pas d'arrondi proposés, en F : on arrondit toujours vers le haut (RG-06). */
export const ROUNDING_OPTIONS: readonly PillOption<number>[] = [5, 25, 50, 100, 500].map((step) => ({
  value: step,
  label: `${step} F`,
}));

const VAT_BASES = [
  { value: "HT", label: "HT" },
  { value: "TTC", label: "TTC" },
] as const;

/** Contenu de l'étape « Ajuster » (docs/15 E06, niveau 2) : chaque réglage recalcule le prix aussitôt. */
export function AdjustPanel() {
  const stores = useStores();
  const calcul = useCalc((state) => state.calcul);
  const actions = stores.calc.getState();

  return (
    <Reveal beat={0} className="grid gap-8">
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold">
            Ce que vous gardez sur chaque vente :{" "}
            <span data-testid="margin-current" className="tabular-nums">
              {calcul.marge} %
            </span>
          </p>
          <HelpButton term="marge" />
        </div>
        <PillChoice label="Marge" options={MARGIN_OPTIONS} value={calcul.marge} onChange={actions.setMarge} />
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold">Comment vos clients paient</p>
          <HelpButton term="frais" />
        </div>
        <PillChoice label="Frais de paiement" options={FEE_OPTIONS} value={calcul.frais} onChange={actions.setFrais} />
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="rounding" className="text-base font-semibold">
            Arrondir au prix rond supérieur
          </Label>
          <Switch
            id="rounding"
            checked={calcul.arrondi.actif}
            onCheckedChange={(actif) => actions.setArrondi({ actif })}
          />
        </div>
        {calcul.arrondi.actif && (
          <PillChoice
            label="Pas d'arrondi"
            options={ROUNDING_OPTIONS}
            value={calcul.arrondi.pas}
            onChange={(pas) => actions.setArrondi({ pas })}
          />
        )}
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="vat" className="text-base font-semibold">
            Ajouter la TVA ({DEFAULT_VAT_RATE_PCT} %)
          </Label>
          <Switch id="vat" checked={calcul.tva.actif} onCheckedChange={(actif) => actions.setTva({ actif })} />
        </div>
        {calcul.tva.actif && (
          <Segmented
            label="Prix affiché"
            value={calcul.tva.base}
            options={VAT_BASES}
            onChange={(base) => actions.setTva({ base })}
          />
        )}
      </div>

      <AmountField
        id="competitor"
        label="Prix du concurrent (facultatif)"
        hint={
          calcul.tva.actif
            ? `Saisissez-le dans la même base que le prix affiché (${calcul.tva.base}).`
            : "Le prix auquel votre concurrent vend la même chose."
        }
        example="400"
        unit="FCFA"
        value={calcul.concurrent}
        onChange={actions.setConcurrent}
      />
    </Reveal>
  );
}
