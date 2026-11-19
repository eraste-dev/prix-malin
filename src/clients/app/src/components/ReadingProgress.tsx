import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { motionAllowed } from "../lib/motion";

gsap.registerPlugin(useGSAP);

/** Barre de lecture : un trait fin en haut de l'écran qui se remplit avec le défilement. Absente sans mouvement. */
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = motionAllowed();

  useGSAP(
    () => {
      const bar = ref.current;
      if (!allowed || bar === null) return;
      const setScale = gsap.quickSetter(bar, "scaleX");
      const update = (): void => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScale(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      };
      update();
      window.addEventListener("scroll", update, { passive: true });
      return () => window.removeEventListener("scroll", update);
    },
    { scope: ref },
  );

  if (!allowed) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-testid="reading-progress"
      className="fixed inset-x-0 top-0 z-40 h-1 origin-left bg-primary"
    />
  );
}
