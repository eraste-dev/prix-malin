# ADR-0005 — Contenu pédagogique géré comme donnée versionnée

- Statut : Acceptée
- Date : 2026-11-18

## Contexte
Le contenu (textes, exemples, suggestions) est la valeur du produit et doit être validé par la comptable. Dans le prototype il est écrit en dur dans le code, donc modifiable seulement en republiant l'app.

## Options considérées
1. Contenu dans le code — simple, mais chaque correction exige une publication sur les stores.
2. Contenu en donnée versionnée, édité dans le back-office, distribué par l'API, avec version embarquée de repli.

## Décision
Option 2. Le contenu est structuré (schéma versionné), avec cycle brouillon → relu → publié → archivé (BO-06/07). Il est **assaini** : aucun HTML ni script exécutable, mise en forme limitée à un sous-ensemble défini (titres, listes, gras).

## Conséquences
- (+) Corrections de fond sans republier ; relecture comptable tracée.
- (+) Prêt pour d'autres langues et pays.
- (−) Schéma à maintenir ; l'app doit gérer les versions inconnues (ignorer, garder la dernière valide).
- Risque : contenu publié par erreur → relecture obligatoire par un autre rôle.

## Vérification
Critères BO-07 et BO-10 de [10](../10-cahier-des-charges-backoffice.md).
