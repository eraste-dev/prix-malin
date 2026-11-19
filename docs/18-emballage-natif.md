# 18 — Emballage natif (Android, iOS) et hors ligne

Complète le [plan des POC](12-plan-poc.md) : **P3** (Capacitor), **P4** (hors ligne), **P5** (iOS depuis Windows), **P8** (partage natif). Ce document dit ce qui est **prêt dans le code** et ce qu'il reste à **faire sur un appareil**, ce qu'on ne peut pas faire sans téléphone, compte ou Mac.

## Déjà fait dans le dépôt

| Sujet | État |
|---|---|
| PWA installable | `vite-plugin-pwa` : manifeste (nom, icônes 64/192/512 et maskable, couleurs), service worker généré, **21 fichiers mis en cache** (code, styles, polices, icônes). Voir [ADR-0013](adr/0013-hors-ligne-pwa.md). |
| Hors ligne | Tout est embarqué : aucune requête réseau pour calculer, enregistrer, lire « Comprendre ». Après un premier chargement, l'app s'ouvre en mode avion. |
| Mises à jour | Proposées (« Nouvelle version disponible · Mettre à jour »), jamais imposées, jamais pendant une saisie. |
| Écran de lancement | Logo seul, intégré à `index.html` : jamais d'écran blanc. |
| Icônes | Générées depuis `public/icon.svg` : `pnpm icons` (depuis `src/clients/app`). |
| Capacitor | `capacitor.config.ts` (identifiant `ci.prixmalin.app`, dossier `dist`), dépendances `@capacitor/core` et `@capacitor/cli`, scripts `cap:sync` et `cap:android`. |
| Partage | Web Share API quand elle existe, sinon copie dans le presse-papiers (E08). |

## À faire sur un appareil

### P4 — vérifier le hors ligne (10 minutes)

1. `just build` puis servir `dist` (`pnpm --dir src --filter @prix-malin/app preview`) et ouvrir l'adresse sur le téléphone ou dans Chrome.
2. Attendre le message « L'application fonctionne maintenant sans internet. »
3. Activer le mode avion, fermer l'onglet, rouvrir l'adresse : l'app doit s'ouvrir, calculer, enregistrer et relancer **sans erreur**.
4. Changer la version dans `package.json`, reconstruire : au retour du réseau, « Nouvelle version disponible » apparaît ; les prix enregistrés sont conservés après la mise à jour.

Un scénario Playwright automatisé (hors ligne simulé) reste à écrire : il n'a pas été ajouté ici parce qu'il demande de lancer un navigateur, ce que le propriétaire a demandé de ne pas faire sans accord ([L-31](17-lecons-apprises.md)).

### P3 — Android (Capacitor)

Prérequis : Android Studio (SDK et un émulateur ou le Redmi en mode développeur).

```bash
cd src/clients/app
pnpm cap add android      # une seule fois : crée le dossier android/
pnpm cap:sync             # construit l'app et la copie dans le projet Android
pnpm cap:android          # ouvre Android Studio, puis « Run » sur l'appareil
```

À mesurer (docs/12) : démarrage et fluidité à moins de 20 % d'écart avec la PWA ; **les prix enregistrés doivent survivre** au vidage du cache et à la fermeture forcée. Si le stockage web (`localStorage`) est purgé, écrire un `StorageAdapter` natif (`@capacitor/preferences`) : l'interface existe déjà ([ADR-0012](adr/0012-etat-et-stockage-local.md)), seul `browserStorage()` change.

### P8 — partage natif

Dans la WebView Android, `navigator.share` n'est pas toujours disponible : si l'essai sur le Redmi montre un bouton « Partager » absent, ajouter `@capacitor/share` et l'appeler dans `ShareSheet` quand `Capacitor.isNativePlatform()`. Le repli par copie fonctionne déjà.

### P5 — iOS depuis Windows

Impossible sans Mac ni compte Apple Developer (99 $/an). Deux voies : un service de build macOS en CI (GitHub Actions `macos-latest`) avec un iPhone de test, ou un Mac loué. À trancher avec la porteuse du projet (Q-26). La PWA reste installable sur iPhone par « Ajouter à l'écran d'accueil » en attendant.

## Confidentialité

Aucun appel réseau pendant l'usage ; aucune permission demandée (ni position, ni notifications, ni contacts, ni stockage externe). Le fichier de sauvegarde et le résumé partagé sont créés **à la demande** de l'utilisateur et ne partent nulle part sans son geste.
