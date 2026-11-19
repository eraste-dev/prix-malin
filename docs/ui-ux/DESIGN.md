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
    positive: "#2F4F43"
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
    positive: "#8FC3AB"
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
  2xl: 32px
  3xl: 48px
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
- **Positive — vert sauge** (`#2F4F43` en clair, **`#8FC3AB` en sombre**) : la couleur **ciblée** du « bénéfice » : la part de marge du graphique, plus tard le verdict. Sur un fond neutre, en texte ou en trait, jamais en grande surface. La sauge d'origine ne fait que 2,0 sur fond sombre, d'où la version éclaircie.
- **Secondary — sauge de surface** (`#2F4F43`) : reste disponible comme surface portant du texte clair ; **la carte résultat n'en fait plus usage** (fond neutre `muted`, voir Components).
- **Neutrals** : sable (`background`), blanc (`surface`), encre chaude (`on-surface`), atténué (`on-surface-muted`).
- **Danger** : uniquement pour une erreur de saisie bloquante.

Contrastes contrôlés (AA) : texte/fond 15,0 ; atténué/fond 5,7 ; blanc/terracotta 5,2 ; blanc/sauge 9,0 ; **sur la carte résultat (blanche)** : encre 15,0, atténué 6,4, sauge `positive` 9,0 ; en sombre : encre 14, atténué 7,0, `positive` 8,2 ; **éléments graphiques ≥ 3** (encre 50 % sur la carte : 3,4 en clair, 4,4 en sombre) ; sombre : texte/fond 15,3, atténué 7,9, fond/terracotta 6,2. **Toute nouvelle paire se contrôle** (`designmd lint`) en clair et en sombre ([L-22](../17-lecons-apprises.md)).

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
- Échelle d'espacement : 4 · 8 · 16 · 20 · 24 · 32 · 48. Une seule échelle, pas de valeur isolée.
- **Respiration** : 48 px entre les sections d'un écran (en-tête, cartes, message) ; 32 px entre les champs d'un formulaire ; 32 px de marge intérieure dans une carte ; 16 px entre un libellé et son champ.
- Écrans de questions : **une question par écran**, bouton fixe en bas ([15](../15-ecrans.md)).

## Elevation & Depth

Presque plat : la hiérarchie vient des **teintes de surface** (blanc sur sable), pas des ombres. Seule exception : la **barre de navigation flottante** (ombre légère + liseré) pour qu'elle se détache. **Pas de flou d'arrière-plan en temps réel** (performance sur appareil modeste) : l'effet « verre dépoli » des inspirations s'obtient, si besoin, par un dégradé statique.

## Shapes

Formes douces et cohérentes : **cartes 24 px**, champs 12 px, **pilules** (rayon maximal) pour boutons, onglets et contrôles segmentés. Pas de coins vifs. Un seul rayon par famille d'élément ; ne pas en mélanger sur un même écran.

## Motion & Micro-interaction

Détail dans [16](../16-responsive-et-mouvement.md). Jetons : instantané 80 ms (appui, bascule), rapide 160 ms (petits éléments), base 240 ms (questions, mise à jour du prix), lent 360 ms (feuilles), emphase 500 ms (**première révélation du résultat, une seule fois**).

**Moteur : GSAP** (`gsap` + `@gsap/react`, hook `useGSAP`), pour **toutes** les animations de l'app ([ADR-0011](../adr/0011-bibliotheque-animation-gsap.md)). On ne réécrit pas de mouvement à la main : ni `@keyframes`, ni utilitaires maison. Seules exceptions : les ouvertures de la boîte de dialogue et de l'info-bulle, qui gardent les classes `tw-animate-css` livrées avec ces composants shadcn.

**Chorégraphie d'entrée : chaque élément s'anime séparément, dans un seul geste coordonné.** Source unique des temps : [`motion.ts`](../../src/clients/app/src/lib/motion.ts) ; composant [`Reveal`](../../src/clients/app/src/components/Reveal.tsx), qui pose l'entrée GSAP (fondu, montée ou zoom) puis **retire ses styles en ligne** : l'état final vit dans le DOM, l'animation ne fait que l'atteindre.

- **Temps forts** (*beats*) : étapes de la cascade, **40 ms d'écart, 6 au plus** (0 à 5). Écran Calculer : en-tête · titre · champ 1 · champ 2 · champ 3 · bas de page.
- **Dans un temps fort**, chaque élément a son **propre décalage de 20 ms** (3 au plus) : libellé puis champ ; date puis bouton de thème ; chaque onglet ; chaque carte de thème.
- **Retard maximal 240 ms** (5 × 40 + 2 × 20) : la cascade ne traîne jamais.
- Trois variantes : **montée** (fondu + 16 px, 300 ms) pour les éléments ; **fondu seul** pour les surfaces (carte, barre) afin de ne pas doubler le mouvement de leur contenu ; **emphase** (fondu + zoom léger, 500 ms) pour la carte résultat, dont chaque ligne entre ensuite à son tour.
- Changer d'onglet rejoue la cascade de l'écran affiché ; saisir un chiffre ne rejoue rien (le prix ne repart pas de zéro).
- Un nouvel élément prend **un rang existant**, il n'invente pas de délai : on ajoute un temps fort dans `motion.ts` (et on met à jour ce document).
- **Autres mouvements GSAP** (durées dans `motion.ts`) : rond du stepper qui rebondit à chaque changement d'état (300 ms) ; trait du stepper qui se remplit de haut en bas (500 ms) ; arcs du demi-cercle dessinés l'un après l'autre (700 ms, décalés de 120 ms) puis glissant vers leur nouvelle longueur (500 ms) ; icône du thème qui pivote (300 ms) ; détail de « Pourquoi ce prix ? » qui se déploie en hauteur (300 ms) et chevron qui pivote (200 ms).
- **`prefers-reduced-motion`** : `motionAllowed()` (dans `motion.ts`) est faux si l'utilisateur demande de réduire les animations **ou** si le navigateur ne sait pas le dire ; alors **GSAP ne pose aucun tween et aucun style en ligne n'est ajouté** (MOV-01), et tous les états finaux sont déjà dans le DOM. Une animation ne bloque jamais la saisie (MOV-03) et tient ≥ 30 i/s à CPU ×4 (MOV-04, à mesurer).

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
- **Carte** (`card`) : surface blanche, 24 px, sans bordure. **Carte résultat** (`card-result`) : **même surface blanche** que les autres cartes (contraste maximal, aucune teinte à justifier), prix en `display` **en encre** ; la couleur est réservée à la part de marge du graphique. Le texte secondaire utilise `text-muted-foreground`, jamais une opacité.
- **Demi-cercle de composition** (`composition-gauge`) : dans la carte résultat, sous les indicateurs. Un **demi-cercle** (anneau de 180°, trait de 18 px) découpé en arcs séparés d'un petit espace (coût direct · part des charges · frais · marge, les montants nuls omis), longueur de chaque arc = sa part du prix HT (RG-05 : la somme fait exactement le prix). Au centre, **la part de marge en grand** (48 px, poids léger) avec « de marge ». **Animation (GSAP)** : à l'apparition, les arcs se dessinent l'un après l'autre (700 ms chacun, décalés de 120 ms) ; quand la marge ou les frais changent, chaque arc glisse vers sa nouvelle longueur (500 ms) au lieu de sauter. Les attributs SVG portent l'état final ; sous `prefers-reduced-motion`, rien ne bouge. **Couleurs ciblées sur fond blanc** : coût direct en encre (`foreground`), charges en `muted-foreground`, frais en encre à 50 %, **marge en `positive`** (seule teinte de la barre : c'est ce que le commerçant garde). Chaque couleur fait ≥ 3 contre le fond. La couleur ne porte jamais seule le sens : une **légende** donne pour chaque part le nom, le pourcentage et le montant (centimes conservés, 4,5 F), et la barre a un `aria-label` qui les énonce.
- **« Pourquoi ce prix ? »** (`why-price`) : bloc **replié** par défaut sous la barre (`Collapsible` shadcn, chevron qui pivote, cible de 44 px). Ouvert : lignes chiffrées (coût direct, part des charges avec « 220 000 F ÷ 2 000 ventes », coût de revient, frais, marge réelle **en % du prix pour la marge visée**), la formule en clair, et l'effet de l'arrondi (« 432,43 F devient 450 F… la différence s'ajoute à votre marge »).
- **Champ de montant** (`field-input`) : clavier numérique, milliers séparés, chiffres tabulaires. **Unité « FCFA » dans le champ, alignée à droite** (jamais à côté). **Pas de sous-libellé visible** : un **exemple clair** en filigrane (« ex. 210 »). La consigne complète reste lue par les lecteurs d'écran (`aria-describedby`, masquée à l'écran).
- **Stepper vertical** (`step-rail`) : rail en **position fixe, centré à mi-hauteur de l'écran**, à gauche de l'écran Calculer (une colonne de 44 px est réservée dans la mise en page) ; **il ne défile pas** avec les sections. **Seule l'étape en cours est grande** (rond de 36 px, avec son numéro) ; les autres sont de petits ronds de 24 px (coche pour une étape faite, rond vide sinon), tous avec une zone tactile de 44 px, reliés par de courts traits de 24 px. **Au survol et au focus clavier, une info-bulle** (texte 16 px, sobre, sans formule « fait / à faire ») résume l'étape : activité, nombres saisis, prix conseillé, marge et frais ; le même texte est la description accessible du rond. Étapes : Que vendez-vous ? · Vos chiffres · Résultat · Ajuster. **Teintes neutres** (gris, blanc, noir) ; **seule l'étape en cours** prend la couleur primaire, et il n'y en a qu'une à la fois. États : **verrouillé** (rond gris, désactivé) · **disponible** (rond blanc, liseré, numéro noir) · **en cours** (terracotta, numéro) · **fait** (rond noir, coche blanche). Le trait qui se remplit est noir. Un état n'est jamais porté par la couleur seule (numéro ou coche, `aria-current="step"` sur l'étape en cours). Les étapes verrouillées restent visibles, leur titre est atténué et une consigne dit ce qui les débloque. **Au déblocage** : le trait se remplit (500 ms), le rond rejoue une apparition (zoom, 300 ms) et le contenu de la section entre. Un appui sur un rond ouvert fait défiler jusqu'à sa section (sans animation avec `prefers-reduced-motion`). Tout est sous `motion-safe:`.
- **Choix du type d'activité** (`activity-choice`) : section « Que vendez-vous ? » en tête de l'écran Calculer, **sans carte englobante** : trois tuiles à icône côte à côte (Achat-revente · Je fabrique · Prestation) posées sur le fond ; la choisie passe en terracotta. L'exemple d'une ligne est lu par les lecteurs d'écran (`sr-only`), faute de place à l'écran sur mobile. `ToggleGroup` shadcn en mode `single`. Le type fixe les défauts de marge, de frais et d'arrondi (docs/15). **Changer de type après avoir ajusté la marge ou les frais ouvre une confirmation** (`AlertDialog` shadcn : « Annuler » / « Changer ») ; les montants saisis ne sont jamais effacés. La carte entre au temps fort « titre » de la chorégraphie, sans nouveau rang.
- **Pastilles de choix** (`pill-choice`) : `ToggleGroup` shadcn en mode `single`, pilules de 44 px de haut, la choisie en terracotta. Servent à la **marge** (10 · 20 · 30 · 40 %) et aux **frais de paiement** (Espèces 0 % · Mobile Money 1 %) dans la section « Ajuster », sous le résultat, **à plat sur le fond** (filet fin au-dessus, pas de carte). La marge par défaut (25 %) n'a pas de pastille : elle s'affiche en toutes lettres au-dessus. Choisir une pastille recalcule le prix aussitôt.
- **Contrôle segmenté** (`segmented`) pour les choix de 2 à 3 libellés courts : **Total / Détail** (coût, charges), **Prix conseillé / Mon prix**, **HT / TTC**. Pilule `muted`, option active en encre (`foreground`) avec texte `background` ; `ToggleGroup` shadcn en mode `single`, cibles de 44 px. Il se place à droite du libellé et passe à la ligne si la place manque.
- **Lignes de détail** (`cost-lines`, `charge-lines`) : une carte légèrement teintée (`muted`) par ligne, champs de 48 px ; le libellé, la quantité (décimale, « 0,5 ») et le prix unitaire pour le coût direct ; le montant pour une charge. Les libellés des champs répétés sont lus par les lecteurs d'écran (`sr-only`). **Pastilles de suggestion** (« + Transport ») qui ajoutent une ligne nommée et placent le curseur sur son montant. **Pastilles de charges** à cocher (`aria-pressed`) avec **« Ma rémunération » en tête**, entourée de la couleur primaire tant qu'elle n'est pas cochée. Un total en pied (`font-semibold`).
- **Rappel de rémunération** (`remuneration-reminder`) : groupe non bloquant sous les charges, bordure primaire fine, deux actions (« L'ajouter », « Continuer »), une seule fois par calcul.
- **Verdict** (`verdict`) : bloc `muted` avec **icône et texte** (triangle : perte à chaque vente ; cercle d'alerte : charges non couvertes ; cercle coché en `positive` : bénéfice), titre en `font-semibold` et une phrase chiffrée. Il n'existe que pour **Mon prix** : le prix conseillé n'a jamais de verdict.
- **Réglages du prix** (carte « Ajuster ») : marge et frais en pastilles ; **arrondi** par interrupteur (`Switch` shadcn) et pastilles de pas (5 · 25 · 50 · 100 · 500 F) ; **TVA** par interrupteur puis HT / TTC ; **prix du concurrent** facultatif, avec une note d'information sous le prix (jamais un reproche).
- **Feuilles** (`Sheet` shadcn, côté bas, coins supérieurs de 24 px) : **Enregistrer** (nom prérempli, « Mettre à jour » ou « Enregistrer une copie » si le calcul vient d'un prix enregistré) et **Partager** (aperçu du texte, « Partager » natif si le téléphone le propose, « Copier » toujours).
- **Messages d'état** (`sonner`, en haut, texte de 16 px) : « Prix enregistré » avec le lien « Voir », « Résumé copié ». Annoncés aux lecteurs d'écran.
- **Cartes de liste** (Mes prix, derniers prix, Comprendre) : surface blanche, 24 px, un titre léger (20 px), le prix en grand (36 px, poids léger) et une ligne d'informations en `muted-foreground` (type, marge, verdict avec son icône, date). Menu « ⋯ » à 48 px (`DropdownMenu` shadcn : Dupliquer, Supprimer). **Suppression sans fenêtre bloquante** : message « Prix supprimé » avec « Annuler » pendant 6 s. Liste vide : carte avec icône, une phrase et l'action « Calculer mon premier prix ».
- **Accueil** : en haut « Reprendre » (carte blanche) quand un calcul est commencé, puis deux boutons de 56 px (« Calculer un prix », « Tester mon prix actuel »), les trois derniers prix, et « le conseil du moment » (un par jour, lié à un article).
- **Onboarding** : plein écran sans barre de navigation, trois cartes (icône dans un rond blanc, titre de 36 px, message de 20 px), « Passer » toujours en haut à droite, points de progression, « Suivant » / « Retour ». Dernière carte : deux issues (« Calculer mon prix », « Voir un exemple d'abord »). **Exemple guidé** : bandeau noir permanent « Exemple », quatre bulles passables dans une carte, calcul essayable dans des stockages séparés (rien ne va dans les données de l'utilisateur).
- **Bouton d'aide « ? »** (`help-button`) : rond de 44 px, icône seule (`aria-label` « Aide : … »), à côté du libellé qu'il explique ; ouvre une feuille basse avec une définition de 3 à 5 lignes et « En savoir plus » vers l'article.
- **Réglages** : sections à titre léger (Thème, Présentation et aides, Sauvegarde, Confidentialité, À propos, Vos données). Boutons en pilule de 48 px ; **effacement** par une boîte de dialogue à confirmation renforcée (taper « EFFACER »), bouton en bordure `destructive`.
- **Bandeaux d'intégrité** (`alert`) : carte `muted` avec une phrase claire et « Compris » quand du stockage abîmé a été écarté.
- **Mon activité** : mêmes pastilles et lignes que les charges de Calculer ; un tableau « Répartition » (en-têtes en `muted-foreground`, lignes séparées d'un filet, montants alignés à droite en chiffres tabulaires) donne la part de chaque produit, **au prorata de ses ventes mensuelles** (règle par défaut, Q-27). Dans Calculer, un contrôle segmenté « Origine des charges » (Charges propres / Mes charges partagées) n'apparaît que si des charges partagées existent ; en mode partagé, le champ est remplacé par « Votre part des charges partagées » et un lien pour les modifier. **Invitation** (carte blanche) dès le deuxième produit enregistré, écartable (« Plus tard »).
- **Aide à usage unique** (`tip`, rôle `note`) : bandeau `muted` avec une ampoule, une phrase et « Compris » ; une fois fermée, elle ne revient plus (réinitialisable dans Réglages). Une aide par moment : coût direct, charges, premier résultat.
- **Écran de secours** : titre de 36 px, une phrase qui rassure (« Vos données sont intactes »), « Revenir à l'accueil » ; jamais de trace technique.
- **Navigation basse** (`nav-pill`, `nav-item-active`) : pilule flottante ; onglet actif = pastille terracotta avec icône **et** libellé ; les autres, icône seule avec un nom accessible. Deux onglets aujourd'hui : Calculer, Réglages.
- **Bouton de thème** (`theme-button`) : bouton rond **toujours visible en haut à droite** de l'en-tête (comme la cloche des inspirations). **Un clic bascule directement clair ↔ sombre**, sans menu ni liste. L'icône montre le thème affiché (soleil = clair, lune = sombre) et pivote à chaque bascule. Le retour au thème du système se fait dans Réglages.
- **Cartes de thème** (`theme-card-selected`) : dans l'onglet Réglages, trois cartes à icône (Système, Clair, Sombre), qui entrent une à une ; la carte choisie passe en terracotta. C'est le seul endroit où l'on choisit « Système ».
- **Contrôle segmenté** (`segmented`, `segmented-item-on`) : choix exclusif **de 2 à 3 libellés courts** (HT/TTC, conseillé/mon prix). Pas pour le thème.
- **À venir** (voir [15](../15-ecrans.md)) : indicateur d'étape « 2 sur 3 », pastilles de choix (marge, frais), jauge de plage, règle graduée, barre d'action sombre, feuille basse.

## Do's and Don'ts

**À faire**
- Tout élément cliquable porte `cursor: pointer` (règle globale dans `styles.css` : Tailwind v4 ne la met plus sur les boutons, et shadcn compte dessus) ; un bouton désactivé porte `not-allowed`.
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
| 2026-11-18 | Espacement : ajout des crans 32 et 48 px ; sections et champs à 48 px, marge de carte à 32 px, libellé-champ à 16 px. | Formulaire trop serré, première aération jugée invisible ; demandé par le propriétaire. |
| 2026-11-18 | Stepper vertical fixe (rail collé en haut, 4 étapes, déblocage animé, appui = défilement) ; titres de section « Que vendez-vous ? », « Vos chiffres », « Résultat », « Ajuster ». | Faciliter la navigation ; première version (ronds collés aux sections) refusée : le rail doit rester fixe. |
| 2026-11-19 | Mon activité (charges partagées, répartition au prorata des ventes), aides contextuelles à usage unique, écran de secours. | Intégration de E10, des accompagnements de docs/14 et de l'état d'erreur de E14. |
| 2026-11-19 | Écrans Accueil, Mes prix, Comprendre (contenu embarqué et validé), aide « ? », Onboarding avec exemple guidé, Réglages complets (sauvegarde, effacement renforcé, aides), bandeaux d'intégrité. Navigation à cinq entrées (Accueil · Calculer · Mes prix · Comprendre · Réglages). | Intégration des écrans E01, E09, E11 à E14 et de docs/14 ; autonomie demandée par le propriétaire. |
| 2026-11-19 | Écran Calculer complet : nom et unité (Q1), Total / Détail du coût et des charges avec pastilles et rappel de rémunération (Q2, Q3), bascule Prix conseillé / Mon prix avec verdict, réglages d'arrondi, de TVA et de concurrent, feuilles Enregistrer et Partager, messages d'état. | Intégration des écrans E02 à E08 (docs/15) ; autonomie demandée par le propriétaire. |
| 2026-11-18 | Toutes les animations passent à GSAP (ADR-0011) : `Reveal`, rond et trait du stepper, arcs du demi-cercle, bascule du thème, détail « Pourquoi ce prix ? ». Suppression des `@keyframes` et des classes de mouvement maison. | Règle « dépendances éprouvées plutôt que code maison » (L-33) ; GSAP choisi par le propriétaire. |
| 2026-11-18 | Carte résultat sur fond blanc (abandon du fond `muted`), prix en encre ; la barre de composition devient un demi-cercle animé (arcs dessinés en cascade, glissement quand marge ou frais changent) avec la part de marge au centre ; `positive` réservé à la marge. | Fond beige et couleur du prix refusés ; demi-cercle demandé par le propriétaire. |
| 2026-11-18 | Carte résultat sur fond neutre `muted` (au lieu de la sauge), prix et marge en `positive` (sauge éclaircie en sombre) ; segments de la barre à ≥ 3 de contraste ; `cursor: pointer` global sur les éléments cliquables. | Contraste insuffisant de la barre sur la sauge (segments à 1,7 et 2,5) ; cursor shadcn/Tailwind v4 ; demandé par le propriétaire. |
| 2026-11-18 | Résultat : barre de composition du prix et bloc repliable « Pourquoi ce prix ? » (temps fort 5 de la révélation du résultat, rangs 0 et 1). | Intégration de l'écran E06, éléments 4 et 5 (docs/15). |
| 2026-11-18 | Stepper : rail fixe centré à mi-hauteur, ronds réduits sauf l'étape en cours, info-bulle de résumé au survol et au focus (composant `tooltip` shadcn, texte porté à 16 px). | Demandé par le propriétaire ; résumés rédigés sans « fait / à faire ». |
| 2026-11-18 | Stepper : teintes neutres (gris, blanc, noir), primary réservé à l'étape en cours (une seule à la fois) ; nouvel état « disponible ». | Demandé par le propriétaire : le terracotta et la sauge partout sur le rail étaient trop présents. |
| 2026-11-18 | Fin de l'empilement de cartes identiques : type d'activité en tuiles à icône sans carte, « Ajuster » à plat avec un filet ; seules les cartes blanche (champs) et sauge (résultat) restent. | Écran répétitif, « manque de créativité » ; demandé par le propriétaire. |
| 2026-11-18 | Espacement : champs d'un formulaire ramenés de 48 à 32 px (sections inchangées à 48 px). | Champs jugés trop séparés ; demandé par le propriétaire. |
| 2026-11-18 | Carte « Que vendez-vous ? » (type d'activité, EXG-01) et confirmation au changement de type (EXG-03). | Intégration de l'écran Q1 (docs/15 E02), version sans nom ni unité. |
| 2026-11-18 | Carte « Ajuster » (marge, frais de paiement) sous le résultat ; pastilles de choix ; carte résultat à 32 px de marge comme les autres. | Intégration de l'écran Résultat (docs/15 E06, niveau 2). |
| 2026-11-18 | Champs : exemple en filigrane à la place du sous-libellé ; unité FCFA dans le champ à droite. | Écran plus léger ; demandé par le propriétaire. |
| 2026-11-18 | Thème : bouton rond d'icône en en-tête + menu ; cartes à icône dans Réglages. Le contrôle segmenté n'est plus utilisé pour le thème. | Le contrôle segmenté de trois mots, relégué dans un onglet, a été jugé peu moderne et pas assez accessible. |
| 2026-11-18 | Création. Palette « Terre et sauge » : terracotta `#B84A2E` + sauge `#2F4F43` + sable `#F6EFE7`. Police Outfit. | Choix du propriétaire ; un terracotta plus profond que `#C2553A`, qui n'atteint que 4,51 avec du blanc. |
