import { useState } from "react";
import { ChargeLines } from "../components/ChargeLines";
import { PageHeader } from "../components/PageHeader";
import { ShareList, type ProductShare } from "../components/ShareList";
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

  const shares: readonly ProductShare[] = withVolume.map((product) => {
    const others = withVolume.filter((other) => other.id !== product.id).map((other) => other.volume);
    const amount = sharedShare(total, product.volume, others) ?? 0;
    return {
      id: product.id,
      name: product.nom === "" ? "Sans nom" : product.nom,
      volume: product.volume,
      amount,
      percent: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
    };
  });

  return (
    <>
      <PageHeader>Mon activité</PageHeader>

      <p className="text-lg">
        Saisissez vos charges du mois une seule fois : chaque produit en porte une part, selon ses ventes. Dans
        Calculer, touchez « Utiliser mes charges partagées ».
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

      {total > 0 && (
        <section aria-label="Répartition" className="grid gap-3">
          <h2 className="text-xl font-light">Répartition</h2>
          {withVolume.length > 0 ? (
            <ShareList shares={shares} />
          ) : (
            <p className="rounded-3xl bg-card p-5 text-muted-foreground">
              {prices.length === 0
                ? "Votre premier produit portera toutes ces charges."
                : "Indiquez les ventes par mois de vos produits pour voir la part de chacun."}
            </p>
          )}
        </section>
      )}
    </>
  );
}
