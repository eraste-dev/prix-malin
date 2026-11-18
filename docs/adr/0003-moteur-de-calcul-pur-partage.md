# ADR-0003 — Moteur de calcul pur et partagé

- Statut : Acceptée
- Date : 2026-11-18

## Contexte
Le prototype mélange calcul, rendu et état. Le calcul est le cœur de la valeur et doit être identique sur toutes les plateformes, testé à fond (TDD), et potentiellement réutilisé côté serveur.

## Options considérées
1. Logique dans les composants UI — rapide, intestable, dupliquée par plateforme.
2. Bibliothèque de domaine pure, sans dépendance, appelée par l'UI.
3. Moteur côté serveur uniquement — contredit ADR-0001.

## Décision
Option 2. Le moteur est une bibliothèque **pure** (entrées → sorties, pas d'effet de bord, pas d'accès au stockage, au réseau ni à l'UI), versionnée, couverte à 100 % par tests de règles métier.

## Conséquences
- (+) TDD naturel, propriétés vérifiables, partage app/API/back-office si la stack le permet.
- (+) Les vecteurs de [03](../03-regles-metier.md) servent de référence unique.
- (−) Discipline de frontière : aucune règle métier dans l'UI. Revue de code dédiée.
- Influence le choix de stack : un langage qui permet le partage du moteur entre client et serveur est un atout.

## Emplacement (2026-11-18)
Le moteur vit dans **`src/clients/domain`** : les calculs restent sur l'appareil, le serveur ne recalcule pas les prix. Il est consommé par l'app publique et, plus tard, par le calculateur du site public. Le back-office n'en dépend pas par défaut ; si un aperçu (BO-09) l'exige, il pourra l'importer en lecture seule.

## Vérification
Le dossier du moteur n'importe rien d'extérieur (contrôle automatique des dépendances). Couverture 100 % des règles RG.
