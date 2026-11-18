# ADR-0002 — Montants en francs entiers, sans flottants

- Statut : Proposée
- Date : 2026-11-18

## Contexte
Le F CFA n'a pas de subdivision d'usage. Les calculs enchaînent divisions et pourcentages, et le prototype utilise des flottants JavaScript. Le même moteur doit donner **exactement** les mêmes résultats sur web, Android et iOS.

## Options considérées
1. Flottants — simple, mais dérive d'arrondi possible, résultats différents selon la plateforme.
2. Entiers en F + fractions exactes (rationnels) pour les résultats intermédiaires — exact, un peu plus de code.
3. Bibliothèque décimale (big decimal) — exact, dépendance de plus.

## Décision
Montants stockés en **entiers de F CFA**. Les quantités fractionnaires sont admises (0,5 kg). Les divisions intermédiaires utilisent une représentation exacte (fraction ou entier en millièmes) et l'arrondi n'intervient qu'aux **points définis** : prix final (RG-03) et affichage. À valider par un POC avec les vecteurs de [03](../03-regles-metier.md).

## Conséquences
- (+) Résultats reproductibles partout, tests déterministes.
- (−) Arrondis à spécifier un par un ; règle de tie-breaker à fixer.

## Vérification
Vecteurs de [03](../03-regles-metier.md) identiques sur toutes les plateformes ; tests de propriété.
