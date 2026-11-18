# ADR-0008 — Choix de la stack (app, API, back-office)

- Statut : **Acceptée sous réserve de POC** (2026-11-18). Passera à « Acceptée » quand les POC P1 à P5 auront des mesures consignées ici ; P6 et P7 concernent l'API et le back-office et seront joués à leur démarrage.
- Date : 2026-11-18

## Contexte
Voir [11 — Propositions de stack](../11-propositions-stack.md) : trois produits (app web/Android/iOS, back-office, API), équipe réduite, moteur et contrats à partager (ADR-0003, ADR-0004), hors ligne d'abord (ADR-0001), design entièrement sur mesure.

## Options considérées
- **A** — TypeScript partout : PWA + Capacitor, API Node, PostgreSQL, monorepo.
- **B** — React Native (Expo) + React Native Web, back-office web séparé.
- **C** — Flutter (Dart).

## Orientation du développeur (2026-11-18)
Back-office et API sur **AdonisJS** (TypeScript), app publique en **React** (Vite ; Next.js ou Nuxt écartés pour l'app elle-même, voir [11 §5](../11-propositions-stack.md)), le tout dans l'écosystème TypeScript. Points à prouver : contrat partagé (P6), second facteur (P7).

## Ordre de construction (2026-11-18)
On commence par **l'app publique seule**, pour valider le design et l'expérience utilisateur avant d'investir dans le back-office. Le contenu y est d'abord **embarqué**, mais déjà sous forme de données versionnées avec schéma (ADR-0005), pour que B0 vienne ensuite le remplacer sans réécriture. API et back-office AdonisJS suivent.

## Décision (provisoire)
Retenir **A**, validée si les POC P1 à P4 passent (voir [11 §6](../11-propositions-stack.md)). En cas d'échec de P2/P3 avec P1 réussi, basculer la couche UI mobile vers **B** en conservant domaine, contrats, API et back-office.

## Conséquences attendues
- (+) Un langage, un moteur, des schémas partagés ; web comme porte d'entrée ; design libre.
- (−) Performance WebView à prouver ; règle Apple 4.2 à surveiller ; runner macOS en CI pour iOS.

## Vérification
Mesures des POC consignées ici avant de passer le statut à « Acceptée ».
