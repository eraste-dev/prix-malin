import { useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DecimalFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
}

const MAX_VALUE = 1_000_000;

/** « 0,5 » ou « 0.5 » → 0.5 ; tout ce qui n'est pas un nombre valide → `null`. */
export function parseDecimal(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return 0;
  if (!/^\d*\.?\d{0,3}$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value <= MAX_VALUE ? value : null;
}

const display = (value: number): string => String(value).replace(".", ",");

/**
 * Quantité décimale (0,5 kg). Pendant la frappe, on garde le texte tel quel (« 0, » reste « 0, ») ;
 * il est remis en forme à la sortie du champ.
 */
export function DecimalField({ id, label, value, onChange }: DecimalFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const raw = event.target.value;
    const parsed = parseDecimal(raw);
    if (parsed === null) return;
    setDraft(raw);
    onChange(parsed);
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={draft ?? display(value)}
        onChange={handleChange}
        onBlur={() => setDraft(null)}
        className="h-12 rounded-xl text-xl tabular-nums md:text-xl"
      />
    </div>
  );
}
