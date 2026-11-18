# ADR-0004 — Contrat d'API versionné, défini avant l'implémentation

- Statut : Proposée
- Date : 2026-11-18

## Contexte
Les apps installées sur des téléphones ne se mettent pas toutes à jour. Une même API sert l'app publique et le back-office. Le SDD demande de spécifier avant de coder.

## Options considérées
1. API construite au fil du code — rapide, fragile, ruptures de compatibilité.
2. Contrat décrit dans un format machine (par exemple OpenAPI / JSON Schema), versionné, avec tests de conformité côté client et serveur.

## Décision
Option 2. Le contrat est la source de vérité. Les schémas de données sont partagés ; l'app valide **toute réponse** reçue. Une version de contrat est supportée tant qu'une version d'app active l'utilise (SYS-02).

## Conséquences
- (+) App et back-office développables en parallèle sur le contrat.
- (+) Tests de contrat automatisés.
- (−) Coût initial de description ; politique de dépréciation à écrire.

## Vérification
Tests de contrat en CI ; test de compatibilité avec la version d'app N−2.
