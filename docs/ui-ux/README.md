# Inspirations UI/UX

> **Les valeurs retenues (palette, police, formes, composants, règles) sont dans [DESIGN.md](DESIGN.md)**, la référence unique de l'interface. Ce document-ci ne garde que les inspirations brutes et ce qu'on en retient.

Références collectées par le concepteur UX. Ce document dit **ce qu'on en retient et pourquoi**, relié aux écrans de [15](../15-ecrans.md). Ce sont des **sources d'inspiration**, pas des maquettes à reproduire : la direction visuelle finale reste à la charge du concepteur.

## Références

| Fichier | Nature | Source |
|---|---|---|
| `3f4d86290457b576dd59c4ba7fc21dc8.webp` | Application santé, 3 écrans : accueil, détail en verre dépoli, prise de rendez-vous | À renseigner (URL, auteur) |
| `86b2b5d8f1b7401ab927fe39af7d12a4.webp` | Application de suivi, tableau de bord clair avec règle graduée | À renseigner (URL, auteur) |

## Ce qu'on retient

| Motif observé | Application à Prix Malin | Écran |
|---|---|---|
| **Gros chiffres très légers** (118/76, 72.4 kg) avec l'unité en petit à côté | Le prix en héros, « F CFA » en petit ; chiffres tabulaires | E06 |
| **Jauge de plage** : trois zones (bas, sain, haut) et un repère mobile | Position du prix : perte / charges non couvertes / bénéfice, avec le prix et le concurrent en repères | E06 verdict |
| **Règle graduée** avec repère, valeur de départ et objectif | Règle horizontale : coût de revient → prix → concurrent, avec plancher et équilibre marqués | E06 |
| **Indicateur d'étape** « Étape 2 sur 3 » en segments + bouton retour rond | Questions Q1 à Q3 | E02 à E04 |
| **Contrôle segmenté** à pastille pleine (Vidéo / Cabinet / Domicile) | Choix de l'activité ; bascules Conseillé ⇄ Mon prix et HT ⇄ TTC | E02, E06 |
| **Pastilles de choix** avec état sélectionné et état désactivé | Marge 10 / 20 / 30 / 40 %, frais, pas d'arrondi | E06 « Ajuster » |
| **Barre d'action sombre** : libellé + sous-libellé + flèche ronde | « Voir mon prix » / « Enregistrer », avec le contexte en sous-titre | E04, E06 |
| **Barre de navigation flottante** en pilule, action principale détachée | Navigation basse en compacte | Tous |
| **Cartes arrondies** à fond teinté, carrousel qui laisse voir la carte suivante | « Mes derniers prix », conseil du moment | E01 |
| **Mini-graphiques** (points « 4 jours sur 7 », courbe) | Progression vers le seuil de rentabilité, par exemple « 935 ventes à faire » | E06 indicateurs |
| **Onglets-pastilles** (Aujourd'hui / Semaine / Mois) | Filtres de « Mes prix » plus tard (par activité) | E09 |
| **Un accent vif unique** sur fond neutre (citron, corail) | Un accent pour l'action principale et le repère, le reste en neutres | Design system |

## Points d'attention pour notre public et nos contraintes

| Risque | Contrainte du projet | Parade proposée |
|---|---|---|
| Typographie **très fine** : illisible au soleil et sur écran modeste | NFR-06, NFR-07 : texte ≥ 16 px, contraste AA | Poids léger **réservé aux grands chiffres** (≥ 40 px) ; texte courant en poids moyen |
| **Pastel sur pastel** et citron sur blanc : contraste insuffisant | WCAG 2.2 AA ; l'information ne passe pas par la couleur seule | Vérifier chaque paire de couleurs ; icône + texte pour les verdicts (RES-04) |
| **Verre dépoli / flou d'arrière-plan** | Performance sur appareil modeste (P2, MOV-04) | Écarter le flou en temps réel au lot 1 ; obtenir l'effet par un dégradé statique |
| Police de caractère fantaisie, lourde à charger | NFR-04 : < 500 Ko au total | Auto-héberger, un ou deux poids, sous-ensemble latin ; pistes libres de droits à comparer : Urbanist, Outfit, Plus Jakarta Sans, Sora, Manrope |
| **Photos de personnes**, salutation par prénom | Pas de compte, pas de profil, données sur l'appareil | « Bonjour » sans prénom ; pas de photo d'utilisateur ; illustrations légères |
| Univers **santé**, ton intime | Produit financier : confiance et sobriété | Garder la douceur des formes, mais un vocabulaire clair et rassurant sur l'argent |
| Fond clair uniquement | Thème sombre prévu (EXG-51) | Penser les deux thèmes dès les jetons de couleur |

## Droits

Ce sont des œuvres de tiers. Les versionner dans un dépôt **public** revient à les republier. Deux options : les garder en dehors de git (dossier ignoré ou stockage privé) en ne conservant ici que les liens et ce document, ou vérifier que le dépôt est privé. À décider par le propriétaire du dépôt.

## À compléter

- URL et auteur de chaque référence.
- Quelle référence te parle le plus, et pourquoi (ton, densité, couleur).
- Direction de palette retenue et premiers choix de typographie.
