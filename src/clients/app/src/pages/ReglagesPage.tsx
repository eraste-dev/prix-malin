import { Download, Upload } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../components/PageHeader";
import { Reveal } from "../components/Reveal";
import { ThemeCards } from "../components/ThemeCards";
import { WipeDialog } from "../components/WipeDialog";
import { CONTENT_VERSION } from "../content/comprendre";
import { backupFileName, buildBackup, importBackup, type ImportReport } from "../lib/backup";
import { usePrices, useStores } from "../lib/storeContext";
import { wipeAll } from "../lib/stores";
import { useThemeContext } from "../lib/themeContext";

const plural = (count: number, one: string, many: string): string => `${count} ${count > 1 ? many : one}`;

function describeImport(report: ImportReport): string {
  if (!report.ok) {
    return report.reason === "NEWER_VERSION"
      ? "Cette sauvegarde vient d'une version plus récente de l'application."
      : "Ce fichier n'est pas une sauvegarde Prix Malin.";
  }
  const parts = [`${plural(report.added, "prix importé", "prix importés")}`];
  if (report.skipped > 0) parts.push(plural(report.skipped, "déjà présent", "déjà présents"));
  if (report.rejected > 0) parts.push(plural(report.rejected, "illisible", "illisibles"));
  return `${parts.join(", ")}.`;
}

/** Réglages (E13) : thème, présentation et aides, sauvegarde, confidentialité, à propos, effacement. */
export function ReglagesPage() {
  const stores = useStores();
  const navigate = useNavigate();
  const { theme, choose } = useThemeContext();
  const prices = usePrices((state) => state.prices);

  function exportPrices(): void {
    const blob = new Blob([buildBackup(prices)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = backupFileName();
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast("Sauvegarde exportée");
  }

  async function importPrices(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const input = event.target;
    const file = input.files?.[0];
    if (file === undefined) return;
    const report = importBackup(stores, await file.text());
    toast(describeImport(report));
    input.value = "";
  }

  function resetTips(): void {
    stores.settings.getState().resetTips();
    toast("Aides réinitialisées");
  }

  function wipe(): void {
    wipeAll(stores);
    toast("Données effacées");
    void navigate("/", { replace: true });
  }

  return (
    <>
      <PageHeader>Réglages</PageHeader>

      <Block title="Thème" label="Thème">
        <ThemeCards theme={theme} onChange={choose} />
      </Block>

      <Block title="Présentation et aides">
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="h-12 rounded-full px-6 text-base">
            <Link to="/bienvenue">Revoir la présentation</Link>
          </Button>
          <Button type="button" variant="outline" onClick={resetTips} className="h-12 rounded-full px-6 text-base">
            Réinitialiser les aides
          </Button>
        </div>
      </Block>

      <Block title="Sauvegarde">
        <p className="text-muted-foreground">
          Gardez une copie de vos prix dans un fichier. Il reste sur votre téléphone : l'application ne l'envoie nulle
          part.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={prices.length === 0}
            onClick={exportPrices}
            className="h-12 rounded-full px-6 text-base"
          >
            <Download className="size-4" aria-hidden="true" />
            Exporter mes prix
          </Button>
          <Button asChild variant="outline" className="h-12 cursor-pointer rounded-full px-6 text-base">
            <label>
              <Upload className="size-4" aria-hidden="true" />
              Importer un fichier
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => void importPrices(event)}
                className="sr-only"
              />
            </label>
          </Button>
        </div>
      </Block>

      <Block title="Confidentialité">
        <p>Tout reste sur votre téléphone. Aucune donnée n'est envoyée par l'application.</p>
      </Block>

      <Block title="À propos" label="À propos">
        <dl className="grid gap-1">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Version de l'application</dt>
            <dd className="tabular-nums">{__APP_VERSION__}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Version du contenu</dt>
            <dd className="tabular-nums">{CONTENT_VERSION}</dd>
          </div>
        </dl>
      </Block>

      <Block title="Vos données">
        <WipeDialog onConfirm={wipe} />
      </Block>
    </>
  );
}

function Block({ title, label, children }: { readonly title: string; readonly label?: string; readonly children: ReactNode }) {
  return (
    <section aria-label={label ?? title} className="grid gap-3">
      <Reveal as="h2" beat={0} className="text-xl font-light">
        {title}
      </Reveal>
      {children}
    </section>
  );
}
