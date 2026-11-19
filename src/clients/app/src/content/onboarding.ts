/**
 * Les trois cartes de présentation (docs/14). Textes provisoires : la voix et le ton seront fixés par le guide de
 * rédaction, le fond validé par la comptable. Aucune carte ne demande de compte, de notification ni de position.
 */
export interface OnboardingCard {
  readonly title: string;
  readonly message: string;
  readonly icon: "receipt" | "steps" | "lock";
}

export const ONBOARDING_CARDS: readonly OnboardingCard[] = [
  {
    title: "Le bon prix, en une minute",
    message: "Vendez-vous à perte sans le savoir ? Trois questions suffisent pour savoir à quel prix vendre.",
    icon: "receipt",
  },
  {
    title: "Trois questions, c'est tout",
    message:
      "Ce que vous vendez, ce que ça vous coûte, vos charges du mois. Le reste se règle ensuite, en regardant le prix bouger.",
    icon: "steps",
  },
  {
    title: "Vos chiffres restent chez vous",
    message: "Rien ne quitte votre téléphone. L'application marche sans internet.",
    icon: "lock",
  },
];
