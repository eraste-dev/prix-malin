# ADR-0011 — Bibliothèque d'animation : GSAP

- Statut : Proposée
- Date : 2026-11-18
- Décideurs : le propriétaire (choix de GSAP, migration de toutes les animations)

## Contexte
L'app anime l'entrée des éléments en cascade, le stepper (rond qui apparaît, trait qui se remplit), le demi-cercle de composition (arcs dessinés puis glissants), l'ouverture d'un bloc repliable et la bascule du thème. Une première version l'avait écrit **à la main** (utilitaires `Reveal` et `lib/motion.ts`, `@keyframes`, classes `tw-animate-css`) : du code à maintenir et à tester pour ce qu'une bibliothèque fait déjà. Règle de travail : on utilise des dépendances éprouvées pour gagner du temps et on ne réécrit pas ce qui existe ([L-33](../17-lecons-apprises.md)).

Contraintes : poids total < 500 Ko compressés (NFR-04), `prefers-reduced-motion` respecté (MOV-01), animation jamais bloquante pour la saisie (MOV-03), ≥ 30 i/s à CPU ×4 (MOV-04), thèmes clair et sombre.

## Options considérées
1. **GSAP** (`gsap` + `@gsap/react`) — timelines, cascades (`stagger`), tracés SVG, ordonnancement fin ; hook `useGSAP` qui nettoie tout seul au démontage ; licence « no charge » gratuite, plugins compris.
2. **motion** (ex-Framer Motion) — déclaratif, très idiomatique en React, plus léger (≈ 5 à 15 Ko) ; moins à l'aise pour les timelines et le défilement.
3. CSS seul (état précédent) — écarté : réécrit ce que les bibliothèques font, difficile à orchestrer.

## Décision
**GSAP**, via `gsap` et `@gsap/react` (`useGSAP`), pour **toutes** les animations de l'app (choix du propriétaire). Les composants Radix/shadcn qui animent leurs propres ouvertures (boîte de dialogue, info-bulle) gardent les classes `tw-animate-css` qui accompagnent ces composants : on ne réécrit pas du code copié de shadcn.

Règles d'usage :
- Un seul point d'entrée, `src/clients/app/src/lib/motion.ts` (préférence de mouvement `motionAllowed()`, durées, décalages, temps forts) ; aucun délai ou durée écrit dans un composant.
- **`prefers-reduced-motion`** : sans animation autorisée, rien n'est posé (l'élément reste visible, aucun style en ligne d'animation).
- Les animations se règlent dans `useGSAP` avec `scope`, donc sont annulées au démontage.
- L'état final est toujours porté par le DOM (attributs et classes) : l'animation ne fait que l'atteindre, donc les tests et les lecteurs d'écran voient la bonne valeur.

## Conséquences
- (+) Moins de code maison (suppression de `Reveal` par classes, des `@keyframes`, des classes de mouvement), cascades et tracés SVG natifs.
- (+) Nettoyage automatique au démontage (`useGSAP`), pas de fuite.
- (−) Dépendance de plus : poids JS à mesurer (≈ 25 à 30 Ko compressés pour le cœur de GSAP) ; à contrôler contre la cible de 500 Ko.
- (−) API impérative (références DOM) : moins idiomatique en React que `motion`. Compensé par `useGSAP` et par un seul module d'accès.
- (−) Les tests d'animation vérifient les **appels et les paramètres** (délais, durées) plutôt que le rendu image par image ; jsdom n'a pas de moteur d'animation visuel.

## Mise en œuvre et mesures (2026-11-18)
- Migration complète : `Reveal`, rond et trait du stepper, arcs du demi-cercle, icône du thème, détail repliable.
- Poids après migration : JS **153,7 Ko compressés** au total (CSS 7,7 Ko), pour une cible de 500 Ko. La part de GSAP seule n'a pas été isolée (estimation ≈ 25 à 30 Ko).
- Piège de test : sans mise en page, jsdom donne `offsetParent = null` et GSAP retire alors brièvement l'élément du DOM pour le mesurer, ce qui fait perdre son focus à un champ en cours de saisie. Corrigé dans `tests/setup.ts` (un vrai navigateur n'a pas ce comportement) ; voir [L-34](../17-lecons-apprises.md).

## Vérification
Mesure du poids avant/après ; tests : cascade dans l'ordre, rien posé sous `prefers-reduced-motion`, nettoyage au démontage ; rendu réel vérifié par le propriétaire (L-31).
