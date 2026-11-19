# ADR-0015 — Visite guidée : driver.js (version épinglée)

- Statut : Proposée (appliquée à la demande du propriétaire pour avoir « une vraie visite guidée » ; à confirmer)
- Date : 2026-11-19
- Décideurs : le propriétaire (visite guidée réelle), à valider

## Contexte
L'exemple guidé de [docs/14](../14-onboarding.md) doit **mettre en évidence les vrais éléments** de l'écran (le prix, le demi-cercle, la marge, « Enregistrer ») avec une bulle ancrée, un fond atténué autour de l'élément, une progression et un défilement automatique. La première version n'avait que des bulles de texte dans une carte, sans rien montrer du doigt. Écrire à la main le halo, le calcul de position de la bulle (qui doit éviter les bords), le défilement, le clavier et le recalcul au redimensionnement est long et fragile : règle de travail, on utilise une dépendance éprouvée plutôt que de réécrire ([L-33](../17-lecons-apprises.md)).

Contraintes : poids total < 500 Ko compressés (NFR-04), hors ligne (la bibliothèque est empaquetée, aucun appel réseau), `prefers-reduced-motion` respecté (MOV-01), clavier et lecteurs d'écran, thèmes clair et sombre, **sécurité de la chaîne d'approvisionnement** (l'app manipule des données financières locales).

## Options considérées
1. **driver.js** — MIT, sans dépendance, ≈ 5 Ko compressés (82 Ko décompressés pour la 1.3.6), halo découpé dans un fond atténué, bulle auto-positionnée, étapes sans élément (bulle centrée), clavier (flèches, Échap), `aria-labelledby`/`aria-describedby` sur la bulle, crochets pour piloter la fin.
2. **react-joyride** — idiomatique en React mais plus lourd (≈ 30 Ko et plusieurs dépendances de positionnement), mise à jour irrégulière.
3. **shepherd.js** — complet, s'appuie sur floating-ui, plus gros ; licence MIT.
4. **intro.js** — licence AGPL pour un usage commercial : écartée.
5. **Fait maison** (halo GSAP + bulle Radix) — aucune dépendance, mais tout le travail de positionnement, de défilement et d'accessibilité à écrire et à tester : écartée par L-33.

## Décision
**driver.js, version `1.3.6` épinglée exactement** (`"driver.js": "1.3.6"`, sans `^`), isolée derrière un seul module, `src/clients/app/src/lib/tour.ts` : aucun autre fichier n'importe la bibliothèque, ce qui permet de la remplacer sans toucher aux écrans.

Pourquoi **1.3.6** et pas la dernière (1.14.0) : le paquet a publié **onze versions entre octobre et novembre 2026** (rythme inhabituel après des années d'accalmie) et le dépôt déclaré a changé d'organisation entre la 1.3.6 et la 1.14. L'auteur reste le même et la licence MIT, mais une dépendance qui pèse dans une application financière ne se met pas à jour sur un coup de tête : la 1.3.6 (mai 2025) est stable depuis 18 mois, sans dépendance. On ne monte de version qu'après relecture du journal des changements.

Règles d'usage :
- Mouvement : `animate` et `smoothScroll` sont **faux** quand `motionAllowed()` est faux (MOV-01).
- Habillage : la bulle prend les jetons du design (surface, encre, terracotta, pastilles) par du CSS dans `styles.css` ; aucune couleur en dur.
- Pas d'effet de bord sur les données : la visite ne lit ni n'écrit rien (l'exemple vit dans un stockage en mémoire, ONB-04).

## Conséquences
- (+) Vraie visite : halo, bulle ancrée, progression « 2 sur 6 », défilement, clavier.
- (+) Aucune dépendance transitive.
- (−) Une dépendance de plus : poids à mesurer (≈ 5 Ko compressés attendus) contre la cible de 500 Ko.
- (−) La bibliothèque anime son halo avec son propre code (pas GSAP) ; elle est donc coupée sous `prefers-reduced-motion` et son mouvement n'est pas dans `motion.ts`. Écart assumé à [ADR-0011](0011-bibliotheque-animation-gsap.md), limité à cette bibliothèque.
- (−) Son DOM (bulle, fond) n'est pas du React : testé par ses classes (`driver-popover`, `driver-active-element`).
- Risque : chaîne d'approvisionnement ; atténué par l'épinglage exact, la version ancienne et le module d'isolation.

## Vérification
Tests : la visite met en évidence, dans l'ordre, les vrais éléments ; se ferme à Échap ; finit sur « Faire le mien » ; n'écrit rien dans le stockage réel ; sans mouvement, `animate` est faux. Poids mesuré avant/après (`pnpm build`). Rendu réel vérifié par le propriétaire (L-31).

## Mise en œuvre et mesures (2026-11-19)
- `driver.js` 1.3.6, exact, importé uniquement par `lib/tour.ts` ; habillage dans `styles.css` (classe `pm-tour`).
- Poids après ajout (`pnpm build`) : JS **244,9 Ko compressés** (un seul bloc, 771 Ko non compressés), CSS **11,3 Ko**, soit environ 257 Ko pour une cible de 500 Ko. La part de driver.js seule n'a pas été isolée (≈ 5 Ko attendus).
- Piège de test : jsdom n'a pas `scrollIntoView` ; un stub est dans `tests/setup.ts`. Pour une étape sans élément, driver.js pose un `div#driver-dummy-element` au centre : c'est lui qui porte la classe `driver-active-element`.

