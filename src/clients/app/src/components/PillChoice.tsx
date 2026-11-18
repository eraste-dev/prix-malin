import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface PillOption<T extends number> {
  readonly value: T;
  readonly label: string;
}

interface PillChoiceProps<T extends number> {
  readonly label: string;
  readonly options: readonly PillOption<T>[];
  /** Valeur active ; `null` si elle ne correspond à aucune pastille (ex. marge par défaut de 25 %). */
  readonly value: number | null;
  readonly onChange: (value: T) => void;
}

/** Choix exclusif en pastilles (marge, frais). Radix : rôle radiogroup, flèches du clavier. */
export function PillChoice<T extends number>({ label, options, value, onChange }: PillChoiceProps<T>) {
  function handleChange(next: string): void {
    // Radix renvoie "" quand on reclique l'option active : on garde le choix.
    const match = options.find((option) => String(option.value) === next);
    if (match !== undefined) onChange(match.value);
  }

  return (
    <ToggleGroup
      type="single"
      aria-label={label}
      value={value === null ? "" : String(value)}
      onValueChange={handleChange}
      variant="outline"
      spacing={2}
      className="flex-wrap"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={String(option.value)}
          className="h-11 min-w-16 rounded-full px-5 text-base data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
