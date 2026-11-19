import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { HOME } from "../lib/motion";
import { useScene } from "../lib/useScene";
import { Reveal } from "./Reveal";

const TOTAL = 3;
const SEGMENTS = Array.from({ length: TOTAL }, (_, index) => index);

interface ResumeCardProps {
  /** Intitulé du calcul commencé. */
  readonly title: string;
  /** Combien des trois nombres sont renseignés. */
  readonly filled: number;
}

/** « Reprendre » : trois segments montrent où en est le calcul ; ils se remplissent un à un à l'arrivée. */
export function ResumeCard({ title, filled }: ResumeCardProps) {
  const ref = useScene<HTMLDivElement>((_root, part, timeline) => {
    timeline.from(part("segment"), {
      scaleX: 0,
      transformOrigin: "0% 50%",
      duration: HOME.segmentDuration,
      stagger: HOME.segmentStagger,
      ease: "power2.out",
      clearProps: "transform",
    });
  });

  return (
    <Reveal as="section" aria-label="Reprendre" variant="fade" beat={1} className="rounded-3xl bg-card p-6">
      <div ref={ref} className="grid gap-4">
        <div className="grid gap-1">
          <p className="text-xl font-light">Reprendre : {title}</p>
          <p className="text-muted-foreground">
            {filled} sur {TOTAL} nombres renseignés
          </p>
        </div>
        <div aria-hidden="true" className="grid grid-cols-3 gap-2">
          {SEGMENTS.map((index) => (
            <span
              key={index}
              data-part="segment"
              data-testid="resume-segment"
              data-done={index < filled}
              className={index < filled ? "h-2 rounded-full bg-foreground" : "h-2 rounded-full bg-border"}
            />
          ))}
        </div>
        <Button asChild className="h-12 w-fit rounded-full px-6 text-base">
          <Link to="/calculer">Reprendre</Link>
        </Button>
      </div>
    </Reveal>
  );
}
