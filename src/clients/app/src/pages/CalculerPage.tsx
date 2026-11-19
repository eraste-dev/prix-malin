import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivityChoice } from "../components/ActivityChoice";
import { AdjustPanel } from "../components/AdjustPanel";
import { AmountField } from "../components/AmountField";
import { ChangeActivityDialog } from "../components/ChangeActivityDialog";
import { ChargeLines } from "../components/ChargeLines";
import { CostLines } from "../components/CostLines";
import { PageHeader } from "../components/PageHeader";
import { RemunerationReminder } from "../components/RemunerationReminder";
import { ResultCard } from "../components/ResultCard";
import { SaveSheet } from "../components/SaveSheet";
import { Segmented } from "../components/Segmented";
import { ShareSheet } from "../components/ShareSheet";
import { Step } from "../components/Step";
import { StepRail } from "../components/StepRail";
import { TextField } from "../components/TextField";
import { formatMoney } from "../lib/amount";
import { REMUNERATION_LABEL } from "../lib/charges";
import { chargesTotalOf, directTotalOf, type InputMode, type ResultMode } from "../lib/model";
import { BEAT } from "../lib/motion";
import { computeOutcome, type OutcomeResult } from "../lib/outcome";
import { buildSummary, defaultPriceName } from "../lib/share";
import { computeStepStatuses, describeSteps, STEP_TITLES } from "../lib/steps";
import { useCalc, usePrices, useStores } from "../lib/storeContext";
import { useActivity } from "../lib/useActivity";

const INPUT_MODES = [
  { value: "total", label: "Total" },
  { value: "detail", label: "Détail" },
] as const;

const RESULT_MODES = [
  { value: "conseille", label: "Prix conseillé" },
  { value: "monPrix", label: "Mon prix" },
] as const;

/** Écran Calculer : un stepper vertical fixe, de « Que vendez-vous ? » jusqu'au prix et à ses réglages. */
export function CalculerPage() {
  const stores = useStores();
  const navigate = useNavigate();
  const calcul = useCalc((state) => state.calcul);
  const linkedPriceId = useCalc((state) => state.linkedPriceId);
  const canUpdate = usePrices((state) => state.prices.some((price) => price.id === linkedPriceId));
  const actions = stores.calc.getState();
  const [focusId, setFocusId] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { activity, pending, requestChange, confirmChange, cancelChange } = useActivity();

  const outcome = useMemo(() => computeOutcome(calcul), [calcul]);
  // Les étapes se débloquent quand un prix est calculable, quel que soit le mode affiché.
  const baseline = useMemo(
    () => (calcul.modeResultat === "conseille" ? outcome : computeOutcome({ ...calcul, modeResultat: "conseille" })),
    [calcul, outcome],
  );
  const cost = directTotalOf(calcul);
  const fixed = chargesTotalOf(calcul);
  const result = "data" in outcome ? outcome : null;
  const unlocked = "data" in baseline;

  const statuses = computeStepStatuses({ hasCost: cost !== null, hasResult: unlocked });
  const summaries = describeSteps({
    activityLabel: activity.label,
    cost,
    fixed,
    volume: calcul.volume,
    price: "data" in baseline ? baseline.data.priceExclVat : null,
    marginPct: calcul.marge,
    feePct: calcul.frais,
  });

  const { coutDirect, chargesFixes } = calcul;
  const hasRemuneration = chargesFixes.lignes.some((line) => line.label === REMUNERATION_LABEL);
  const showReminder = fixed !== null && !calcul.remunerationRappelVu && !hasRemuneration;
  const fixedPerUnit = fixed !== null && calcul.volume !== null ? fixed / calcul.volume : null;
  const message = "message" in outcome ? outcome.message : "";

  function addCostLine(label?: string): void {
    setFocusId(actions.addCostLine(label === undefined ? {} : { label }));
  }

  function togglePreset(label: string): void {
    const id = actions.toggleChargePreset(label);
    if (id !== null) setFocusId(id);
  }

  /** « L'ajouter » : passe en détail et ajoute « Ma rémunération », curseur sur son montant. */
  function addRemuneration(): void {
    actions.setChargesMode("detail");
    if (!hasRemuneration) togglePreset(REMUNERATION_LABEL);
    actions.dismissRemunerationReminder();
  }

  const snapshotOf = (r: OutcomeResult) => ({
    prixConseille: r.data.customerPrice,
    coutDeRevient: r.data.fullCost,
    verdict: r.verdict,
  });

  function savePrice(name: string): void {
    if (result === null) return;
    actions.setNom(name);
    const id = stores.prices.getState().save({ ...calcul, nom: name }, snapshotOf(result), name);
    actions.linkTo(id);
    toast("Prix enregistré", {
      description: "Retrouvez-le dans Mes prix.",
      action: { label: "Voir", onClick: () => void navigate("/prix") },
    });
  }

  function updatePrice(name: string): void {
    if (result === null || linkedPriceId === null) return;
    actions.setNom(name);
    stores.prices.getState().update(linkedPriceId, { ...calcul, nom: name }, snapshotOf(result), name);
    toast("Prix mis à jour", { action: { label: "Voir", onClick: () => void navigate("/prix") } });
  }

  const costModeControl = (
    <Segmented
      label="Saisie du coût"
      value={coutDirect.mode}
      options={INPUT_MODES}
      onChange={(mode: InputMode) => actions.setCostMode(mode)}
    />
  );
  const chargesModeControl = (
    <Segmented
      label="Saisie des charges"
      value={chargesFixes.mode}
      options={INPUT_MODES}
      onChange={(mode: InputMode) => actions.setChargesMode(mode)}
    />
  );

  return (
    <>
      <PageHeader>
        Bonjour, trouvons <span className="font-normal">votre prix</span>
      </PageHeader>

      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3">
        <StepRail titles={STEP_TITLES} statuses={statuses} summaries={summaries} />
        {/* Colonne réservée : le rail est en position fixe, hors du flux. */}
        <div aria-hidden="true" />
        <div className="grid gap-12">
          <Step stepKey="type" title={STEP_TITLES.type} status={statuses.type} beat={BEAT.title}>
            <ActivityChoice value={activity.id} onChange={requestChange} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="nom"
                label="Nom (facultatif)"
                placeholder="ex. Jus de bissap"
                value={calcul.nom}
                onChange={actions.setNom}
              />
              <TextField
                id="unite"
                label="Vendu par"
                placeholder="ex. bouteille"
                maxLength={40}
                value={calcul.unite}
                onChange={actions.setUnite}
              />
            </div>
          </Step>

          <Step stepKey="numbers" title={STEP_TITLES.numbers} status={statuses.numbers} beat={BEAT.field1}>
            <Card className="gap-8 rounded-3xl border-0 p-8 shadow-none">
              <form
                aria-label="Vos trois questions"
                onSubmit={(event) => event.preventDefault()}
                className="grid gap-8"
              >
                {coutDirect.mode === "total" ? (
                  <AmountField
                    id="cost"
                    label="Ce que ça vous coûte à chaque vente"
                    hint="Comptez tout ce que vous dépensez pour une vente : matières, emballage, transport."
                    example="210"
                    unit="FCFA"
                    beat={BEAT.field1}
                    action={costModeControl}
                    value={coutDirect.total}
                    onChange={actions.setCostTotal}
                  />
                ) : (
                  <div className="grid gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                      <p className="text-base font-semibold">Ce que ça vous coûte à chaque vente</p>
                      {costModeControl}
                    </div>
                    <CostLines
                      lines={coutDirect.lignes}
                      suggestions={activity.costSuggestions}
                      total={cost}
                      focusId={focusId}
                      onAdd={addCostLine}
                      onUpdate={actions.updateCostLine}
                      onRemove={actions.removeCostLine}
                    />
                  </div>
                )}

                {chargesFixes.mode === "total" ? (
                  <AmountField
                    id="fixed"
                    label="Vos charges du mois"
                    hint="Loyer, électricité, transport… et votre salaire."
                    example="220 000"
                    unit="FCFA"
                    beat={BEAT.field2}
                    action={chargesModeControl}
                    value={chargesFixes.total}
                    onChange={actions.setChargesTotal}
                  />
                ) : (
                  <div className="grid gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                      <p className="text-base font-semibold">Vos charges du mois</p>
                      {chargesModeControl}
                    </div>
                    <ChargeLines
                      lines={chargesFixes.lignes}
                      total={fixed}
                      focusId={focusId}
                      onTogglePreset={togglePreset}
                      onAddCustom={() => setFocusId(actions.addChargeLine({ label: "" }))}
                      onUpdate={actions.updateChargeLine}
                      onRemove={actions.removeChargeLine}
                    />
                  </div>
                )}

                {showReminder && (
                  <RemunerationReminder onAdd={addRemuneration} onDismiss={actions.dismissRemunerationReminder} />
                )}

                <div className="grid gap-4">
                  <AmountField
                    id="volume"
                    label="Ventes par mois"
                    hint="Combien de ventes faites-vous en un mois ? Soyez réaliste."
                    example="2 000"
                    beat={BEAT.field3}
                    value={calcul.volume}
                    onChange={actions.setVolume}
                  />
                  {fixedPerUnit !== null && (
                    <p className="flex justify-between gap-4 text-muted-foreground">
                      <span>Part de charges par vente</span>
                      <span data-testid="fixed-per-unit" className="font-semibold text-foreground tabular-nums">
                        {formatMoney(fixedPerUnit)} F
                      </span>
                    </p>
                  )}
                </div>
              </form>
            </Card>
          </Step>

          <Step stepKey="result" title={STEP_TITLES.result} status={statuses.result} beat={BEAT.footer}>
            {unlocked ? (
              <>
                <Segmented
                  label="Prix à afficher"
                  value={calcul.modeResultat}
                  options={RESULT_MODES}
                  onChange={(mode: ResultMode) => actions.setModeResultat(mode)}
                />
                {calcul.modeResultat === "monPrix" && (
                  <AmountField
                    id="own-price"
                    label="Votre prix actuel"
                    hint="Le prix auquel vous vendez aujourd'hui."
                    example="400"
                    unit="FCFA"
                    value={calcul.prixActuel}
                    onChange={actions.setPrixActuel}
                  />
                )}
                {result !== null ? (
                  <>
                    <ResultCard result={result} calcul={calcul} />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() => setSaveOpen(true)}
                        className="h-12 rounded-full px-6 text-base"
                      >
                        Enregistrer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShareOpen(true)}
                        className="h-12 rounded-full px-6 text-base"
                      >
                        Partager
                      </Button>
                    </div>
                  </>
                ) : (
                  <p role="status" className="text-muted-foreground">
                    {message}
                  </p>
                )}
              </>
            ) : (
              <p role="status" className="text-muted-foreground">
                {message}
              </p>
            )}
          </Step>

          <Step stepKey="adjust" title={STEP_TITLES.adjust} status={statuses.adjust} beat={BEAT.footer}>
            {unlocked ? (
              <AdjustPanel />
            ) : (
              <p className="text-muted-foreground">Marge et frais de paiement : disponibles avec votre prix.</p>
            )}
          </Step>
        </div>
      </div>

      <ChangeActivityDialog pending={pending} onConfirm={confirmChange} onCancel={cancelChange} />
      <SaveSheet
        open={saveOpen}
        onOpenChange={setSaveOpen}
        defaultName={defaultPriceName(calcul, activity.label)}
        canUpdate={canUpdate}
        onSave={savePrice}
        onUpdate={updatePrice}
      />
      {result !== null && (
        <ShareSheet
          open={shareOpen}
          onOpenChange={setShareOpen}
          summary={buildSummary(calcul, result)}
          title={calcul.nom.trim() === "" ? "Mon prix" : calcul.nom.trim()}
        />
      )}
    </>
  );
}
