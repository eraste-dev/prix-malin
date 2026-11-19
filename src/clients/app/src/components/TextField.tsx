import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly maxLength?: number;
  /** Libellé lu par les lecteurs d'écran seulement (champs répétés d'une liste). */
  readonly labelHidden?: boolean;
  readonly autoFocus?: boolean;
}

/** Champ de texte libre (nom du produit, unité, libellé d'une ligne). */
export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength = 60,
  labelHidden = false,
  autoFocus = false,
}: TextFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className={labelHidden ? "sr-only" : "text-base font-semibold"}>
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        type="text"
        autoComplete="off"
        autoFocus={autoFocus}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-xl text-xl md:text-xl"
      />
    </div>
  );
}
