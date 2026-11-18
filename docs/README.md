# Prix Malin — Documentation produit

> Statut : **brouillon v0.1** · 2026-11-18 · Phase : cadrage (aucun code)

Application qui aide les petits commerçants, artisans et prestataires à fixer le **bon prix de vente** : couvrir tous leurs coûts, garder une vraie marge, rester cohérent face à la concurrence.

## Méthode de travail

| Principe | Application |
|---|---|
| **SDD** (Spec-Driven Development) | Les specs sont la source de vérité. Aucune fonctionnalité sans exigence ID (`EXG-xx`) et critères d'acceptation. Le code se déduit des specs, pas l'inverse. |
| **TDD** | Chaque critère d'acceptation devient un test **avant** le code. Les règles de calcul ont des vecteurs de test dans [03-regles-metier.md](03-regles-metier.md). |
| **Un seul code** | Web + Android + iOS depuis une même base. Choix de stack après validation des critères ([06-criteres-stack.md](06-criteres-stack.md)). |

## Sommaire

| # | Document | Contenu |
|---|---|---|
| 01 | [Vision](01-vision.md) | Problème, cibles, proposition de valeur, principes produit |
| 02 | [Cahier des charges](02-cahier-des-charges.md) | Exigences fonctionnelles et non fonctionnelles, avec critères d'acceptation |
| 03 | [Règles métier](03-regles-metier.md) | Formules, cas limites, **vecteurs de test** (base du TDD) |
| 04 | [MVP](04-mvp.md) | Périmètre, priorisation MoSCoW, feuille de route |
| 05 | [Audit de l'existant](05-audit-existant.md) | Ce que fait le prototype, ses défauts, ce qu'on garde |
| 06 | [Critères de choix de stack](06-criteres-stack.md) | Critères pondérés, sans décision encore |
| 07 | [Brief UX](07-brief-ux.md) | Contraintes et problèmes à résoudre pour la refonte du design |
| 08 | [Questions ouvertes](08-questions-ouvertes.md) | Décisions à prendre avec la porteuse du projet |
| 09 | [Vision système](09-vision-systeme.md) | App + API + back-office : composants, principes, tranches B0 à B3 |
| 10 | [CDC back-office](10-cahier-des-charges-backoffice.md) | Exigences `BO-xx` par tranche |
| 11 | [Propositions de stack](11-propositions-stack.md) | 3 options comparées, recommandation, plan de POC |
| 12 | [Plan des POC](12-plan-poc.md) | P1 à P5 et P8 : critères chiffrés, ordre, règles de décision |
| 13 | [Parcours utilisateur](13-parcours-utilisateur.md) | Parcours cible, budget de saisie, trajectoires, garde-fous |
| 14 | [Onboarding](14-onboarding.md) | Premier lancement : cartes, exemple guidé, aides contextuelles |
| 15 | [Écrans](15-ecrans.md) | E00 à E14 : contenu, données, actions, états, critères |
| 16 | [Responsive et mouvement](16-responsive-et-mouvement.md) | Mobile / tablette / PC, animations et transitions coordonnées |
| — | [adr/](adr/README.md) | Décisions d'architecture justifiées (ADR) |

## Décisions déjà prises (2026-11-18)

| Sujet | Décision |
|---|---|
| Marché | Côte d'Ivoire, français, F CFA. i18n et multi-devise **prévus dans l'architecture** mais non activés. |
| Données | **Local-first, sans compte** au MVP. Fonctionne hors ligne. Comptes et synchro en V2. |
| Modèle économique | Gratuit pour l'instant. Aucun paiement ni publicité au MVP. |
| Documentation | Markdown versionné dans `docs/`. |
| Arrondi | Interrupteur activé/désactivé, pas configurable. |
| TVA | Optionnelle, 18 % seule, avec commutateur HT/TTC. Régimes particuliers hors MVP. |
| Périmètre MVP | Mode « tester mon prix actuel » **inclus** ; charges fixes partagées **incluses** (version simple). |
| Sauvegarde | Stockage local sur l'appareil ; serveur en V2. |
| Distribution | PWA web **et** stores (Android, iOS). |
| Nature du livrable | Un **système** évolutif (app publique + API + back-office), chaque choix tracé en ADR. |
| Ordre de construction | **Lot 1 : app publique seule** (contenu embarqué) pour valider design et UX ; lot 2 : API + back-office B0 ; lot 3 : site public ; ensuite B1, B2, B3 (conçus dès maintenant). |
| Stack | React + Vite + Capacitor (app), AdonisJS (API et back-office) : ADR-0008 acceptée sous réserve de POC. |
| Site public | Site indexé par Google **distinct de l'app**, alimenté par le contenu du back-office ; construit après la livraison 1, conçu dès B0. |
| Lien app/serveur | Optionnel : l'app marche 100 % hors ligne, le serveur l'enrichit (ADR-0001). |
| Propriété | **À clarifier** : l'application est celle de la porteuse du projet, le développeur la construit pour elle. Développeur full stack et porteuse du projet (comptable) travaillent dans la même société : statut à fixer par écrit (Q-16) et contrat de travail du développeur à vérifier (Q-21). |
| Validation du contenu | Par la porteuse du projet (comptable). |

## Ordre des prochaines séances

1. Valider cette documentation et trancher [les questions ouvertes](08-questions-ouvertes.md).
2. Refonte UX/UI (parcours, maquettes, design system), pilotée par toi.
3. Choix de stack, avec preuve de concept sur les points à risque.
4. Specs détaillées par fonctionnalité (`docs/specs/`), puis tests, puis code.
