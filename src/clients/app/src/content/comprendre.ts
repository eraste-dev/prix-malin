import { z } from "zod";

/*
 * Contenu pédagogique (E11, E12). Donnée versionnée avec schéma, validée au chargement (ADR-0005) : le contenu ne
 * vit jamais dans les composants, pour pouvoir un jour venir du serveur (lot 2) sans refonte.
 * Textes provisoires : le fond doit être validé par la comptable, la forme par le guide de rédaction (docs/07).
 */

export const CONTENT_SCHEMA_VERSION = 1 as const;
export const CONTENT_VERSION = 1;

const slug = z.string().regex(/^[a-z0-9-]+$/).min(2).max(40);

export const articleSchema = z.object({
  slug,
  title: z.string().min(3).max(80),
  summary: z.string().min(10).max(160),
  paragraphs: z.array(z.string().min(10).max(600)).min(2).max(8),
  /** Un conseil court, repris par « le conseil du moment » de l'accueil. */
  tip: z.string().min(10).max(200),
});

export const HELP_TERMS = [
  "cout-direct",
  "charges-fixes",
  "cout-de-revient",
  "marge",
  "seuil",
  "salaire",
  "volume",
  "frais",
] as const;

export type HelpTerm = (typeof HELP_TERMS)[number];

const glossaryEntrySchema = z.object({
  title: z.string().min(2).max(60),
  /** « 3 à 5 lignes » : une définition courte, en français simple. */
  text: z.string().min(20).max(260),
  /** L'article « En savoir plus ». */
  slug,
});

export const contentSchema = z.object({
  schema: z.literal(CONTENT_SCHEMA_VERSION),
  version: z.number().int().min(1),
  articles: z.array(articleSchema).min(1),
  glossary: z.record(z.string(), glossaryEntrySchema),
});

export type Article = z.infer<typeof articleSchema>;
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;

const RAW_ARTICLES: readonly Article[] = [
  {
    slug: "cout-direct",
    title: "Le coût direct",
    summary: "Ce que vous dépensez pour fabriquer ou acheter une seule vente.",
    paragraphs: [
      "Le coût direct, c'est tout ce que vous dépensez pour une vente : les matières, l'emballage, le transport de ce produit, et ce que vous perdez (produits abîmés, restes).",
      "Comptez ce que vous avez réellement payé, au prix où vous l'avez acheté. Si un sac de 25 kg vous sert à faire 100 bouteilles, chaque bouteille porte un centième du sac.",
      "Il ne dépend pas du nombre de ventes : une bouteille coûte autant à faire, que vous en vendiez dix ou mille.",
    ],
    tip: "Pensez aux petits coûts qu'on oublie : le sachet, le transport, la part qui se perd.",
  },
  {
    slug: "charges-fixes",
    title: "Les charges fixes",
    summary: "Ce que vous payez chaque mois, même quand vous ne vendez rien.",
    paragraphs: [
      "Les charges fixes sont les dépenses du mois qui ne changent pas avec vos ventes : le loyer, l'électricité, l'eau, le téléphone, le transport, une aide ou un salarié, et votre propre salaire.",
      "Il faut bien les payer avec ce que vous vendez. Le prix doit donc en couvrir une petite part à chaque vente : on divise vos charges du mois par le nombre de ventes du mois.",
      "Votre salaire est une charge comme les autres. Si vous ne le comptez pas, votre prix est trop bas et vous travaillez pour rien.",
    ],
    tip: "N'oubliez pas votre salaire : sans lui, votre prix est trop bas.",
  },
  {
    slug: "cout-de-revient",
    title: "Le coût de revient",
    summary: "Ce que vous coûte vraiment une vente : coût direct plus part des charges.",
    paragraphs: [
      "Le coût de revient d'une vente est le coût direct plus la part des charges du mois qui revient à cette vente.",
      "Si une bouteille vous coûte 210 F à faire et que vos charges du mois sont de 220 000 F pour 2 000 ventes, chaque vente porte 110 F de charges : le coût de revient est de 320 F.",
      "En dessous de ce prix, vous perdez de l'argent. Les frais de paiement (Mobile Money) s'ajoutent à part.",
    ],
    tip: "Ne vendez jamais sous votre coût de revient, même pour attirer un client.",
  },
  {
    slug: "marge",
    title: "La marge",
    summary: "Ce qu'il vous reste sur une vente une fois tout payé.",
    paragraphs: [
      "La marge, c'est ce qu'il vous reste sur une vente après avoir payé le coût de revient et les frais de paiement. C'est elle qui rémunère votre travail et vos projets.",
      "Ici, la marge est un pourcentage du prix de vente, pas du coût. Ajouter 25 % au coût ne donne en réalité que 20 % du prix : c'est un piège courant.",
      "Une marge trop faible ne laisse rien pour les imprévus, ni pour faire grandir l'activité.",
    ],
    tip: "Ajouter 25 % à votre coût ne donne que 20 % du prix : c'est un piège courant.",
  },
  {
    slug: "prix",
    title: "Le prix de vente",
    summary: "Comment le prix conseillé est construit, étape par étape.",
    paragraphs: [
      "Le prix conseillé est la somme du coût direct, de la part des charges, des frais de paiement et de la marge que vous gardez.",
      "L'arrondi se fait toujours vers le haut, jamais sous le prix calculé : l'écart s'ajoute à votre marge. Vous pouvez le régler ou le couper.",
      "La TVA, si vous la facturez, s'ajoute au prix. Elle ne vous appartient pas : elle n'entre ni dans vos coûts, ni dans votre marge.",
    ],
    tip: "Vous pouvez arrondir : le prix monte un peu, il ne descend jamais.",
  },
  {
    slug: "seuil",
    title: "Le seuil de rentabilité",
    summary: "Le nombre de ventes par mois à partir duquel vous ne perdez plus d'argent.",
    paragraphs: [
      "Le seuil, c'est le nombre de ventes par mois qu'il faut atteindre pour couvrir vos charges. En dessous, vous perdez de l'argent ; au-dessus, chaque vente en plus vous rapporte.",
      "Plus votre prix est bas, plus le seuil est haut. Si le prix est trop bas, le seuil devient impossible à atteindre : même en vendant beaucoup, vous perdez.",
      "Comparez ce seuil à ce que vous vendez vraiment chaque mois, pas à ce que vous espérez vendre.",
    ],
    tip: "Comparez le seuil à ce que vous vendez vraiment chaque mois.",
  },
  {
    slug: "a-compter",
    title: "À compter, à ne pas compter",
    summary: "Ce qui entre dans vos coûts, et ce qui n'y a pas sa place.",
    paragraphs: [
      "À compter dans le coût direct : les matières premières, l'emballage, le transport de ce produit, les pertes.",
      "À compter dans les charges du mois : le loyer, l'électricité, l'eau, le téléphone, l'aide ou le salarié, l'entretien du matériel, et votre rémunération.",
      "À ne pas compter : les dépenses de la maison sans lien avec l'activité, et les achats pour vous-même. Séparez l'argent de la maison et celui de l'activité.",
    ],
    tip: "Séparez l'argent de la maison et celui de l'activité.",
  },
  {
    slug: "cinq-erreurs",
    title: "Les 5 erreurs qui font fermer",
    summary: "Les erreurs de prix les plus courantes, et comment les éviter.",
    paragraphs: [
      "1. Oublier son propre salaire. 2. Ne pas compter les petits coûts : l'emballage, le transport, les pertes.",
      "3. Copier le prix du voisin sans connaître son coût : il n'a ni les mêmes charges, ni les mêmes ventes que vous.",
      "4. Calculer sa marge sur le coût au lieu du prix de vente. 5. Compter sur trop de ventes : un volume irréaliste donne un prix trop bas.",
    ],
    tip: "Un prix, c'est un calcul : le voisin n'a pas les mêmes charges que vous.",
  },
];

const RAW_GLOSSARY: Readonly<Record<HelpTerm, GlossaryEntry>> = {
  "cout-direct": {
    title: "Coût direct",
    text: "Ce que vous dépensez pour une seule vente : matières, emballage, transport, pertes. Comptez tout, même les petits coûts.",
    slug: "cout-direct",
  },
  "charges-fixes": {
    title: "Charges fixes",
    text: "Ce que vous payez chaque mois, même sans vendre : loyer, électricité, eau, téléphone, aide… et votre salaire.",
    slug: "charges-fixes",
  },
  "cout-de-revient": {
    title: "Coût de revient",
    text: "Le coût direct plus la part des charges d'une vente. En dessous de ce prix, vous perdez de l'argent.",
    slug: "cout-de-revient",
  },
  marge: {
    title: "Marge",
    text: "Ce qu'il vous reste sur une vente une fois tout payé, en pourcentage du prix de vente.",
    slug: "marge",
  },
  seuil: {
    title: "Ventes minimum",
    text: "Le nombre de ventes par mois à partir duquel vous ne perdez plus d'argent. En dessous, vos charges ne sont pas couvertes.",
    slug: "seuil",
  },
  salaire: {
    title: "Votre salaire",
    text: "Votre rémunération est une charge comme les autres. Sans elle, votre prix est trop bas.",
    slug: "charges-fixes",
  },
  volume: {
    title: "Volume des ventes",
    text: "Combien de ventes vous faites en un mois. Soyez réaliste : un volume trop optimiste donne un prix trop bas.",
    slug: "cinq-erreurs",
  },
  frais: {
    title: "Frais de paiement",
    text: "Ce que prend le paiement mobile, en pourcentage du prix : 1 % avec Mobile Money, rien en espèces.",
    slug: "prix",
  },
};

/** Échoue au chargement si le contenu est abîmé : mieux vaut le voir tout de suite qu'à l'écran. */
export const CONTENT = contentSchema.parse({
  schema: CONTENT_SCHEMA_VERSION,
  version: CONTENT_VERSION,
  articles: RAW_ARTICLES,
  glossary: RAW_GLOSSARY,
});

export const ARTICLES: readonly Article[] = CONTENT.articles;
export const GLOSSARY = RAW_GLOSSARY;

export function findArticle(wanted: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === wanted);
}

/** Un conseil par jour, le même toute la journée (rotatif, sans aléa). */
export function tipOfTheDay(date: Date): { readonly slug: string; readonly text: string } {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86_400_000);
  const article = ARTICLES[dayOfYear % ARTICLES.length] ?? ARTICLES[0];
  if (article === undefined) throw new Error("Aucun article de contenu");
  return { slug: article.slug, text: article.tip };
}
