# @prix-malin/domain

Moteur de calcul de prix : **pur, exact, sans dépendance**. C'est le cœur du produit ; l'interface, le stockage et le réseau n'en font pas partie.

> **Statut : implémenté et testé** (POC P1, validé sous Node). Reste à valider dans le navigateur et sur appareil Android.

## Ce qu'il fait

| Fonction | Rôle | Règles |
|---|---|---|
| `computePrice(input)` | Prix conseillé et décomposition complète | RG-01 à RG-07 |
| `analyzePrice(input, ownPrice)` | Verdict sur un prix déjà fixé (« tester mon prix ») | RG-09 |
| `compareWithCompetitor(input, data, price)` | Position face à un concurrent | RG-10 |

Règles détaillées et vecteurs de test : [docs/03-regles-metier.md](../../../docs/03-regles-metier.md).

## Utilisation

```ts
import { computePrice } from "@prix-malin/domain";

const result = computePrice({
  directLines: [{ quantity: 1, unitPrice: 210 }],
  fixedMonthly: [220000],
  monthlyVolume: 2000,
  marginPct: 25,
  feePct: 1,
  rounding: { enabled: true, step: 25 },
  vat: { enabled: false, base: "HT" },
});

if (result.ok) {
  result.data.priceExclVat; // 450
  result.data.fullCost; // 320
  result.data.breakEvenUnits; // 935
} else {
  result.reason; // "INVALID_VOLUME" | "NO_COST" | "MARGIN_FEES_TOO_HIGH" | "INVALID_INPUT"
}
```

Les fonctions ne lancent pas d'exception sur des entrées invalides : elles renvoient `{ ok: false, reason }`.

## Principes

- **Pur** : aucune entrée-sortie, aucun état, aucune horloge, aucun hasard. Mêmes entrées, mêmes sorties, sur toutes les plateformes ([ADR-0003](../../../docs/adr/0003-moteur-de-calcul-pur-partage.md)).
- **Exact** : fractions d'entiers `bigint`, aucune dérive flottante ; arrondi uniquement aux points définis ([ADR-0002](../../../docs/adr/0002-montants-en-francs-entiers.md)).
- **Sans dépendance** : un test vérifie que `src/` n'importe rien d'extérieur.
- **Unités** : montants en F CFA, pourcentages en points (`25` = 25 %), 6 décimales maximum en entrée.

## Structure

```
src/
├── ratio.ts       Arithmétique exacte (fractions)
├── types.ts       Types publics
├── context.ts     Validation et calculs communs
├── pricing.ts     Prix conseillé
├── analysis.ts    Analyse d'un prix, comparaison concurrent
└── index.ts       API publique
tests/             Vecteurs de référence, cas limites, propriétés, pureté
```

## Commandes

Depuis `src/clients/domain` :

```bash
pnpm test             # exécute les tests
pnpm test:watch       # mode interactif
pnpm test:coverage    # couverture (seuil : 100 %)
pnpm typecheck        # vérification des types
```

## Tests

Quatre familles, toutes obligatoires :

1. **Vecteurs de référence** : trois exemples chiffrés issus du prototype d'origine.
2. **Cas limites** : volume nul, marge et frais trop hauts, coût nul, quantités décimales, arrondis, TVA.
3. **Propriétés** (fast-check) : le prix n'est jamais sous le prix brut, la décomposition est exacte, le taux de marque n'est jamais inférieur au taux visé, monotonie.
4. **Pureté** : aucune dépendance externe, aucun accès UI, réseau ou stockage.

## Contribuer

Toute règle de calcul s'ajoute **en commençant par un test** qui échoue, avec la référence de la règle (`RG-xx`). Si une règle change, mettre à jour [docs/03-regles-metier.md](../../../docs/03-regles-metier.md) dans le même changement. Ne jamais ajouter de dépendance à ce paquet.
