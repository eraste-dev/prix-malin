# 11 — Propositions de stack

> Statut : **proposition**, à valider par POC. La décision sera tracée dans [ADR-0008](adr/0008-choix-de-la-stack.md). Les notes ci-dessous sont mon **jugement d'ingénieur**, pas des mesures : le POC doit les confirmer ou les renverser.

## 1. Ce que la stack doit résoudre

Issu des décisions déjà prises :

- **Trois produits, une équipe réduite** : app publique (web, Android, iOS), back-office web, API. Développeur full stack.
- **Moteur de calcul pur et partagé** ([ADR-0003](adr/0003-moteur-de-calcul-pur-partage.md)) et **contrat d'API versionné** ([ADR-0004](adr/0004-contrat-api-versionne.md)) → un **langage commun** entre client et serveur simplifie fortement ces deux points.
- **Hors ligne d'abord** ([ADR-0001](adr/0001-app-hors-ligne-serveur-optionnel.md)), appareils modestes, data limitée.
- **Design 100 % sur mesure** (refonte complète, conçue par un expert UX).
- **Distribution web et stores**, développement sous Windows.

## 2. Trois propositions

### A — Web d'abord : TypeScript partout, PWA + Capacitor

| Couche | Proposition |
|---|---|
| App publique | Application web TypeScript (PWA installable, service worker), emballée par **Capacitor** pour Android et iOS |
| Framework UI | React (écosystème, recrutement, repli possible vers React Native) ; alternative plus légère à mesurer : Preact ou Svelte |
| Stockage local | Interface « dépôt » ; IndexedDB sur web, SQLite natif via Capacitor sur mobile (le stockage web seul peut être purgé par le navigateur) |
| Back-office | Application web TypeScript, **même framework et mêmes composants/jetons de design** que l'app |
| API | Node.js + TypeScript (Fastify ou Hono), schémas **Zod** partagés, contrat OpenAPI généré |
| Données | PostgreSQL ; migrations versionnées |
| Dépôt | Monorepo (pnpm workspaces) : `domain`, `contracts`, `design-tokens`, `app`, `backoffice`, `api` |
| Tests | Vitest (unitaires, propriétés avec fast-check), Playwright (e2e web), tests de contrat, quelques e2e natifs |

**Points forts**
- Le moteur, les schémas, les types et les composants sont **réellement partagés** entre app, back-office et API.
- Le **web est une première classe** : un lien WhatsApp suffit pour essayer l'app, sans installation (distribution « les deux » retenue).
- Liberté de design maximale (HTML/CSS), accessibilité web native.
- Un seul langage, un seul outillage de test.

**Risques**
- Performance d'une WebView sur Android d'entrée de gamme (démarrage, fluidité de saisie).
- Règle Apple 4.2 (fonctionnalité minimale) : apporter une vraie valeur native (hors ligne, partage, stockage natif).
- Build iOS depuis Windows : exige un runner macOS en CI (build cloud).

### B — Natif partagé : React Native (Expo) + web

| Couche | Proposition |
|---|---|
| App publique | **Expo / React Native**, TypeScript, avec **React Native Web** pour la version web |
| Back-office | Web séparé (React), UI non partagée avec l'app mobile |
| API, données, tests | Comme A |

**Points forts** : rendu natif, bonne fluidité sur mobile, build iOS cloud intégré (EAS).
**Risques** : le web est secondaire (poids, comportements différents) ; la liberté de design est plus étroite ; deux systèmes d'UI (app et back-office) à maintenir.

### C — UI unique « pixel-perfect » : Flutter

| Couche | Proposition |
|---|---|
| App publique | **Flutter** (Dart) pour mobile et web |
| Back-office | Flutter web ou web séparé |
| API | TypeScript ou Dart |

**Points forts** : rendu identique partout, UI très maîtrisée.
**Risques** : le moteur de calcul ne se partage pas avec une API TypeScript (duplication, contraire à ADR-0003) sauf API en Dart ; web lourd au premier chargement ; accessibilité web moins naturelle.

## 3. Comparaison (notes 1 à 5, pondérées avec la grille de [06](06-criteres-stack.md))

| Critère | Poids | A — PWA + Capacitor | B — Expo / RN | C — Flutter |
|---|---|---|---|---|
| Code réellement partagé (UI, domaine, contrats) | 5 | 5 | 4 | 3 |
| Poids et performance sur appareil modeste | 5 | 3 | 4 | 4 |
| Hors ligne et stockage local | 4 | 4 | 4 | 4 |
| Testabilité | 4 | 5 | 4 | 4 |
| Liberté de design | 4 | 5 | 3 | 5 |
| Accessibilité | 4 | 5 | 4 | 3 |
| iOS depuis Windows | 3 | 3 | 4 | 3 |
| Courbe d'apprentissage et écosystème | 3 | 5 | 4 | 2 |
| Pérennité | 3 | 4 | 4 | 4 |
| Coût | 2 | 5 | 4 | 5 |
| **Total (sur 185)** | | **162** | **144** | **136** |

La seule cellule où A est en retrait est la **performance sur appareil modeste** : c'est exactement ce que le POC doit trancher.

## 4. Recommandation

**Proposition A**, sous réserve de réussite du POC.

Pourquoi :
1. C'est la seule qui rend le **partage du domaine et des contrats** naturel et complet entre les trois produits (ADR-0003, ADR-0004), avec un seul langage.
2. Elle donne au **web** son rôle de porte d'entrée sans friction, adaptée à une audience qui partage des liens sur WhatsApp et surveille sa data.
3. Elle maximise la **liberté de design**, point central de la refonte.
4. Si le POC échoue sur la performance, le **repli vers B** est peu coûteux : le domaine, les contrats, l'API et le back-office restent identiques, seule la couche UI mobile change.

Ce que je ne recommande pas : C, car elle casse le partage du moteur sans compensation décisive.

## 5. Choix secondaires à trancher en ADR

| Sujet | Options | Ma pente |
|---|---|---|
| Framework UI | React, Preact, Svelte | **React + Vite en SPA/PWA** (pas de rendu serveur : l'app est hors ligne et statique, ce que Capacitor attend). Preact via alias de compatibilité si le poids dépasse la cible (POC P2). Écartés : Next.js/Nuxt/SvelteKit (rendu serveur inutile), Ionic (look imposé), Angular (lourdeur). |
| Routage / état / styles | React Router ou TanStack Router ; état local + petit store ; CSS à variables sans kit d'interface | Design sur mesure, jetons de design partagés avec le back-office |
| API + back-office | **AdonisJS** (préférence du développeur), Fastify, Hono, NestJS | **AdonisJS** : framework TypeScript complet (authentification, autorisations Bouncer, validation VineJS, ORM Lucid, limitation de débit), back-office en React via Inertia, un seul déploiement. À prouver au POC : contrat partagé avec l'app (VineJS n'est pas Zod → OpenAPI généré ou schémas Zod dans le paquet partagé, P6) et second facteur via bibliothèque TOTP éprouvée (P7). Repli : Fastify/Hono. |
| App publique : Next.js ou Nuxt ? | React+Vite, Next.js, Nuxt | **React+Vite** : pas de rendu serveur utile pour une app hors ligne ; Nuxt (Vue) casse le partage d'UI avec le back-office et le repli vers React Native. Next.js seulement pour un **site public indexé** distinct de l'app (landing, articles), à décider selon Q-25. |
| Backend sur mesure ou service géré (par exemple une base avec authentification intégrée) | Sur mesure / géré | Sur mesure : le contrat versionné, le cycle de relecture et l'audit sont des règles métier, mais un service géré peut accélérer l'authentification avec second facteur ; à évaluer |
| Authentification du back-office | Maison, bibliothèque, service tiers | Bibliothèque ou service éprouvé, **jamais maison** (ADR-0007) |
| ORM / accès base | Drizzle, Prisma, requêtes typées | Drizzle ou équivalent léger, migrations explicites |
| Emballage natif | Capacitor, autres | Capacitor |
| Arithmétique exacte | Entiers + fractions, bibliothèque décimale | À trancher via POC (ADR-0002) |

## 6. Plan de POC (critères de réussite)

Le POC se fait **avant** de figer la stack, sur un appareil de référence. Je propose de choisir ensemble un **Android d'entrée de gamme réel** comme appareil de référence (question à te poser : lequel as-tu sous la main ?).

| # | POC | Critère de réussite |
|---|---|---|
| P1 | Moteur de calcul TypeScript avec les vecteurs de [03](03-regles-metier.md) | 100 % des vecteurs identiques sur Node, navigateur, Android, iOS |
| P2 | Écran de saisie + résultat en PWA sur l'appareil de référence | Démarrage à froid < 3 s en 3G ; saisie fluide (aucune latence perçue) ; premier chargement < 500 Ko compressé |
| P3 | Même écran emballé avec Capacitor | Pas de dégradation notable de P2 ; stockage natif qui survit au vidage du cache |
| P4 | Mode hors ligne | Parcours complet sans réseau, relance après coupure |
| P5 | Chaîne iOS depuis Windows | Un build installable sur un iPhone de test via runner macOS |
| P6 | Contrat d'API : un schéma Zod → OpenAPI → client typé + test de contrat | Rupture de contrat détectée en CI |
| P7 | Back-office : connexion avec second facteur + rôle rédacteur ≠ relecteur | Le test de séparation des rôles échoue si la règle est contournée |
| P8 | Partage natif (feuille de partage) | Fonctionne sur Android et iOS |

**Phasage (2026-11-18)** : on joue d'abord **P1 à P5 et P8** (l'app seule, lot 1). **P6 et P7** (contrat d'API, back-office) sont reportés au démarrage du lot 2.

**Règle de décision** : A est retenue si P1 à P4 passent. Si P2/P3 échouent mais que P1 passe, bascule vers B pour la couche UI mobile, le reste du système restant inchangé.

## 7. Ce qu'on fait ensuite

1. Tu valides ou ajustes la recommandation.
2. Je prépare le **plan de POC** détaillé (specs de chaque P, sans écrire le code applicatif).
3. Tu me donnes l'appareil de référence et on exécute les POC en TDD.
4. On écrit ADR-0008 avec les mesures obtenues.
