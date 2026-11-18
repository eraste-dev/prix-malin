# clients

Interfaces utilisateur **publiques** de Prix Malin, et le code qu'elles partagent.

| Projet | Rôle | État |
|---|---|---|
| [domain](domain/README.md) | Moteur de calcul de prix (TypeScript pur) | Fait |
| `app` | Application publique : web (PWA), Android et iOS (Capacitor) | À créer (lot 1) |
| `site` | Site public indexé : accueil, articles, calculateur d'entrée | Plus tard (lot 3) |

## Principes

- **Hors ligne d'abord** : l'app est utilisable sans réseau ; le serveur l'enrichit sans jamais la bloquer ([ADR-0001](../../docs/adr/0001-app-hors-ligne-serveur-optionnel.md)).
- **Données sur l'appareil** : coûts et prix ne quittent pas le téléphone.
- **Aucune règle métier dans l'interface** : tout calcul passe par `domain`.
- **Mobile d'abord**, avec dispositions dédiées tablette et PC ([docs/16](../../docs/16-responsive-et-mouvement.md)).

## Stack prévue pour `app`

React + Vite (SPA/PWA), Capacitor pour les stores. Choix : [ADR-0008](../../docs/adr/0008-choix-de-la-stack.md), à valider par POC ([docs/12](../../docs/12-plan-poc.md)).

## Références

Parcours : [docs/13](../../docs/13-parcours-utilisateur.md) · Onboarding : [docs/14](../../docs/14-onboarding.md) · Écrans : [docs/15](../../docs/15-ecrans.md).
