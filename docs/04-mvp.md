# 04 — Définition du MVP

## Hypothèse à valider

> Un commerçant qui comprend le calcul de son coût de revient fixe un prix plus juste, et revient l'utiliser quand ses coûts changent.

Le MVP existe pour **tester cette hypothèse auprès de vrais utilisateurs**, pas pour être complet.

## Périmètre MVP

### Inclus (Must)

| Bloc | Exigences |
|---|---|
| Parcours de calcul guidé | EXG-01, 02, 03, 10, 11, 12, 13, 14 |
| Moteur de prix | EXG-16, 20 à 27 (dont charges partagées et mode « tester mon prix actuel », validés) |
| Résultat et verdict | EXG-30, 31, 32, 33 |
| Pédagogie | EXG-34 |
| Persistance locale | EXG-40, 41, 42 |
| Partage | EXG-43 |
| Transverses | EXG-50, NFR-01, 02, 03, 06, 08, 09, 10, 11, 12 |

### Back-office et ordre de construction

**Le MVP est l'app publique seule (lot 1)**, avec contenu et configuration embarqués, afin de valider le design et l'expérience avant le back-office. **B0** arrive au lot 2 ([10](10-cahier-des-charges-backoffice.md)). B1, B2 et B3 sont conçus mais construits après. Voir [09](09-vision-systeme.md) pour les lots et leurs dépendances.

### Inclus si le budget le permet (Should)

EXG-04 exemple prérempli · EXG-15 suggestions de lignes · EXG-35 explications au toucher · EXG-44 export/import · EXG-51 thème · EXG-52 prise en main · EXG-57 contenu pédagogique versionné.

**Décision (2026-11-18)** : EXG-26 (mode inverse) et EXG-16 (charges partagées) sont passés en **Must**. Justification ci-dessous.

### Exclus du MVP

EXG-36, 45, 46 (Could) · EXG-53, 54, 55 (Won't) : comptes, multi-pays, paiement, pub.

## Deux changements proposés par rapport au prototype

1. **Mode inverse (« j'ai déjà un prix »).** Le prototype ne sait que *recommander* un prix. Or la plupart des commerçants ont **déjà** un prix et veulent savoir « est-ce que je gagne de l'argent ? ». C'est plus proche de leur question réelle, et c'est le seul cas où les verdicts « perte » et « charges non couvertes » ont un sens (ils sont inatteignables en mode conseil). Ça mérite d'être un point d'entrée du parcours.
2. **Charges fixes partagées.** Aujourd'hui, un commerçant avec 10 produits doit ressaisir son loyer, son électricité et son salaire 10 fois, en répartissant lui-même, ce qui fausse les prix. Un « profil d'activité » avec les charges communes, et une part de volume par produit, règle le problème. C'est une source d'erreur majeure à éviter.

Ces deux points sont à valider avec la porteuse du projet (voir [08](08-questions-ouvertes.md)).

## Parcours cible (à affiner en UX)

```
Ouverture ─► [Premier lancement ?] ─► Prise en main (passable)
                                         │
Accueil ─┬─► « Calculer un prix » ─► Activité ─► Coûts directs ─► Charges & volume ─► Marge & marché ─► Résultat
         ├─► « Tester mon prix actuel » ─► (mêmes saisies) ─► Verdict
         ├─► « Mes prix » ─► liste ─► ouvrir / dupliquer / supprimer
         └─► « Comprendre » ─► glossaire, erreurs fréquentes
```

## Critères de sortie du MVP

- Tous les critères d'acceptation Must passent en tests automatisés.
- Moteur de calcul : vecteurs de [03](03-regles-metier.md) verts sur web, Android et iOS.
- Test avec **5 commerçants réels** : au moins 4 calculent un prix sans aide en < 5 min.
- Fonctionne hors ligne, installé, sur un Android d'entrée de gamme.
- Application soumise et acceptée sur au moins une boutique (Play Store ou App Store), PWA en ligne.

## Feuille de route indicative

| Phase | Contenu | Livrable |
|---|---|---|
| **0 — Cadrage** (en cours) | Cette documentation | Docs validées |
| **1 — UX/UI** | Parcours, maquettes, design system, tests sur maquettes | Prototype cliquable |
| **2 — Fondations** | Choix de stack + preuve de concept, CI, structure, moteur de calcul testé (TDD) | Moteur + squelette déployé sur les 3 cibles |
| **3 — MVP** | Parcours, persistance, partage, pédagogie | Version testable (PWA) |
| **4 — Stores** | Packaging, politique de confidentialité, soumissions | Apps publiées |
| **5 — V1.1** | Retours terrain : export, historique, suggestions | Itération |
| **V2** | Comptes, stockage serveur, **back-office** (statistiques d'usage), **offres tarifaires avec limites d'utilisation**, autres pays | À cadrer |

### Anticiper la V2 dès le MVP (sans la construire)

Les limites d'utilisation liées à une offre ne peuvent pas être appliquées de façon fiable côté appareil (contournables, hors ligne). Elles exigeront un **identifiant de compte et un contrôle serveur**. Conséquences dès maintenant :
- l'accès au stockage passe par une **interface** (local aujourd'hui, serveur demain) ;
- chaque donnée a un **identifiant unique** et une **version de schéma** (synchro future) ;
- les fonctions « limitables » (nombre de prix enregistrés, export…) passent par un point unique de vérification de droits, aujourd'hui toujours « autorisé » ;
- tout paiement dans l'app sur iOS/Android est soumis aux systèmes de paiement et commissions des stores : à étudier au cadrage V2.

## Risques principaux

| Risque | Impact | Parade |
|---|---|---|
| Public cible mal compris (hypothèses non vérifiées) | Fort | Entretiens et test avec 5 à 8 commerçants **avant** de figer l'UX |
| Refus par l'App Store d'une app trop « site web » | Moyen | Vérifier les règles Apple 4.2 (fonctionnalité minimale) ; valeur native : hors ligne, partage, stockage |
| Complexité du multi-plateforme avec un seul code | Moyen | Choix de stack avec POC sur les 3 cibles avant engagement |
| Perte de données locales (téléphone changé, cache vidé) | Fort | Export/import (EXG-44), message clair sur ce risque dès le MVP |
| Calcul perçu comme « magique », donc non crédible | Moyen | Décomposition transparente, formules visibles, EXG-35 |
| Données saisies fausses, donc prix faux | Moyen | Rappels pédagogiques, alertes d'incohérence |
| Coût des comptes développeur (Apple 99 USD/an, Google 25 USD une fois) | Faible | À budgéter, voir [08](08-questions-ouvertes.md) |
