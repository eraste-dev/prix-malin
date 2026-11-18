# ADR-0012 — État de l'app et stockage local : zustand, zod, stockage derrière une interface

- Statut : Proposée
- Date : 2026-11-18

## Contexte
L'app fonctionne **entièrement hors ligne** et garde les prix et les coûts sur l'appareil ([ADR-0001](0001-app-hors-ligne-serveur-optionnel.md)). Il faut enregistrer le brouillon en continu (« rien n'est perdu », docs/13), les prix enregistrés et les réglages, **valider tout ce qui est relu** (NFR-09), versionner les données pour migrer plus tard ([ADR-0005](0005-contenu-donnee-versionnee.md)), et pouvoir changer de support de stockage sous Capacitor sans toucher au reste du code. Règle de travail : dépendances éprouvées plutôt que code maison ([L-33](../17-lecons-apprises.md)).

## Options considérées
1. **zustand + zod, stockage derrière une interface** — stores légers avec le middleware `persist` (version, migration, fusion), schémas zod pour valider chaque lecture.
2. Redux Toolkit + redux-persist — plus lourd, plus de cérémonie pour trois petits stores.
3. `localStorage` écrit à la main — écarté : réécrit ce que `persist` fait déjà.
4. IndexedDB (Dexie, idb-keyval) — asynchrone et plus puissant, inutile pour quelques dizaines de prix ; l'interface permettra d'y venir.

## Décision
- **zustand** (stores vanilla + `persist`) pour trois stores : **brouillon** (le calcul en cours), **prix enregistrés**, **réglages**. Les stores sont créés au démarrage par `createAppStores(stockage)` et fournis par un contexte React : pas de singleton global, donc des tests isolés.
- **zod** pour tous les schémas ([`model.ts`](../../src/clients/app/src/lib/model.ts), [`stores.ts`](../../src/clients/app/src/lib/stores.ts)). Chaque lecture est validée ; un contenu illisible ne fait jamais planter l'app : brouillon écarté et signalé, prix illisibles écartés un par un et comptés, réglages abîmés traités comme un premier lancement (E14, docs/14).
- **`StorageAdapter`** (`getItem`, `setItem`, `removeItem`) : `browserStorage()` (localStorage, sans jamais lever d'erreur), `memoryStorage()` (tests, repli). Sous Capacitor, un adaptateur natif le remplacera.
- **Schéma versionné** : `schema: 1` dans chaque calcul, `version: 1` dans l'enveloppe `persist`, `migrate` prêt pour la suite.
- On ne stocke que les **données** (`partialize`), jamais les actions ni l'état d'intégrité.
- Les montants sont des **entiers de F CFA** ([ADR-0002](0002-montants-en-francs-entiers.md)) ; la quantité d'une ligne de coût peut être décimale (0,5 kg).

## Conséquences
- (+) Brouillon automatique, prix enregistrés et réglages avec très peu de code ; lecture validée et tolérante aux pannes.
- (+) Changement de support de stockage sans réécriture (interface).
- (+) Tests simples : un stockage en mémoire par test.
- (−) Deux dépendances de plus (zustand ≈ 1 Ko, zod ≈ 13 Ko compressés) à contrôler contre la cible de 500 Ko.
- (−) `localStorage` est synchrone et limité (≈ 5 Mo) : suffisant ici, à revoir si l'on stocke beaucoup plus.
- (−) Une migration future devra écrire les fonctions `migrate` de chaque store.

## Vérification
Tests : round-trip du stockage, JSON illisible, contenu hors schéma, écriture refusée, élément abîmé dans une liste ; contrôle du poids au build.
