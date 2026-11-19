import { useState } from "react";
import { ChargeLines } from "../components/ChargeLines";
import { PageHeader } from "../components/PageHeader";
import { formatAmount } from "../lib/amount";
import { sharedShare } from "../lib/shared";
import { useActivityCharges, usePrices, useStores } from "../lib/storeContext";
import { sharedTotalOf } from "../lib/stores";

/** Mon activité (E10) : les charges du mois saisies une seule fois, réparties entre les produits au prorata des ventes. */
export function ActivitePage() {
  const stores = useStores();
  const charges = useActivityCharges((state) => state.charges);
  const prices = usePrices((state) => state.prices);
  const [focusId, setFocusId] = useState<string | null>(null);
  const actions = stores.activity.getState();
  const total = sharedTotalOf(charges);

  const withVolume = prices.flatMap((price) =>
    price.calcul.volume === null ? [] : [{ id: price.id, nom: price.nom, volume: price.calcul.volume }],
  );

  return (
    <>
      <PageHeader>Mon activité</PageHeader>

      <p className="text-lg">
        Saisissez vos charges du mois une seule fois : chaque produit en portera une part, proportionnelle à ses
        ventes. Dans « Calculer », choisissez « Mes charges partagées ».
      </p>

      <ChargeLines
        lines={charges}
        total={charges.length === 0 ? null : total}
        focusId={focusId}
        onTogglePreset={(label) => {
          const id = actions.toggleCharge(label);
          if (id !== null) setFocusId(id);
        }}
        onAddCustom={() => setFocusId(actions.addCharge({ label: "" }))}
        onUpdate={actions.updateCharge}
        onRemove={actions.removeCharge}
      />

      {total > 0 && withVolume.length > 0 && (
        <section aria-label="Répartition" className="grid gap-3">
          <h2 className="text-xl font-light">Répartition</h2>
          <table aria-label="Répartition des charges par produit" className="w-full text-left">
            <thead className="text-muted-foreground">
              <tr>
                <th scope="col" className="py-2 font-normal">
                  Produit
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  Ventes par mois
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  Part des charges
                </th>
              </tr>
            </thead>
            <tbody>
              {withVolume.map((product) => {
                const others = withVolume.filter((other) => other.id !== product.id).map((other) => other.volume);
                return (
                  <tr key={product.id} className="border-t border-border">
                    <th scope="row" className="py-3 font-semibold">
                      {product.nom === "" ? "Sans nom" : product.nom}
                    </th>
                    <td className="py-3 text-right tabular-nums">{formatAmount(product.volume)}</td>
                    <td className="py-3 text-right tabular-nums">
                      {formatAmount(sharedShare(total, product.volume, others) ?? 0)} F
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
