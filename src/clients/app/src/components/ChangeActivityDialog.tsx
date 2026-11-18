import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Activity } from "../lib/activity";

interface ChangeActivityDialogProps {
  readonly pending: Activity | null;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** EXG-03 : changer de type remplace la marge et les frais ajustés ; jamais sans accord. */
export function ChangeActivityDialog({ pending, onConfirm, onCancel }: ChangeActivityDialogProps) {
  return (
    <AlertDialog open={pending !== null} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Passer à « {pending?.label} » ?</AlertDialogTitle>
          <AlertDialogDescription>
            Votre marge et vos frais de paiement seront remplacés par ceux de ce type. Vos montants
            restent tels quels.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Changer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
