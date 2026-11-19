import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

interface ShareSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Le résumé texte, tel qu'il sera partagé (docs/15 E08). */
  readonly summary: string;
  readonly title: string;
}

const canShare = (): boolean => typeof navigator !== "undefined" && typeof navigator.share === "function";

/** Feuille « Partager » : aperçu du texte, partage natif si disponible, sinon copie. Rien ne part sans action. */
export function ShareSheet({ open, onOpenChange, summary, title }: ShareSheetProps) {
  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(summary);
      toast("Résumé copié");
    } catch {
      toast("Copie impossible : sélectionnez le texte ci-dessus pour le copier.");
    }
  }

  async function share(): Promise<void> {
    try {
      await navigator.share({ title, text: summary });
    } catch (error) {
      // Annuler la feuille native n'est pas une erreur.
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast("Partage impossible. Vous pouvez copier le résumé.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-xl rounded-t-3xl px-5 pt-6 pb-8">
        <SheetHeader className="p-0">
          <SheetTitle className="text-xl font-light">Partager ce prix</SheetTitle>
          <SheetDescription>Rien n'est envoyé par l'application : vous choisissez où l'envoyer.</SheetDescription>
        </SheetHeader>
        <pre
          data-testid="share-preview"
          className="mt-4 max-h-64 overflow-auto rounded-2xl bg-muted p-4 text-base whitespace-pre-wrap select-text"
        >
          {summary}
        </pre>
        <div className="mt-6 flex flex-wrap gap-2">
          {canShare() && (
            <Button type="button" onClick={() => void share()} className="h-12 rounded-full px-6 text-base">
              Partager
            </Button>
          )}
          <Button
            type="button"
            variant={canShare() ? "outline" : "default"}
            onClick={() => void copy()}
            className="h-12 rounded-full px-6 text-base"
          >
            Copier
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
