# Prix Malin

Application qui aide les petits commerçants, artisans et prestataires à fixer le **bon prix de vente** : couvrir tous leurs coûts, garder une vraie marge, rester cohérent face à la concurrence.

> **Statut : cadrage terminé, démarrage du lot 1.** Le moteur de calcul est écrit et testé ; l'application, le back-office et l'infrastructure ne sont pas encore commencés.

## Pourquoi

Beaucoup de petits commerces fixent leurs prix en copiant le voisin et oublient leur salaire, le transport, les pertes ou les frais de paiement. Prix Malin donne un prix conseillé en trois questions, explique ses calculs en langage simple, fonctionne hors ligne et garde les données sur l'appareil.

## Le système

| Composant | Dossier | Rôle | État |
|---|---|---|---|
| Moteur de calcul | [src/clients/domain](src/clients/domain/README.md) | Règles de prix, pures et testées | Fait (P1) |
| App publique | [src/clients](src/clients/README.md) | Web (PWA), Android, iOS | À venir (lot 1) |
| Back-office | [src/admin](src/admin/README.md) | Contenu, statistiques, comptes, support | À venir (lot 2 et suivants) |
| Infrastructure | [src/infra](src/infra/README.md) | Déploiement, CI/CD, environnements | À venir |

Ordre de construction : app publique d'abord (valider le design et l'expérience), puis API et back-office, puis site public. Détail dans [docs/09-vision-systeme.md](docs/09-vision-systeme.md).

## Démarrage rapide

Prérequis : Node.js 22 ou plus, pnpm 10.

```bash
cd src
pnpm install
pnpm test          # tous les tests
pnpm typecheck     # vérification des types
```

Les commandes pnpm se lancent depuis `src/`, qui est la racine du monorepo.

## Structure

```
prix-malin/
├── docs/                 Documentation produit, spécifications, décisions (ADR)
├── src/
│   ├── clients/          Interfaces utilisateur publiques
│   │   └── domain/       Moteur de calcul (TypeScript pur)
│   ├── admin/            Back-office (AdonisJS, prévu)
│   ├── infra/            Infrastructure (prévu)
│   ├── package.json      Scripts communs
│   ├── pnpm-workspace.yaml
│   └── tsconfig.base.json
├── CLAUDE.md             Consignes pour l'assistant de développement
└── README.md
```

## Méthode de travail

- **SDD** (Spec-Driven Development) : les spécifications sont la source de vérité ; aucune fonctionnalité sans exigence numérotée et critères d'acceptation.
- **TDD** : chaque critère devient un test avant le code ; les règles de calcul sont verrouillées par des vecteurs de test.
- **ADR** : chaque décision d'architecture est tracée et justifiée dans [docs/adr](docs/adr/README.md).

## Documentation

Point d'entrée : [docs/README.md](docs/README.md). Les plus utiles pour commencer :

| Besoin | Document |
|---|---|
| Comprendre le produit | [01 — Vision](docs/01-vision.md) |
| Savoir ce qu'on construit | [02 — Cahier des charges](docs/02-cahier-des-charges.md), [04 — MVP](docs/04-mvp.md) |
| Connaître les formules | [03 — Règles métier](docs/03-regles-metier.md) |
| Voir les écrans et parcours | [13](docs/13-parcours-utilisateur.md), [15](docs/15-ecrans.md), [16](docs/16-responsive-et-mouvement.md) |
| Comprendre la stack | [11 — Propositions de stack](docs/11-propositions-stack.md), [ADR-0008](docs/adr/0008-choix-de-la-stack.md) |
| Décisions et questions en cours | [08 — Questions](docs/08-questions-ouvertes.md) |

## Stack

React + Vite + Capacitor (app), AdonisJS (API et back-office), PostgreSQL, TypeScript partout. Choix acceptés sous réserve de POC : [ADR-0008](docs/adr/0008-choix-de-la-stack.md).

## Licence et propriété

À définir. Le statut du projet et la propriété du code, du nom et du contenu sont une question ouverte (voir Q-16 et Q-21 dans [docs/08-questions-ouvertes.md](docs/08-questions-ouvertes.md)). En attendant : tous droits réservés.
