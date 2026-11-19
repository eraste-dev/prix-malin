import gsap from "gsap";
import { ONBOARD, motionAllowed } from "./motion";
import { SCENE_CLEAR, type PartQuery } from "./useScene";

const TAG_EASE = "elastic.out(1, 0.3)";

/**
 * Entrée de l'étal, commune à l'onboarding et à l'Accueil : l'auvent descend, les bouteilles surgissent l'une
 * après l'autre, l'étiquette se balance autour de son fil (`tagOrigin`, dans le repère du dessin).
 */
export function playStall(part: PartQuery, timeline: gsap.core.Timeline, tagOrigin: string): void {
  timeline
    .from(part("awning"), { y: -64, opacity: 0, duration: ONBOARD.awningDuration, ease: "power3.out", clearProps: SCENE_CLEAR })
    .from(
      part("bottle"),
      {
        y: 32,
        scale: 0.8,
        opacity: 0,
        transformOrigin: "50% 100%",
        duration: ONBOARD.bottleDuration,
        stagger: ONBOARD.bottleStagger,
        ease: "back.out(1.6)",
        clearProps: SCENE_CLEAR,
      },
      0.2,
    )
    .from(
      part("tag"),
      {
        rotation: ONBOARD.tagStartAngle,
        svgOrigin: tagOrigin,
        duration: ONBOARD.tagSwingDuration,
        ease: TAG_EASE,
        clearProps: SCENE_CLEAR,
      },
      0.25,
    );
}

/** Toucher l'étiquette la balance de nouveau (rien sous « réduire les animations »). */
export function swingTag(tag: Element, tagOrigin: string): void {
  if (!motionAllowed()) return;
  gsap.killTweensOf(tag);
  gsap.fromTo(
    tag,
    { rotation: ONBOARD.tagTapAngle, svgOrigin: tagOrigin },
    { rotation: 0, svgOrigin: tagOrigin, duration: ONBOARD.tagSwingDuration, ease: TAG_EASE, clearProps: SCENE_CLEAR },
  );
}
