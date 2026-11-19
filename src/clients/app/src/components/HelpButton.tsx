import { CircleHelp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GLOSSARY, type HelpTerm } from "../content/comprendre";

interface HelpButtonProps {
  readonly term: HelpTerm;
}

/**
 * Bouton « ? » (docs/15 E12) : une définition courte, qui ne déplace pas la mise en page et ne bloque pas la
 * saisie. « En savoir plus » mène à l'article de « Comprendre ».
 */
export function HelpButton({ term }: HelpButtonProps) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[term];
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Aide : ${entry.title.toLowerCase()}`}
        onClick={() => setOpen(true)}
        className="size-11 shrink-0 rounded-full text-muted-foreground"
      >
        <CircleHelp className="size-5" aria-hidden="true" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-xl rounded-t-3xl px-5 pt-6 pb-8">
          <SheetHeader className="p-0">
            <SheetTitle className="text-xl font-light">{entry.title}</SheetTitle>
            <SheetDescription className="text-base text-foreground">{entry.text}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Button asChild variant="outline" className="h-12 rounded-full px-6 text-base">
              <Link to={`/comprendre/${entry.slug}`} onClick={() => setOpen(false)}>
                En savoir plus
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
