import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TextField } from "./TextField";

interface SaveSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Nom proposé (celui saisi, sinon « type · unité »). */
  readonly defaultName: string;
  /** Le calcul vient d'un prix déjà enregistré : on propose de le mettre à jour (docs/15 E07). */
  readonly canUpdate: boolean;
  readonly onSave: (name: string) => void;
  readonly onUpdate: (name: string) => void;
}

/** Feuille « Enregistrer » : un nom prérempli, un appui. Deux prix de même nom sont acceptés. */
export function SaveSheet({ open, onOpenChange, defaultName, canUpdate, onSave, onUpdate }: SaveSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-xl rounded-t-3xl px-5 pt-6 pb-8">
        {/* Le contenu n'existe que feuille ouverte : le nom est repris de la suggestion à chaque ouverture. */}
        <SaveForm
          defaultName={defaultName}
          canUpdate={canUpdate}
          onSave={(name) => {
            onSave(name);
            onOpenChange(false);
          }}
          onUpdate={(name) => {
            onUpdate(name);
            onOpenChange(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

interface SaveFormProps {
  readonly defaultName: string;
  readonly canUpdate: boolean;
  readonly onSave: (name: string) => void;
  readonly onUpdate: (name: string) => void;
}

function SaveForm({ defaultName, canUpdate, onSave, onUpdate }: SaveFormProps) {
  const [name, setName] = useState(defaultName);
  const finalName = name.trim() === "" ? defaultName : name.trim();
  return (
    <>
      <SheetHeader className="p-0">
        <SheetTitle className="text-xl font-light">Enregistrer ce prix</SheetTitle>
        <SheetDescription>Gardez vos prix pour les retrouver dans « Mes prix ».</SheetDescription>
      </SheetHeader>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canUpdate) onUpdate(finalName);
          else onSave(finalName);
        }}
        className="mt-4 grid gap-6"
      >
        <TextField id="price-name" label="Nom" value={name} onChange={setName} />
        <div className="flex flex-wrap gap-2">
          {canUpdate ? (
            <>
              <Button type="submit" className="h-12 rounded-full px-6 text-base">
                Mettre à jour
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onSave(finalName)}
                className="h-12 rounded-full px-6 text-base"
              >
                Enregistrer une copie
              </Button>
            </>
          ) : (
            <Button type="submit" className="h-12 rounded-full px-6 text-base">
              Enregistrer
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
