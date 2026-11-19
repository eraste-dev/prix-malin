# Architecture Decision Records (ADR)

Chaque décision structurante est tracée ici : **contexte, options, choix, conséquences**. Une ADR n'est jamais effacée : si on change d'avis, on en écrit une nouvelle qui **remplace** l'ancienne.

## Statuts

`Proposée` → `Acceptée` → (`Remplacée par ADR-xxxx` | `Abandonnée`)

## Quand écrire une ADR

- Le choix est difficile à changer plus tard (données, contrats, sécurité, stack).
- Plusieurs options raisonnables existent.
- Un nouvel arrivant se demanderait « pourquoi comme ça ? ».

## Index

| N° | Titre | Statut |
|---|---|---|
| [0001](0001-app-hors-ligne-serveur-optionnel.md) | App hors ligne, serveur optionnel | Acceptée |
| [0002](0002-montants-en-francs-entiers.md) | Montants en francs entiers, sans flottants | Proposée |
| [0003](0003-moteur-de-calcul-pur-partage.md) | Moteur de calcul pur et partagé | Acceptée |
| [0004](0004-contrat-api-versionne.md) | Contrat d'API versionné, défini avant l'implémentation | Proposée |
| [0005](0005-contenu-donnee-versionnee.md) | Contenu pédagogique géré comme donnée versionnée | Acceptée |
| [0006](0006-donnees-personnelles-et-consentement.md) | Minimisation des données et consentement | Acceptée |
| [0007](0007-securite-backoffice.md) | Sécurité du back-office | Proposée |
| [0008](0008-choix-de-la-stack.md) | Choix de la stack (app, API, back-office) | **Acceptée sous réserve de POC** |
| 0009 | Hébergement et exploitation | À venir |
| [0010](0010-bibliotheque-ui-shadcn.md) | Bibliothèque UI : shadcn/ui (Tailwind + Radix) | Proposée |
| [0011](0011-bibliotheque-animation-gsap.md) | Bibliothèque d'animation : GSAP | Proposée |
| [0012](0012-etat-et-stockage-local.md) | État de l'app et stockage local : zustand, zod, stockage derrière une interface | Proposée |
| [0013](0013-hors-ligne-pwa.md) | Hors ligne : PWA avec vite-plugin-pwa | Proposée |
| [0014](0014-routage-par-hash.md) | Routage : react-router, adresses par hash | Proposée |
| [0015](0015-visite-guidee-driverjs.md) | Visite guidée : driver.js (version épinglée) | Proposée |

## Modèle

```markdown
# ADR-NNNN — Titre

- Statut : Proposée | Acceptée | Remplacée par ADR-xxxx
- Date : AAAA-MM-JJ
- Décideurs : …

## Contexte
Le problème, les contraintes, ce qui force une décision.

## Options considérées
1. Option A — avantages / inconvénients
2. Option B — …

## Décision
Ce qu'on choisit, en une phrase, puis pourquoi.

## Conséquences
Positives, négatives, risques, ce que ça impose ailleurs.

## Vérification
Comment on saura que la décision tient (test, mesure, revue).
```
