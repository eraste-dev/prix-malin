import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { TextField } from "./TextField";

const CONFIRM_WORD = "EFFACER";

interface WipeDialogProps {
  readonly onConfirm: () => void;
}

/**
 * Effacement de toutes les données : irréversible, donc **confirmation renforcée** (docs/15 E13) : il faut taper
 * un mot. La casse ne compte pas, pour ne pas bloquer quelqu'un qui tape vite sur un téléphone.
 */
export function WipeDialog({ onConfirm }: WipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const ready = word.trim().toUpperCase() === CONFIRM_WORD;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setWord("");
      }}
    >
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-12 w-fit rounded-full border-destructive px-6 text-base text-destructive"
      >
        Effacer toutes mes données
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Effacer toutes vos données ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vos prix enregistrés, votre calcul en cours et vos réglages seront supprimés de ce téléphone. Cette
            action est définitive.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <TextField id="wipe-confirm" label={`Tapez ${CONFIRM_WORD} pour confirmer`} value={word} onChange={setWord} />
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction disabled={!ready} onClick={onConfirm}>
            Effacer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
