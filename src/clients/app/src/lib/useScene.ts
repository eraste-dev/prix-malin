import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type RefObject } from "react";
import { motionAllowed } from "./motion";

gsap.registerPlugin(useGSAP);

/** Retire les styles posés par GSAP à la fin d'une entrée : l'état final vit dans le DOM, pas dans l'animation. */
export const SCENE_CLEAR = "transform,opacity";

/** Cherche les éléments d'une scène par leur `data-part`. */
export type PartQuery = (part: string) => Element[];

/**
 * Joue la chorégraphie d'une scène (SVG ou bloc HTML), une fois, à son apparition. `build` reçoit la racine, un
 * sélecteur par `data-part` et une timeline vide ; il peut renvoyer une fonction qui remet le DOM dans son état
 * final (par exemple un texte que l'animation a modifié). Sous « réduire les animations » (MOV-01), rien n'est joué.
 */
export function useScene<T extends Element = SVGSVGElement>(
  build: (root: T, part: PartQuery, timeline: gsap.core.Timeline) => void | (() => void),
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!motionAllowed() || root === null) return;
      const select = gsap.utils.selector(root);
      const part: PartQuery = (name) => select(`[data-part="${name}"]`);
      return build(root, part, gsap.timeline());
    },
    { scope: ref },
  );

  return ref;
}

/**
 * Fait compter un texte de 0 à `target` dans la timeline. Le texte final est déjà dans le DOM : on le remplace par
 * « 0 » avant l'affichage, et la fonction renvoyée (à retourner de `build`) le remet à la fin ou au démontage.
 */
export function countUp(
  timeline: gsap.core.Timeline,
  element: Element,
  target: number,
  format: (value: number) => string,
  position: number,
  duration: number,
): () => void {
  const counter = { value: 0 };
  element.textContent = format(0);
  timeline.to(
    counter,
    {
      value: target,
      duration,
      ease: "power2.out",
      snap: { value: 1 },
      onUpdate: () => {
        element.textContent = format(counter.value);
      },
      onComplete: () => {
        element.textContent = format(target);
      },
    },
    position,
  );
  return () => {
    element.textContent = format(target);
  };
}
