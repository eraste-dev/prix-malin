---
version: alpha
name: Prix Malin
description: >-
  Conseiller de prix de vente pour petits commerçants en Côte d'Ivoire. Chaleureux, sobre,
  rassurant sur l'argent. Terre et sauge : un terracotta d'action, un vert sauge de résultat,
  des neutres chauds.
colors:
  light:
    background: "#F6EFE7"
    surface: "#FFFFFF"
    on-surface: "#241915"
    on-surface-muted: "#6B5B52"
    primary: "#B84A2E"
    on-primary: "#FFFFFF"
    secondary: "#2F4F43"
    on-secondary: "#FFFFFF"
    muted: "#EDE3D8"
    border: "#DDD0C3"
    danger: "#A8321F"
  dark:
    background: "#1B1512"
    surface: "#261D19"
    on-surface: "#F4EBE2"
    on-surface-muted: "#B7A99E"
    primary: "#E07B5F"
    on-primary: "#1B1512"
    secondary: "#2F4F43"
    on-secondary: "#F4EBE2"
    muted: "#31261F"
    border: "#3A2E27"
    danger: "#F08A76"
typography:
  display:
    fontFamily: Outfit
    fontSize: 3.75rem
    fontWeight: 300
    lineHeight: 1
    fontFeature: '"tnum"'
  headline:
    fontFamily: Outfit
    fontSize: 2.25rem
    fontWeight: 300
    lineHeight: 1.15
  title:
    fontFamily: Outfit
    fontSize: 1.25rem
    fontWeight: 300
    lineHeight: 1.3
  body-md:
    fontFamily: Outfit
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.5
  body-sm:
    fontFamily: Outfit
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.4
  label:
    fontFamily: Outfit
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.4
  amount-input:
    fontFamily: Outfit
    fontSize: 1.25rem
    fontWeight: 500
    lineHeight: 1.2
    fontFeature: '"tnum"'
rounded:
  sm: 10px
  md: 12px
  lg: 16px
  xl: 20px
  card: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 20px
  xl: 24px
  screen-bottom: 128px
motion:
  instant:
    duration: 80ms
    timingFunction: ease-out
  fast:
    duration: 160ms
    timingFunction: ease-out
  base:
    duration: 240ms
    timingFunction: ease-out
  slow:
    duration: 360ms
    timingFunction: ease-out
  emphasis:
    duration: 500ms
    timingFunction: ease-out
components:
  button-primary:
    backgroundColor: "{colors.light.primary}"
    textColor: "{colors.light.on-primary}"
    rounded: "{rounded.full}"
    height: 48px
  card:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.on-surface}"
    rounded: "{rounded.card}"
    padding: 20px
  card-result:
    backgroundColor: "{colors.light.secondary}"
    textColor: "{colors.light.on-secondary}"
    rounded: "{rounded.card}"
    padding: 20px
  field-input:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.on-surface}"
    typography: "{typography.amount-input}"
    rounded: "{rounded.md}"
    height: 48px
  nav-pill:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.on-surface-muted}"
    rounded: "{rounded.full}"
    padding: 6px
  nav-item-active:
    backgroundColor: "{colors.light.primary}"
    textColor: "{colors.light.on-primary}"
    rounded: "{rounded.full}"
    height: 56px
  theme-button:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.on-surface}"
    rounded: "{rounded.full}"
    size: 48px
  theme-card-selected:
    backgroundColor: "{colors.light.primary}"
    textColor: "{colors.light.on-primary}"
    rounded: "{rounded.card}"
    height: 96px
  segmented:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.on-surface}"
    rounded: "{rounded.full}"
    padding: 4px
  segmented-item-on:
    backgroundColor: "{colors.light.primary}"
    textColor: "{colors.light.on-primary}"
    rounded: "{rounded.full}"
    height: 48px
---

# Prix Malin — DESIGN.md

**Référence unique de l'interface.** Ce fichier fixe les valeurs (jetons) et dit pourquoi. Il sert de garde-fou contre la dérive : **on change ici d'abord, puis le code** ([`styles.css`](../../src/clients/app/src/styles.css) applique ces jetons). Il évolue, mais jamais en silence : toute modification de valeur est relue (`designmd diff`) et notée dans « Journal ».

Format : spécification [DESIGN.md de Google Labs](https://github.com/google-labs-code/design.md) (version alpha, le format peut changer). Statut des valeurs : **proposées**, validées par le propriétaire pour la palette ; le reste à valider avec les écrans.

Fichiers liés : [README ui-ux](README.md) (inspirations), [07 Brief UX](../07-brief-ux.md), [15 Écrans](../15-ecrans.md), [16 Responsive et mouvement](../16-responsive-et-mouvement.md), [17 Leçons](../17-lecons-apprises.md), [ADR-0010](../adr/0010-bibliotheque-ui-shadcn.md).

## Overview

Produit financier pour un public non technicien : la **confiance et la sobriété** passent avant l'effet. Les formes sont douces (grands arrondis, pilules), les chiffres sont grands et légers, l'espace est généreux. Ton visuel : chaleureux et terrien, jamais « banque » ni « jeu ».

- **Inspirations** ([README](README.md)) : en-tête avec date discrète puis gros titre léger ; cartes aux grands arrondis ; barre de navigation flottante en pilule ; contrôle segmenté sombre. On reprend **le style, jamais le contenu** (santé, photos, prénoms).
- **Pas de compte, pas de photo d'utilisateur** : « Bonjour » sans prénom.
- **Un seul écran de saisie à la fois sur mobile** ; le mobile est la référence ([16](../16-responsive-et-mouvement.md)).
- **Bibliothèque** : shadcn/ui (Tailwind + Radix). Les composants se personnalisent par les jetons, pas par du CSS écrit à la main ([L-01](../17-lecons-apprises.md)).

## Colors

**Deux couleurs de marque** et des neutres chauds. Aucune troisième couleur d'accent sans décision du propriétaire.

- **Primary — terracotta** (`#B84A2E`, sombre `#E07B5F`) : l'**action** (boutons), l'**onglet actif**, les **repères**. Réservé : ne jamais couvrir de grandes surfaces ni signaler un état normal, car il tire vers le rouge et pourrait passer pour une alerte.
- **Secondary — vert sauge** (`#2F4F43`) : la **carte résultat** et le verdict « bénéfice ». C'est une **surface** portant du texte clair, jamais un texte ni un trait sur fond sombre (contraste 2,0).
- **Neutrals** : sable (`background`), blanc (`surface`), encre chaude (`on-surface`), atténué (`on-surface-muted`).
- **Danger** : uniquement pour une erreur de saisie bloquante.

Contrastes contrôlés (AA) : texte/fond 15,0 ; atténué/fond 5,7 ; blanc/terracotta 5,2 ; blanc/sauge 9,0 ; sombre : texte/fond 15,3, atténué 7,9, fond/terracotta 6,2. **Toute nouvelle paire se contrôle** (`designmd lint`) en clair et en sombre ([L-22](../17-lecons-apprises.md)).

L'information ne passe **jamais par la couleur seule** : un verdict a une icône et un texte (RES-04). Thème **système par défaut**, bascule manuelle clair / sombre dans Réglages (EXG-51) ; les deux thèmes se pensent ensemble dès qu'on ajoute un jeton.

## Typography

Une famille : **Outfit** (variable, libre de droits), **auto-hébergée**, sous-ensemble latin + latin étendu (47 Ko au total, NFR-04). Aucune police externe bloquante.

- **Display** (le prix) et **Headline** : poids **léger (300)**, taille ≥ 36 px. Le poids léger est **réservé aux grands textes** : au soleil et sur écran modeste, un texte fin est illisible.
- **Corps** : poids moyen (500), **≥ 16 px** (NFR-07). Libellés en 600.
- **Chiffres tabulaires** partout où des montants s'alignent ou se mettent à jour (`tnum`). Unité (« F CFA ») en petit, à côté du grand chiffre.
- Le texte doit rester **agrandissable** sans casser la mise en page.

## Layout

- **Mobile d'abord**, largeur de contenu ≤ 560 px, marges de 20 px, zones sûres respectées (`env(safe-area-inset-*)`). Tablette et PC réduisent les étapes ; elles n'agrandissent pas les éléments ([16](../16-responsive-et-mouvement.md)).
- **Cibles tactiles ≥ 44 px** (NFR-06). Le contenu laisse 128 px en bas pour la barre flottante.
- Échelle d'espacement : 4 · 8 · 16 · 20 · 24. Une seule échelle, pas de valeur isolée.
- Écrans de questions : **une question par écran**, bouton fixe en bas ([15](../15-ecrans.md)).

## Elevation & Depth

Presque plat : la hiérarchie vient des **teintes de surface** (blanc sur sable), pas des ombres. Seule exception : la **barre de navigation flottante** (ombre légère + liseré) pour qu'elle se détache. **Pas de flou d'arrière-plan en temps réel** (performance sur appareil modeste) : l'effet « verre dépoli » des inspirations s'obtient, si besoin, par un dégradé statique.

## Shapes

Formes douces et cohérentes : **cartes 24 px**, champs 12 px, **pilules** (rayon maximal) pour boutons, onglets et contrôles segmentés. Pas de coins vifs. Un seul rayon par famille d'élément ; ne pas en mélanger sur un même écran.

## Motion & Micro-interaction

Détail dans [16](../16-responsive-et-mouvement.md). Jetons : instantané 80 ms (appui, bascule), rapide 160 ms (petits éléments), base 240 ms (questions, mise à jour du prix), lent 360 ms (feuilles), emphase 500 ms (**première révélation du résultat, une seule fois**).

**Chorégraphie d'entrée : chaque élément s'anime séparément, dans un seul geste coordonné.** Source unique : [`motion.ts`](../../src/clients/app/src/lib/motion.ts), composant [`Reveal`](../../src/clients/app/src/components/Reveal.tsx).

- **Temps forts** (*beats*) : étapes de la cascade, **40 ms d'écart, 6 au plus** (0 à 5). Écran Calculer : en-tête · titre · champ 1 · champ 2 · champ 3 · bas de page.
- **Dans un temps fort**, chaque élément a son **propre décalage de 20 ms** (3 au plus) : libellé puis champ ; date puis bouton de thème ; chaque onglet ; chaque carte de thème.
- **Retard maximal 240 ms** (5 × 40 + 2 × 20) : la cascade ne traîne jamais.
- Trois variantes : **montée** (fondu + 16 px, 300 ms) pour les éléments ; **fondu seul** pour les surfaces (carte, barre) afin de ne pas doubler le mouvement de leur contenu ; **emphase** (fondu + zoom léger, 500 ms) pour la carte résultat, dont chaque ligne entre ensuite à son tour.
- Changer d'onglet rejoue la cascade de l'écran affiché ; saisir un chiffre ne rejoue rien (le prix ne repart pas de zéro).
- Un nouvel élément prend **un rang existant**, il n'invente pas de délai : on ajoute un temps fort dans `motion.ts` (et on met à jour ce document).
- **`prefers-reduced-motion`** : toute animation est sous `motion-safe:` ; sinon rien ne bouge (MOV-01). Une animation ne bloque jamais la saisie (MOV-03) et tient ≥ 30 i/s à CPU ×4 (MOV-04).

## Voice & Content Strategy

- **Français simple, langage du commerçant**, pas du comptable : « ce que ça vous coûte à chaque vente », « vos charges du mois », « votre prix conseillé ». Les termes techniques viennent ensuite, expliqués.
- **Vouvoiement**, phrases courtes, verbes d'action, **aucun jargon non expliqué**.
- Montants : séparateur de milliers, **FCFA** sans décimale, unité écrite **FCFA** dans les champs et « F CFA » à côté du grand prix (ex. « 220 000 FCFA »). Pas de code ISO « XOF » à l'écran. Date en français (« mercredi 18 novembre »).
- Ton rassurant sur l'argent : on explique, on ne juge pas. Pas de ton alarmiste, pas d'humour sur les pertes.
- Une erreur dit **quoi faire**, pas ce qui a planté.
- Interface et textes en français ; identifiants du code en anglais.

## Components

Chaque composant vient de shadcn/ui (`src/clients/app/src/components/ui/`) et se règle par les jetons ci-dessus.

- **Bouton principal** (`button-primary`) : pilule terracotta, texte blanc. Une seule action principale par écran.
- **Carte** (`card`) : surface blanche, 24 px, sans bordure. **Carte résultat** (`card-result`) : sauge, prix en `display`.
- **Champ de montant** (`field-input`) : clavier numérique, milliers séparés, chiffres tabulaires. **Unité « FCFA » dans le champ, alignée à droite** (jamais à côté). **Pas de sous-libellé visible** : un **exemple clair** en filigrane (« ex. 210 »). La consigne complète reste lue par les lecteurs d'écran (`aria-describedby`, masquée à l'écran).
- **Navigation basse** (`nav-pill`, `nav-item-active`) : pilule flottante ; onglet actif = pastille terracotta avec icône **et** libellé ; les autres, icône seule avec un nom accessible. Deux onglets aujourd'hui : Calculer, Réglages.
- **Bouton de thème** (`theme-button`) : bouton rond **toujours visible en haut à droite** de l'en-tête (comme la cloche des inspirations). **Un clic bascule directement clair ↔ sombre**, sans menu ni liste. L'icône montre le thème affiché (soleil = clair, lune = sombre) et pivote à chaque bascule. Le retour au thème du système se fait dans Réglages.
- **Cartes de thème** (`theme-card-selected`) : dans l'onglet Réglages, trois cartes à icône (Système, Clair, Sombre), qui entrent une à une ; la carte choisie passe en terracotta. C'est le seul endroit où l'on choisit « Système ».
- **Contrôle segmenté** (`segmented`, `segmented-item-on`) : choix exclusif **de 2 à 3 libellés courts** (HT/TTC, conseillé/mon prix). Pas pour le thème.
- **À venir** (voir [15](../15-ecrans.md)) : indicateur d'étape « 2 sur 3 », pastilles de choix (marge, frais), jauge de plage, règle graduée, barre d'action sombre, feuille basse.

## Do's and Don'ts

**À faire**
- Changer **d'abord** ce fichier, puis `styles.css`, puis lancer `designmd lint`.
- Utiliser les jetons (`bg-primary`, `bg-secondary`, `text-muted-foreground`), jamais une valeur de couleur en dur.
- Vérifier le rendu **clair et sombre** et le contraste de toute nouvelle paire.
- Une icône **et** un texte pour tout verdict.
- Employer le composant shadcn existant avant d'en écrire un.
- Mesurer le poids après chaque ajout (cible 500 Ko compressés au total).

**À ne pas faire**
- Pas de **troisième couleur de marque** (le citron et la lavande des captures sont abandonnés).
- Pas de terracotta en grande surface ni pour un état normal.
- Pas de poids léger sous 40 px, pas de texte sous 16 px.
- Pas de flou d'arrière-plan en temps réel, pas d'animation en boucle.
- Pas de photo ni de prénom d'utilisateur ; pas de reprise du texte des inspirations.
- Pas de CSS écrit à la main pour un composant qui existe dans shadcn/ui.
- Pas de valeur isolée hors des échelles (espacement, rayons, durées).

## Journal

| Date | Changement | Raison |
|---|---|---|
| 2026-11-18 | Animations d'entrée : chorégraphie par temps forts, chaque élément animé séparément ; thème : un clic bascule clair ↔ sombre (plus de menu). | Demandé par le propriétaire : chaque élément indépendant, l'ensemble cohérent ; pas de select. |
| 2026-11-18 | Champs : exemple en filigrane à la place du sous-libellé ; unité FCFA dans le champ à droite. | Écran plus léger ; demandé par le propriétaire. |
| 2026-11-18 | Thème : bouton rond d'icône en en-tête + menu ; cartes à icône dans Réglages. Le contrôle segmenté n'est plus utilisé pour le thème. | Le contrôle segmenté de trois mots, relégué dans un onglet, a été jugé peu moderne et pas assez accessible. |
| 2026-11-18 | Création. Palette « Terre et sauge » : terracotta `#B84A2E` + sauge `#2F4F43` + sable `#F6EFE7`. Police Outfit. | Choix du propriétaire ; un terracotta plus profond que `#C2553A`, qui n'atteint que 4,51 avec du blanc. |
