import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChefHat, ShoppingBag, Wrench, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ACTIVITIES, type ActivityId } from "../lib/activity";
import { CALC, motionAllowed } from "../lib/motion";

const ICONS: Readonly<Record<ActivityId, LucideIcon>> = {
  resale: ShoppingBag,
  making: ChefHat,
  service: Wrench,
};

interface ActivityChoiceProps {
  readonly value: ActivityId;
  readonly onChange: (id: ActivityId) => void;
}

/** Q1 « Que vendez-vous ? » : trois tuiles à icône côte à côte, posées sur le fond (docs/15 E02). */
export function ActivityChoice({ value, onChange }: ActivityChoiceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  // La tuile choisie fait un petit rebond (GSAP) ; pas au premier affichage, ni sous « réduire les animations ».
  useGSAP(
    () => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      const selected = ref.current?.querySelector('[data-state="on"]');
      if (!motionAllowed() || selected === null || selected === undefined) return;
      gsap.fromTo(
        selected,
        { scale: CALC.popFrom },
        { scale: 1, duration: CALC.popDuration, ease: "back.out(2)", clearProps: "transform" },
      );
    },
    { dependencies: [value], scope: ref },
  );

  function handleChange(next: string): void {
    // Radix renvoie "" quand on reclique l'option active : on garde le choix.
    const match = ACTIVITIES.find((activity) => activity.id === next);
    if (match !== undefined) onChange(match.id);
  }

  return (
    <div ref={ref}>
    <ToggleGroup
      type="single"
      aria-label="Que vendez-vous ?"
      value={value}
      onValueChange={handleChange}
      variant="outline"
      spacing={2}
      className="grid w-full grid-cols-3 gap-3"
    >
      {ACTIVITIES.map((activity) => {
        const Icon = ICONS[activity.id];
        return (
          <ToggleGroupItem
            key={activity.id}
            value={activity.id}
            className="h-auto min-h-28 w-full flex-col justify-center gap-3 rounded-3xl bg-card px-1 py-4 text-center data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <Icon className="size-7" aria-hidden="true" />
            <span className="max-w-full text-base font-semibold break-words hyphens-auto">{activity.label}</span>
            <span className="sr-only">{activity.example}</span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
    </div>
  );
}
