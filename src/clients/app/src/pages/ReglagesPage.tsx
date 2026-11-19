import { BookOpen, Compass, Download, Lock, RotateCcw, Store, Upload } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { PageHeader } from "../components/PageHeader";
import { DisclosureToggle, Expand } from "../components/Disclosure";
import { SettingsButton, SettingsFile, SettingsGroup, SettingsLink } from "../components/SettingsRow";
import { ThemeCards } from "../components/ThemeCards";
import { WipeDialog } from "../components/WipeDialog";
import { CONTENT_VERSION } from "../content/comprendre";
import { MAX_BACKUP_BYTES, backupFileName, buildBackup, importBackup, type ImportReport } from "../lib/backup";
import { usePrices, useStores } from "../lib/storeContext";
import { wipeAll } from "../lib/stores";
import { SETTINGS } from "../lib/motion";
import { useThemeContext } from "../lib/themeContext";
import { SCENE_CLEAR, useScene } from "../lib/useScene";

const plural = (count: number, one: string, many: string): string => `${count} ${count > 1 ? many : one}`;

function describeImport(report: ImportReport): string {
  if (!report.ok) {
    if (report.reason === "NEWER_VERSION") return "Cette sauvegarde vient d'une version plus récente de l'application.";
    if (report.reason === "TOO_LARGE") return "Ce fichier est trop volumineux pour être une sauvegarde Prix Malin.";
    return "Ce fichier n'est pas une sauvegarde Prix Malin.";
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
  const [aboutOpen, setAboutOpen] = useState(false);
  const ref = useScene<HTMLDivElement>((_root, part, timeline) => {
    timeline.from(part("group"), {
      y: SETTINGS.risePx,
      opacity: 0,
      duration: SETTINGS.duration,
      stagger: SETTINGS.stagger,
      ease: "power2.out",
      clearProps: SCENE_CLEAR,
    });
  });

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

  async function importPrices(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    if (file === undefined) return;
    // On refuse un fichier démesuré avant même de le lire.
    const report: ImportReport =
      file.size > MAX_BACKUP_BYTES
        ? { ok: false, reason: "TOO_LARGE" }
        : importBackup(stores, await file.text());
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

      <div ref={ref} className="grid gap-12">
        <Block title="Thème" label="Thème">
          <ThemeCards theme={theme} onChange={choose} />
        </Block>

        <Block title="Mon activité">
          <SettingsGroup>
            <SettingsLink
              to="/activite"
              icon={Store}
              label="Mon activité"
              detail="Vos charges, réparties entre vos produits"
            />
          </SettingsGroup>
        </Block>

        <Block title="Présentation et aides">
          <SettingsGroup>
            <SettingsLink to="/exemple" icon={Compass} label="Visite guidée" detail="Un exemple pas à pas, avec le bissap" />
            <SettingsLink to="/bienvenue" icon={BookOpen} label="Revoir la présentation" />
            <SettingsButton
              onClick={resetTips}
              icon={RotateCcw}
              label="Réinitialiser les aides"
              detail="Revoir les conseils déjà fermés"
            />
          </SettingsGroup>
        </Block>

        <Block title="Sauvegarde">
          <p className="text-muted-foreground">
            Gardez une copie de vos prix dans un fichier. Il reste sur votre téléphone : l'application ne l'envoie nulle
            part.
          </p>
          <SettingsGroup>
            <SettingsButton
              onClick={exportPrices}
              disabled={prices.length === 0}
              icon={Download}
              label="Exporter mes prix"
              detail={prices.length === 0 ? "Aucun prix pour l'instant" : plural(prices.length, "prix", "prix")}
            />
            <SettingsFile
              accept="application/json,.json"
              onFile={(input) => void importPrices(input)}
              icon={Upload}
              label="Importer un fichier"
            />
          </SettingsGroup>
        </Block>

        <Block title="Confidentialité">
          <div className="flex items-center gap-3 rounded-3xl bg-card p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
              <Lock className="size-5" aria-hidden="true" />
            </span>
            <p>Tout reste sur votre téléphone. Aucune donnée n'est envoyée par l'application.</p>
          </div>
        </Block>

        <Block title="À propos" label="À propos">
          <DisclosureToggle
            expanded={aboutOpen}
            collapsedLabel="Voir les versions"
            expandedLabel="Masquer les versions"
            onToggle={() => setAboutOpen((open) => !open)}
          />
          {aboutOpen && (
            <Expand>
              <dl className="grid gap-1 rounded-3xl bg-card p-5">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Version de l'application</dt>
                  <dd className="tabular-nums">{__APP_VERSION__}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Version du contenu</dt>
                  <dd className="tabular-nums">{CONTENT_VERSION}</dd>
                </div>
              </dl>
            </Expand>
          )}
        </Block>

        <Block title="Vos données">
          <div className="grid gap-4 rounded-3xl bg-card p-5">
            <p className="text-muted-foreground">
              Efface vos prix, votre brouillon et vos réglages de cet appareil. Impossible à annuler.
            </p>
            <WipeDialog onConfirm={wipe} />
          </div>
        </Block>
      </div>
    </>
  );
}

function Block({ title, label, children }: { readonly title: string; readonly label?: string; readonly children: ReactNode }) {
  return (
    <section aria-label={label ?? title} data-part="group" className="grid gap-3">
      <h2 className="text-xl font-light">{title}</h2>
      {children}
    </section>
  );
}
