# ADR-0010 — Bibliothèque UI : shadcn/ui (Tailwind + Radix)

- Statut : Proposée
- Date : 2026-11-18

## Contexte
L'app (ADR-0008) et le futur back-office partagent les mêmes composants et jetons de design ([11](../11-propositions-stack.md)). Écrire chaque composant à la main (champ, segments, cartes, onglets, boutons) coûte cher et risque l'accessibilité. Contraintes : poids total < 500 Ko (NFR-04), WCAG AA, cibles ≥ 44 px, thèmes clair/sombre (EXG-51), un design propre au produit tiré de [ui-ux](../ui-ux/README.md).

## Options considérées
1. **shadcn/ui** (Tailwind v4 + Radix) — composants accessibles copiés dans le dépôt, modifiables, sans style imposé, poids minimal.
2. React Aria Components — excellente accessibilité, plus de style à écrire.
3. Mantine / MUI — complet, mais look imposé, plus lourd.
4. Tout à la main — écarté (coût, accessibilité).

## Décision
shadcn/ui. Les composants vivent dans `src/clients/app/src/components/ui/` (propriété du dépôt, pas une dépendance opaque). Jetons de couleur en variables CSS (`src/styles.css`) : la palette finale du travail UX se règle en changeant ces variables. Thème : système par défaut, forçable via `<html data-theme>`.

## Conséquences
- (+) Composants accessibles prêts, thèmes et jetons natifs, code modifiable.
- (+) Réutilisable par le back-office (extraction en paquet partagé le moment venu).
- (−) Dépendances de plus (Tailwind, Radix, lucide) : JS initial passé de 72 à 91 Ko compressés (cible 500 Ko).
- (−) Les composants copiés ne se mettent pas à jour seuls ; les mises à jour se font à la main.
- (−) La variante Tailwind `dark:` ne suit que le thème sombre **forcé** ; le mode système passe par les jetons.

## Vérification
Mesures P2 (démarrage, Lighthouse) refaites avec la bibliothèque ; contraste AA des paires de jetons contrôlé quand la palette est fixée.
