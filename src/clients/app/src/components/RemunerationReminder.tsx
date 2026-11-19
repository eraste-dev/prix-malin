import { Button } from "@/components/ui/button";

interface RemunerationReminderProps {
  readonly onAdd: () => void;
  readonly onDismiss: () => void;
}

/** Rappel non bloquant, une fois par calcul : votre salaire est une charge (docs/13 §5). */
export function RemunerationReminder({ onAdd, onDismiss }: RemunerationReminderProps) {
  return (
    <div
      role="group"
      aria-label="Avez-vous compté votre salaire ?"
      className="grid gap-4 rounded-2xl border border-primary/40 bg-muted/60 p-4"
    >
      <div className="grid gap-1">
        <p className="font-semibold">Avez-vous compté votre salaire ?</p>
        <p className="text-muted-foreground">
          Votre rémunération fait partie de vos charges : sans elle, le prix serait trop bas.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onAdd} className="h-11 rounded-full px-5 text-base">
          L'ajouter
        </Button>
        <Button type="button" variant="ghost" onClick={onDismiss} className="h-11 rounded-full px-5 text-base">
          Continuer
        </Button>
      </div>
    </div>
  );
}
