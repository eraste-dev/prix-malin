import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface SegmentOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

interface SegmentedProps<T extends string> {
  /** Nom accessible du groupe (lu par les lecteurs d'écran). */
  readonly label: string;
  readonly value: T;
  readonly options: readonly SegmentOption<T>[];
  readonly onChange: (value: T) => void;
}

/**
 * Contrôle segmenté : choix exclusif de 2 à 3 libellés courts (Total/Détail, HT/TTC…), docs/ui-ux.
 * Radix : rôle radiogroup, flèches du clavier.
 */
export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  function handleChange(next: string): void {
    // Radix renvoie "" quand on reclique l'option active : on garde le choix.
    const match = options.find((option) => option.value === next);
    if (match !== undefined) onChange(match.value);
  }

  return (
    <ToggleGroup
      type="single"
      aria-label={label}
      value={value}
      onValueChange={handleChange}
      className="w-fit rounded-full bg-muted p-1"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="h-11 min-w-20 rounded-full px-5 text-base data-[state=on]:bg-foreground data-[state=on]:text-background"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
