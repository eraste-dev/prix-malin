# 07 — Brief UX pour la refonte

Ce document n'impose **aucune solution visuelle**. Il liste les problèmes constatés et les contraintes, pour nourrir ton travail de conception.

## Constats sur le prototype

| # | Constat | Conséquence |
|---|---|---|
| U1 | Tout est sur **un seul écran dense** (4 blocs de saisie + ticket) : lourd pour un utilisateur non familier. | Surcharge cognitive, abandon probable sur mobile. |
| U2 | La saisie en tableau (libellé + quantité + prix + total) est **hostile au pouce** sur petit écran. | Erreurs de saisie, frustration. |
| U3 | Le résultat est dans un panneau latéral qui, sur mobile, passe **sous** les 4 blocs. | L'utilisateur ne voit pas l'effet de ses saisies : le « direct » perd son intérêt. |
| U4 | Aucune hiérarchie de **ce qui est obligatoire** vs optionnel (concurrent, TVA, arrondi). | Hésitation. |
| U5 | Beaucoup de **jargon** dès l'écran de saisie (coût direct, charges fixes, coefficient, taux de marge). | Barrière pour le public cible. |
| U6 | La pédagogie est **séparée** (onglet Comprendre) au lieu d'être au moment où la question se pose. | Contenu de valeur peu vu. |
| U7 | Pas de **premier lancement** : on tombe sur un exemple préchargé sans explication. | Confusion : est-ce mon produit ? |
| U8 | Esthétique de prototype, pas d'identité de marque. Design jugé non apprécié. | À repenser entièrement. |
| U9 | Chiffres et jauges (échelle rouge/orange/vert) **uniquement visuels** : dépendance à la couleur. | Accessibilité, daltonisme. |
| U10 | Aucun état vide / erreur / chargement soigné ; messages d'erreur techniques. | Confiance. |

## Contraintes de conception

- **Mobile-first, une main** : actions principales dans la zone du pouce, 44 px minimum, clavier numérique adapté sur les champs de montants.
- **Un écran = une question** (à évaluer face à l'alternative « tout sur un écran avec résultat flottant »). Garder un **résultat toujours visible** ou accessible en un geste.
- **Langage du commerçant**, pas du comptable : « ce que ça me coûte à chaque vente », « ce que je paie chaque mois quoi qu'il arrive », « ce que je gagne ». Les termes techniques arrivent ensuite, comme vocabulaire appris.
- **Saisie assistée** : suggestions de lignes de coût, valeurs par défaut par activité, calculs de tête évités (ex. « 2 000 F pour un sac de 25 kg » → prix au kg).
- **Chiffres lisibles** : grands, tabulaires, séparateur de milliers, unité toujours visible.
- **Information jamais portée par la couleur seule** (icône + texte en plus).
- **Faible bande passante** : pas d'illustration lourde, polices locales et limitées, icônes en SVG.
- **Sobriété culturelle** : références visuelles et exemples familiers (marché, wax, Mobile Money), sans folklore.
- Thème **clair et sombre**, texte agrandissable sans casser la mise en page.
- Prévoir **autres langues et autres devises** (textes plus longs, formats différents).

## Écrans à concevoir (inventaire)

1. Premier lancement / prise en main
2. Accueil (points d'entrée : calculer, tester mon prix, mes prix, comprendre)
3. Choix de l'activité
4. Coûts directs (saisie d'une liste)
5. Charges fixes et volume
6. Marge, frais, concurrent, TVA
7. **Résultat** (le cœur du produit : prix, décomposition, verdict, seuil)
8. Mode « tester mon prix actuel »
9. Mes prix (liste, vide, détail, duplication, suppression)
10. Comprendre (glossaire, erreurs fréquentes, chaque concept)
11. Partage (aperçu du résumé)
12. Réglages (thème, sauvegarde/export, à propos, confidentialité)
13. États transverses : vide, erreur, donnée invalide, hors ligne, confirmation destructive

## Livrables UX attendus

- Parcours utilisateur et arborescence
- Maquettes mobile, puis adaptation tablette/desktop
- Design system (couleurs, typographie, espacements, composants, états)
- Voix et ton (guide de rédaction en français simple)
- Test sur maquettes avec quelques commerçants

Les maquettes deviendront des **exigences vérifiables** : chaque écran sera décrit dans `docs/specs/` avec ses états et ses critères d'acceptation.
