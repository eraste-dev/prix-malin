/**
 * Les trois cartes de présentation (docs/14). Textes provisoires : la voix et le ton seront fixés par le guide de
 * rédaction, le fond validé par la comptable. Aucune carte ne demande de compte, de notification ni de position.
 * `scene` nomme l'illustration de la carte (DESIGN.md « Onboarding »).
 */
export interface OnboardingCard {
  readonly title: string;
  readonly message: string;
  readonly scene: "market" | "questions" | "lock";
}

export const ONBOARDING_CARDS: readonly OnboardingCard[] = [
  {
    title: "Le bon prix, en une minute",
    message: "Vendez-vous à perte sans le savoir ? Trois questions suffisent pour savoir à quel prix vendre.",
    scene: "market",
  },
  {
    title: "Trois questions, c'est tout",
    message:
      "Ce que vous vendez, ce que ça vous coûte, vos charges du mois. Le reste se règle ensuite, en regardant le prix bouger.",
    scene: "questions",
  },
  {
    title: "Vos chiffres restent chez vous",
    message: "Rien ne quitte votre téléphone. L'application marche sans internet.",
    scene: "lock",
  },
];
