# ADR-0006 — Minimisation des données et consentement

- Statut : Acceptée
- Date : 2026-11-18

## Contexte
Les coûts, marges et volumes d'un commerce sont sensibles. Les statistiques d'usage et les comptes (B2, B3) vont exiger de collecter des données ; les stores et la loi (protection des données en Côte d'Ivoire, et RGPD si des Européens utilisent l'app) imposent des règles.

## Options considérées
1. Collecter largement, filtrer plus tard — risque juridique et de confiance.
2. Collecter le strict nécessaire, par catalogue fermé d'événements, avec consentement explicite et révocable.

## Décision
Option 2.
- **Aucune valeur saisie** par l'utilisateur (montants, noms, volumes) n'est jamais envoyée dans les statistiques.
- Événements limités à un **catalogue fermé**, documenté.
- Consentement séparé et révocable pour les statistiques et pour les rapports d'erreur ; aucun envoi avant.
- Durées de conservation définies, suppression automatique.
- Compte (B3) : données minimales, droit à l'effacement.

## Conséquences
- (+) Confiance, conformité, publication facilitée sur les stores.
- (−) Statistiques moins riches ; pas de profilage.
- Politique de confidentialité à rédiger **avant** toute collecte (Q-20).

## Vérification
Test automatisé : aucun événement ne contient de champ saisi (BO-30) ; aucun envoi sans consentement.
