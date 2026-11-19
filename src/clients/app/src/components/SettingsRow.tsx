import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

const ROW =
  "flex min-h-16 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left outline-offset-[-3px] transition-colors hover:bg-muted/50 focus-visible:outline-3 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50";

interface RowContentProps {
  readonly icon: LucideIcon;
  readonly label: string;
  /** Précision en texte atténué sous le libellé (ex. « 3 prix »). */
  readonly detail?: string;
  /** Chevron à droite : la ligne ouvre un autre écran. */
  readonly chevron?: boolean;
}

function RowContent({ icon: Icon, label, detail, chevron = false }: RowContentProps) {
  return (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="grid min-w-0 flex-1">
        <span className="text-base font-medium">{label}</span>
        {detail !== undefined && <span className="text-muted-foreground">{detail}</span>}
      </span>
      {chevron && <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />}
    </>
  );
}

/** Carte blanche qui range des lignes de réglage, séparées par un filet. */
export function SettingsGroup({ children }: { readonly children: ReactNode }) {
  return <div className="divide-y divide-border overflow-hidden rounded-3xl bg-card">{children}</div>;
}

/** Ligne qui ouvre un écran. */
export function SettingsLink({ to, ...content }: RowContentProps & { readonly to: string }) {
  return (
    <Link to={to} className={ROW}>
      <RowContent {...content} chevron />
    </Link>
  );
}

/** Ligne qui lance une action sur place. */
export function SettingsButton({
  onClick,
  disabled = false,
  ...content
}: RowContentProps & { readonly onClick: () => void; readonly disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={ROW}>
      <RowContent {...content} />
    </button>
  );
}

/** Ligne qui choisit un fichier : le champ natif est caché, toute la ligne s'étiquette et se touche. */
export function SettingsFile({
  onFile,
  accept,
  ...content
}: RowContentProps & { readonly onFile: (input: HTMLInputElement) => void; readonly accept: string }) {
  return (
    <label className={ROW}>
      <RowContent {...content} />
      <input type="file" accept={accept} onChange={(event) => onFile(event.target)} className="sr-only" />
    </label>
  );
}
