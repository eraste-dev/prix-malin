import { driver, type Config, type Driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { formatAmount } from "./amount";
import { motionAllowed } from "./motion";

/*
 * Visite guidée de l'exemple (docs/14, ADR-0015). Ce module est **le seul** à importer driver.js : on peut le
 * remplacer sans toucher aux écrans. L'habillage de la bulle (jetons du design) est dans `styles.css`, classe `pm-tour`.
 */

/** Nombre d'étapes : cinq éléments mis en évidence, puis une bulle centrée. */
export const TOUR_STEP_COUNT = 6;

/**
 * Réglages de la visite. Sans mouvement autorisé (MOV-01), le halo ne glisse pas et le défilement n'est pas doux ;
 * la visite fonctionne à l'identique, sans animation.
 */
export function buildTourConfig(allowMotion: boolean): Config {
  return {
    animate: allowMotion,
    smoothScroll: allowMotion,
    showProgress: true,
    progressText: "{{current}} sur {{total}}",
    nextBtnText: "Suivant",
    prevBtnText: "Retour",
    doneBtnText: "Faire le mien",
    showButtons: ["next", "previous", "close"],
    allowClose: true,
    allowKeyboardControl: true,
    overlayColor: "#000000",
    overlayOpacity: 0.6,
    stagePadding: 8,
    stageRadius: 16,
    popoverClass: "pm-tour",
  };
}

/** Les étapes : les vrais éléments de l'écran Calculer, dans l'ordre du docs/14. */
export function tourSteps(price: number, onFinish: () => void): DriveStep[] {
  return [
    {
      element: 'form[aria-label="Vos trois questions"]',
      popover: {
        title: "Trois nombres",
        description: "Ce que ça vous coûte, vos charges du mois, vos ventes. Ici, tout est déjà rempli.",
      },
    },
    {
      element: '[data-tour="price"]',
      popover: { title: "Votre prix", description: `Voici le prix à viser : ${formatAmount(price)} F.` },
    },
    {
      element: '[data-tour="composition"]',
      popover: {
        title: "D'où il vient",
        description: "Voilà d'où vient ce prix : ce que ça vous coûte, vos charges, votre marge.",
      },
    },
    {
      element: '[role="radiogroup"][aria-label="Marge"]',
      popover: { title: "La marge", description: "Changez la marge, regardez le prix bouger. Essayez." },
    },
    {
      element: '[data-tour="save"]',
      popover: { title: "Vos prix", description: "Gardez vos prix pour les retrouver." },
    },
    {
      popover: {
        title: "À vous",
        description: "Vous savez tout. Refaites ce calcul avec vos propres chiffres.",
        // « Faire le mien » ferme la visite en la menant à son terme, ce qui la distingue de la croix ou d'Échap.
        onNextClick: (_element, _step, { driver: tour }) => {
          onFinish();
          tour.destroy();
        },
      },
    },
  ];
}

interface TourHandlers {
  /** « Faire le mien » : la visite est allée au bout. */
  readonly onDone: () => void;
  /** Croix, Échap ou clic hors de la bulle : la visite est fermée en route. */
  readonly onClose: () => void;
}

/** Lance la visite et renvoie sa poignée, pour pouvoir la couper au démontage de l'écran. */
export function startTour(price: number, { onDone, onClose }: TourHandlers): Driver {
  let finished = false;
  const tour = driver({
    ...buildTourConfig(motionAllowed()),
    steps: tourSteps(price, () => {
      finished = true;
    }),
    onDestroyed: () => (finished ? onDone() : onClose()),
  });
  tour.drive();
  return tour;
}
