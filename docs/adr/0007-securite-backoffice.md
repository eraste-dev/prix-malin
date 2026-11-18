# ADR-0007 — Sécurité du back-office

- Statut : Proposée
- Date : 2026-11-18

## Contexte
Le back-office peut modifier ce que voient tous les utilisateurs de l'app (contenu, paramètres, plus tard offres et comptes). Une compromission aurait un effet démultiplié.

## Options considérées
1. Authentification simple, un seul rôle — rapide, risque élevé.
2. Authentification forte, rôles distincts, contrôle d'accès côté serveur, audit, séparation de l'auteur et du relecteur.
3. Service d'identité externe pour tout le back-office — plus robuste, dépendance et coût.

## Décision
Option 2, avec option 3 à évaluer lors du choix de stack. Exigences minimales : second facteur obligatoire (BO-NFR-01), autorisation côté serveur (BO-NFR-02), journal d'audit (BO-11, SYS-05), séparation des rôles testée (BO-NFR-07), contenu assaini (BO-NFR-03), limitation de débit.

## Conséquences
- (+) Réduit le risque de publication malveillante ou accidentelle.
- (−) Plus de développement initial, même pour B0.
- Contenu signé ou vérifié côté app (SYS-07) : à spécifier avec le contrat d'API.

## Vérification
Revue de sécurité avant la première mise en production ; tests automatisés des droits.
