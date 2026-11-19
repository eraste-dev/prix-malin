# ADR-0014 — Routage : react-router, adresses par hash

- Statut : Proposée
- Date : 2026-11-19

## Contexte
L'app a plusieurs écrans (Accueil, Calculer, Mes prix, Comprendre, Réglages, Mon activité, onboarding). Il faut un historique cohérent (le bouton retour d'Android et du navigateur), des adresses qu'on peut rouvrir (un article, un prix), et que cela marche **hors ligne, sous Capacitor et sur un hébergement statique** sans configuration serveur. Règle : dépendance éprouvée ([L-33](../17-lecons-apprises.md)).

## Options considérées
1. **react-router, `HashRouter`** — l'état de navigation vit après le `#` : aucune réécriture d'adresse côté serveur, marche en fichier local (Capacitor) et hors ligne.
2. react-router, `BrowserRouter` — jolies adresses, mais exige que le serveur (et le service worker) renvoient `index.html` pour chaque chemin ; fragile sous Capacitor.
3. Pas de routeur (état local) — perd le bouton retour et les adresses ; c'était l'état initial.
4. TanStack Router — plus récent, plus de typage ; surdimensionné ici.

## Décision
**react-router en mode bibliothèque, `HashRouter`**. Adresses : `#/` (accueil), `#/calculer`, `#/prix`, `#/activite`, `#/comprendre` et `#/comprendre/:slug`, `#/reglages`, `#/bienvenue`, `#/exemple`. Une adresse inconnue retombe sur l'accueil. Le premier lancement redirige vers `#/bienvenue` ; le bouton retour du navigateur revient à la page précédente.

## Conséquences
- (+) Historique et bouton retour natifs ; liens partageables à l'intérieur de l'app ; zéro configuration serveur.
- (+) Compatible Capacitor et hébergement statique.
- (−) Adresses avec `#` ; un futur site public indexé (lot 3) sera séparé de l'app ([09](../09-vision-systeme.md)), donc sans conséquence SEO.
- (−) Les ancres de page (`href="#id"`) ne sont plus utilisables : le lien d'évitement passe par un bouton qui donne le focus au contenu.

## Vérification
Tests : navigation entre pages, retour arrière, adresse inconnue, liens vers un article et vers un prix.
