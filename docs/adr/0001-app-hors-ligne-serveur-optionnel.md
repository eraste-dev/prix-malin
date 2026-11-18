# ADR-0001 — App hors ligne, serveur optionnel

- Statut : Acceptée
- Date : 2026-11-18

## Contexte
Public cible en Côte d'Ivoire : connexion intermittente, data limitée, Android d'entrée de gamme. En parallèle, un back-office doit gérer contenu, statistiques, comptes et quotas, ce qui suppose un serveur.

## Options considérées
1. **App dépendante du serveur** — simple à gouverner (quotas, contenu), mais inutilisable sans réseau ; mauvais pour la cible.
2. **App totalement autonome, serveur plus tard** — simple à livrer, mais le back-office ne sert à rien tant qu'on n'a pas relié les deux, et la reprise coûte cher.
3. **App autonome, serveur optionnel qui l'enrichit** — l'app marche seule ; si le réseau est là, elle récupère contenu et configuration, et envoie des données uniquement avec consentement.

## Décision
Option 3. Le calcul, la saisie et l'enregistrement fonctionnent sans serveur. Le serveur apporte du contenu, de la configuration et, plus tard, des comptes et des statistiques. Chaque donnée serveur a une **valeur de repli embarquée**.

## Conséquences
- (+) Utilisable partout, un serveur en panne ne casse rien.
- (+) Le back-office peut alimenter l'app dès la livraison 1.
- (−) Deux sources de vérité à réconcilier (embarqué vs récupéré) : versions et validation obligatoires.
- (−) Les quotas ne sont pas imposables localement (voir [09 §5](../09-vision-systeme.md)).

## Vérification
Test automatisé : app sans réseau, sans cache, parcours complet calcul → enregistrement → relance. Aucun appel réseau bloquant.
