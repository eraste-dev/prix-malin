import { Button } from "@/components/ui/button";
import { useCalc, usePrices, useStores } from "../lib/storeContext";

/**
 * Stockage abîmé (E14, NFR-09) : on dit clairement ce qui n'a pas pu être relu, sans bloquer.
 * L'app est déjà repartie d'un état sain ; ce message ne fait que prévenir.
 */
export function IntegrityBanners() {
  const stores = useStores();
  const draftLost = useCalc((state) => state.integrity.draftLost);
  const lost = usePrices((state) => state.integrity.lost);

  return (
    <>
      {draftLost && (
        <Banner onDismiss={() => stores.calc.getState().dismissIntegrity()}>
          Votre brouillon n'a pas pu être relu : nous sommes repartis d'un calcul vierge.
        </Banner>
      )}
      {lost > 0 && (
        <Banner onDismiss={() => stores.prices.getState().dismissIntegrity()}>
          {lost === 1
            ? "1 prix n'a pas pu être relu et a été écarté."
            : `${lost} prix n'ont pas pu être relus et ont été écartés.`}
        </Banner>
      )}
    </>
  );
}

function Banner({ children, onDismiss }: { readonly children: string; readonly onDismiss: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted p-4">
      <p>{children}</p>
      <Button type="button" variant="ghost" onClick={onDismiss} className="h-11 rounded-full px-4 text-base">
        Compris
      </Button>
    </div>
  );
}
