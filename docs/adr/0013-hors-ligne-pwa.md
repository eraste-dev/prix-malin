# ADR-0013 — Hors ligne : PWA avec vite-plugin-pwa

- Statut : Proposée
- Date : 2026-11-19

## Contexte
L'app doit marcher **sans réseau** dès le premier lancement passé ([ADR-0001](0001-app-hors-ligne-serveur-optionnel.md)), s'installer sur l'écran d'accueil, et se mettre à jour sans casser les données ni interrompre une saisie. Règle de travail : dépendance éprouvée plutôt que code maison ([L-33](../17-lecons-apprises.md)) ; écrire un service worker à la main est un classique source de bugs (cache périmé, boucles de mise à jour).

## Options considérées
1. **vite-plugin-pwa** (Workbox) — génère le manifeste et le service worker, précache les fichiers du build, expose un hook React de mise à jour.
2. Workbox à la main — plus de contrôle, beaucoup plus de code à maintenir.
3. Service worker écrit à la main — écarté.
4. Ne rien faire (hors ligne seulement via Capacitor) — écarté : la PWA est une cible ([12](../12-plan-poc.md), P4).

## Décision
**vite-plugin-pwa**, mode `generateSW`, `registerType: "prompt"` :
- **Précache** de tout le build (code, styles, polices, icônes) : l'app n'a aucune requête réseau à faire pour fonctionner.
- **Mise à jour proposée, jamais imposée** : un message « Nouvelle version disponible » avec « Mettre à jour », **jamais pendant une saisie** (retiré dès qu'un champ prend le focus, réaffiché à sa sortie).
- Les données (prix, brouillon) vivent dans `localStorage`, pas dans le cache du service worker : une mise à jour ne les touche pas.
- Navigation par hash ([ADR-0014](0014-routage-par-hash.md)) : toute adresse retombe sur `index.html`, donc le hors ligne n'a pas de page introuvable.
- Sous test, le module virtuel du plugin est remplacé par un double contrôlable ; le plugin n'est pas chargé.

## Conséquences
- (+) Installable, hors ligne, mises à jour contrôlées, très peu de code.
- (+) Les icônes se régénèrent d'une commande (`pnpm icons`).
- (−) Dépendances de dev ajoutées (`vite-plugin-pwa`, `@vite-pwa/assets-generator`) et `workbox-window` (≈ 2 Ko compressés) au bundle.
- (−) Le service worker n'est actif qu'en build (`pnpm build` puis aperçu), pas en développement.
- (−) Le scénario hors ligne se vérifie sur navigateur réel ; un test automatisé (Playwright) reste à écrire ([docs/18](../18-emballage-natif.md)).

## Vérification
Build : `sw.js`, `manifest.webmanifest` et 21 entrées en précache (≈ 813 Ko non compressés). Tests : message de mise à jour, absence pendant la saisie, message « prêt hors ligne ». Reste : P4 sur appareil.
