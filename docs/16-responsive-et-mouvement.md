# 16 — Adaptation aux écrans et mouvement

Complète [15](15-ecrans.md). Principe : **mêmes composants, même logique, dispositions différentes**. Le mobile est la référence ; tablette et PC exploitent la place pour **réduire les étapes**, pas pour agrandir les éléments.

## 1. Classes d'écran

| Classe | Largeur | Usage typique | Orientation |
|---|---|---|---|
| **Compacte** | < 600 px | Téléphone portrait | Une colonne, une question à la fois |
| **Moyenne** | 600 – 1023 px | Tablette, téléphone paysage, pliable | Deux zones côte à côte |
| **Étendue** | ≥ 1024 px | PC, grande tablette | Tout visible, résultat permanent |

Les classes se basent sur la **largeur disponible**, pas sur l'appareil (fenêtre redimensionnée, écran partagé). Largeur minimale supportée : 320 px.

## 2. Navigation

| Classe | Navigation principale | Navigation secondaire |
|---|---|---|
| Compacte | **Barre inférieure** : Accueil · Mes prix · Comprendre · Réglages (zone du pouce) | Retour en haut à gauche ; geste retour natif respecté |
| Moyenne | **Rail latéral** gauche (icônes + libellés) | Idem |
| Étendue | **Barre latérale** repliable avec libellés | Fil d'Ariane discret dans les écrans profonds |

La barre inférieure se **masque pendant les questions guidées** (elle gênerait le clavier) et réapparaît au résultat.

## 3. Disposition par écran

| Écran | Compacte | Moyenne | Étendue |
|---|---|---|---|
| **Accueil** | Colonne : reprise, deux boutons, derniers prix, conseil | Deux colonnes : actions à gauche, prix et conseil à droite | Grille ; boutons côte à côte, derniers prix en cartes |
| **Questions Q1–Q4** | **Une question par écran**, bouton fixe en bas au-dessus du clavier, indicateur « 2/3 » | Une question au centre (largeur ≤ 560 px) **+ résumé du calcul** à droite qui se construit | **Les trois questions sur une seule page**, en blocs successifs, résultat en direct à droite (plus de bouton « Suivant ») |
| **Résultat** | **Prix en tête**, puis composition, « Pourquoi » replié, **Ajuster** dans une feuille basse déployable, actions fixes en bas | Deux zones : prix et composition à gauche ; **Ajuster** à droite, toujours déployé | Deux zones : résultat **fixe** (collé en haut) à droite, saisies et leviers à gauche ; tout est visible sans défiler |
| **Mes prix** | Liste | **Liste + détail** (maître-détail) | Liste + détail + options de tri, tableau comparatif possible |
| **Comprendre** | Liste de cartes puis page | Liste à gauche, article à droite | Idem, avec sommaire flottant |
| **Réglages** | Liste de sections | Liste + panneau | Deux colonnes |
| **Feuilles** (Enregistrer, Partager, Aide) | Feuille depuis le bas, 3 hauteurs d'accroche | Feuille centrée large | **Boîte de dialogue** centrée, ou panneau latéral |

### Règles de grille

- Largeur de lecture maximale du texte : **65 caractères** (≈ 560 px).
- Largeur maximale du contenu : **1200 px**, centré au-delà.
- Espacement basé sur une échelle de 4 px ; marges latérales 16 px (compacte), 24 px (moyenne), 32 px (étendue) plus zones de sécurité (encoche, barre système).
- Chiffres du résultat en **chiffres tabulaires**, mise à l'échelle fluide entre 2,4 et 3,6 rem.

## 4. Modes de saisie

| Mode | Adaptations |
|---|---|
| **Tactile** | Cibles ≥ 44 px, clavier numérique (`inputmode`), gestes : glisser pour dupliquer/supprimer, tirer la feuille, retour natif |
| **Clavier** | Ordre de tabulation logique, **Entrée** = suivant ou valider, **Échap** = fermer une feuille, **Ctrl/⌘ + Entrée** = enregistrer, focus visible, raccourcis listés dans l'aide |
| **Souris** | États de survol, infobulles sur les chiffres, curseur adapté aux curseurs de réglage |
| **Lecteur d'écran** | Titres hiérarchisés, régions nommées, **annonces vocales** du nouveau prix lors d'un réglage (région `aria-live` polie, regroupée pour ne pas bavarder) |
| **Texte agrandi** (jusqu'à 200 %) | Mise en page qui passe d'une zone à une colonne sans perte de contenu |

## 5. Mouvement : principes

1. **Le mouvement explique** : il montre d'où vient un élément, ce qui a changé, où l'on va. Jamais décoratif seul.
2. **Un seul chef d'orchestre par transition** : un élément lead, les autres suivent en décalé.
3. **Rapide, jamais bloquant** : une animation n'empêche jamais la saisie ; on peut toujours agir pendant qu'elle joue.
4. **Cohérence de direction** : avancer = vers la gauche, revenir = vers la droite, ouvrir un détail = vers l'avant en profondeur, fermer = inverse.
5. **Sobre sur appareil modeste** : on n'anime que l'opacité et la position/échelle (propriétés peu coûteuses), jamais la taille de mise en page.
6. **Toujours une alternative** pour « réduire les animations ».

### Jetons de mouvement

| Jeton | Valeur | Usage |
|---|---|---|
| `durée-instantanée` | 80 ms | Retour d'appui, bascule |
| `durée-rapide` | 160 ms | Apparition de petits éléments, survol |
| `durée-base` | 240 ms | Transitions de questions, mise à jour du prix |
| `durée-lente` | 360 ms | Feuilles, grandes entrées |
| `durée-emphase` | 500 ms | Révélation du premier résultat (une fois) |
| `courbe-entrée` | décélération douce | Éléments qui arrivent |
| `courbe-sortie` | accélération douce | Éléments qui partent |
| `courbe-standard` | accélération puis décélération | Déplacements |
| `décalage` | 30 – 50 ms par élément, **max. 6** éléments | Cascades |

Valeurs de départ, à ajuster en test sur appareil.

## 6. Chorégraphies

| Transition | Séquence | Durée totale |
|---|---|---|
| **Question suivante** (compacte) | Question actuelle : glisse à gauche 24 px + fondu sortant (160 ms). Nouvelle : arrive de droite 24 px + fondu (240 ms), **chevauchement 80 ms**. Indicateur 1/3 → 2/3 progresse en continu. Focus placé sur le champ après l'animation | 320 ms |
| **Question précédente** | Sens inverse | 320 ms |
| **Questions → Résultat (première révélation)** | 1) panneau de questions s'estompe (160 ms) · 2) le **prix apparaît** : chiffre qui « roule » de 0 à la valeur (500 ms, courbe d'entrée) · 3) la **barre de composition** se déploie segment par segment (décalage 40 ms) · 4) le **verdict** monte de 12 px en fondu (240 ms, démarre à 200 ms) · 5) les indicateurs et l'action apparaissent en cascade | ≈ 900 ms, *jouée une seule fois par calcul* |
| **Réglage d'un levier** (marge, frais…) | Le prix **ne roule pas depuis zéro** : il passe de l'ancienne à la nouvelle valeur en 240 ms. Les segments de la barre s'ajustent **en même temps** (une seule horloge). Le chiffre modifié reçoit un **bref halo** (160 ms) ; le verdict ne change qu'après 120 ms de retard, en fondu enchaîné | 240 ms |
| **Verdict qui change de nature** | Icône et texte en fondu enchaîné ; **un message vocal** annonce le changement | 200 ms |
| **Ouvrir/fermer « Pourquoi ce prix »** | Hauteur animée par déploiement progressif (contenu remonte, rien ne saute), 240 ms | 240 ms |
| **Feuille basse (Ajuster, Enregistrer, Partager)** | Monte du bas avec un voile derrière (opacité 0 → 40 %) ; glissement suivi du doigt, accroche aux hauteurs ; ferme par glissement vers le bas ou voile | 360 ms |
| **Liste « Mes prix »** | Apparition en cascade (décalage 40 ms, 6 éléments max, le reste immédiat) ; suppression : l'élément glisse hors de l'écran puis la liste se referme (240 ms) ; **Annuler** le fait revenir à sa place | 240 ms |
| **Enregistrer** | Le bouton se transforme brièvement en coche (160 ms), bandeau de confirmation qui monte | 320 ms |
| **Accueil → Résultat d'un prix enregistré** | **Élément partagé** : la carte du prix s'agrandit vers l'en-tête du résultat ; le prix reste visuellement continu (à évaluer côté technique, sinon fondu + glissement) | 360 ms |
| **Onglets de navigation** | Fondu croisé (160 ms), pas de glissement latéral (pas de hiérarchie) | 160 ms |
| **Onboarding** | Cartes en glissement horizontal suivant le doigt, points de pagination animés ; visuel de chaque carte avec une courte animation d'entrée (≤ 600 ms, sans boucle) | — |
| **Grand écran** | Les saisies ne changent pas de page : **seul le résultat bouge** (mêmes règles que « réglage d'un levier »). Aucune transition de page entre les questions | 240 ms |

## 7. Réduction des animations

Si l'utilisateur demande de réduire les animations (réglage système) :

- plus de glissement, plus de décalage ni de « roulement » du chiffre ;
- **fondu enchaîné de 100 ms** uniquement ;
- les feuilles apparaissent sans glisser ;
- le verdict et les changements de valeur restent **annoncés** (vocal + texte).

Un réglage de l'app « Animations : normales / réduites » permet aussi de le forcer.

## 8. Budget de performance du mouvement

| Règle | Seuil |
|---|---|
| Fréquence d'image visée | 60 i/s, **jamais sous 30** sur l'appareil de référence ralenti |
| Propriétés animées | Opacité et transformations uniquement |
| Animations simultanées | ≤ 6 éléments en mouvement |
| Entrée en jeu | Aucune animation avant que l'écran soit utilisable (**ne retarde pas la saisie**) |
| Surveillance | Mesure dans le POC P2 ; si le budget n'est pas tenu, on retire d'abord le décalage, puis l'élément partagé, puis le « roulement » |
| Poids | Pas de bibliothèque d'animation lourde sans mesure ; préférer les transitions CSS natives |

À vérifier dans [12](12-plan-poc.md) : ajout d'un critère au POC P2 (fluidité de la révélation du résultat à CPU ×4).

## 9. Critères d'acceptation

**RSP-01** — *Given* une fenêtre de 320 px, *Then* aucun défilement horizontal, aucun contenu coupé, toutes les actions atteignables.

**RSP-02** — *Given* une largeur ≥ 1024 px, *When* l'utilisateur saisit un coût, *Then* le résultat à droite se met à jour sans changer de page ni défiler.

**RSP-03** — *Given* une largeur de 600 à 1023 px, *Then* « Mes prix » s'affiche en liste + détail.

**RSP-04** — *Given* une largeur redimensionnée en cours de saisie, *Then* les valeurs saisies et le focus sont conservés.

**RSP-05** — *Given* la navigation au clavier seule, *Then* un calcul complet est réalisable de l'accueil à l'enregistrement.

**MOV-01** — *Given* « réduire les animations », *Then* aucune transition ne déplace d'élément.

**MOV-02** — *Given* un réglage de marge, *Then* prix, barre et indicateurs terminent leur mise à jour ensemble en ≤ 240 ms.

**MOV-03** — *Given* l'animation de révélation, *Then* l'utilisateur peut toucher « Ajuster » ou « Enregistrer » avant sa fin.

**MOV-04** — *Given* un appareil à CPU ralenti ×4, *Then* la révélation du résultat ne descend pas sous 30 i/s.
