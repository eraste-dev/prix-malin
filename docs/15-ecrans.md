# 15 — Spécification des écrans (app publique, lot 1)

Pour chaque écran : **but, contenu, données, actions, états, critères d'acceptation**. Conçu mobile d'abord ; l'adaptation tablette et PC est dans [16](16-responsive-et-mouvement.md), le parcours dans [13](13-parcours-utilisateur.md), l'onboarding dans [14](14-onboarding.md). Les textes sont **provisoires** (fond validé par la comptable, forme par le guide de rédaction).

## Inventaire

| ID | Écran | Type | Exigences liées |
|---|---|---|---|
| E00 | Splash | transitoire | NFR-03 |
| E01 | Accueil | principal | EXG-42 |
| E02 | Q1 — Que vendez-vous ? | question | EXG-01, 02 |
| E03 | Q2 — Ce que ça coûte à chaque vente | question | EXG-10, 14, 15 |
| E04 | Q3 — Charges du mois et ventes | question | EXG-11, 12, 13, 16 |
| E05 | Q4 — Votre prix actuel | question | EXG-26 |
| E06 | **Résultat** | principal | EXG-20 à 25, 27, 30 à 33 |
| E07 | Enregistrer | feuille | EXG-40 |
| E08 | Partager | feuille | EXG-43 |
| E09 | Mes prix | principal | EXG-40, 41 |
| E10 | Mon activité (charges partagées) | principal | EXG-16 |
| E11 | Comprendre | principal | EXG-34 |
| E12 | Aide contextuelle | feuille | EXG-35 |
| E13 | Réglages | principal | EXG-44, 51 |
| E14 | États transverses | — | NFR-09 |

## Modèle de données manipulé

| Entité | Champs principaux | Notes |
|---|---|---|
| **Calcul** | `id`, `type` (revente / fabrication / prestation), `nom?`, `unite`, `coutDirect` {`mode`: total \| détail, `total`, `lignes[]`}, `chargesFixes` {`mode`, `total`, `lignes[]`, `source`: propre \| activité}, `volume`, `marge`, `frais`, `arrondi` {`actif`, `pas`}, `tva` {`actif`, `base`: HT \| TTC}, `concurrent?`, `prixActuel?`, `modeResultat` (conseillé \| monPrix), `creeLe`, `modifieLe`, `schema` | Un calcul brouillon n'a pas de `nom` |
| **Ligne** | `id`, `libelle`, `quantite`, `prixUnitaire` (coût) ou `montant` (charge) | `id` unique (jamais l'index) |
| **PrixEnregistré** | Calcul figé + `prixConseille`, `coutDeRevient`, `taux`, `date` | Identifié par `id`, pas par le nom (défaut F5) |
| **Activité** | `chargesPartagees[]`, `reglesRepartition` | Créée au 2ᵉ produit |
| **Réglages** | `theme`, `onboarding_vu`, `aides_vues`, `schema` | |

Tout est validé à la lecture (NFR-09), versionné (`schema`).

### Défauts par type d'activité (issus du prototype)

| Type | Unité | Marge | Frais | Arrondi (pas) |
|---|---|---|---|---|
| Achat-revente | pièce | 20 % | 1 % | 500 F |
| Je fabrique | unité | 25 % | 1 % | 25 F |
| Prestation | prestation | 30 % | 0 % | 500 F |

Arrondi **activé** par défaut ; TVA désactivée ; HT.

---

## E00 — Splash
Logo seul, ≤ 1 s, jamais d'écran blanc. Charge réglages et brouillon. En cas d'erreur de lecture : E14.

## E01 — Accueil

| | |
|---|---|
| **But** | Mener à un calcul en un tap, retrouver son travail |
| **Contenu** | (1) Carte **Reprendre** si brouillon : nom, étape, « Reprendre » · (2) Bouton principal **Calculer un prix** · (3) Bouton secondaire **Tester mon prix actuel** · (4) **Mes derniers prix** (3 max, nom, prix, pastille de verdict) · (5) **Le conseil du moment** (un extrait de « Comprendre », rotatif) |
| **Données lues** | brouillon, 3 derniers PrixEnregistré, contenu pédagogique |
| **Actions** | Calculer → E02 · Tester → E02 (variante, ajoute E05) · Reprendre → étape du brouillon · Ouvrir un prix → E06 · Conseil → E11 |
| **États** | Vide (aucun prix) : bloc « Mes derniers prix » remplacé par une invitation illustrée · Brouillon périmé (> 30 jours) : proposé à l'effacement |
| **Navigation** | Barre inférieure (mobile) : Accueil · Mes prix · Comprendre · Réglages |

**Critères.** ACC-01 : *Given* un brouillon, *Then* « Reprendre » est le premier élément, au-dessus de « Calculer ». ACC-02 : *Given* aucun prix, *Then* aucun bloc vide ou cassé, une invitation à calculer.

## E02 — Q1 « Que vendez-vous ? »

| | |
|---|---|
| **But** | Choisir le type d'activité, nommer (facultatif) |
| **Contenu** | Titre · 3 grandes pastilles (Achat-revente · Je fabrique · Prestation) avec une ligne d'exemple chacune · Champ **Nom** (facultatif, « Ex. Jus de bissap ») · Unité proposée (« par bouteille ») modifiable en un tap |
| **Données** | écrit `type`, `nom?`, `unite`, applique les défauts |
| **Actions** | Choisir une pastille → active **Suivant** (pré-sélection du dernier type) · Suivant → E03 · Fermer → Accueil (brouillon gardé) |
| **Règles** | Aucun texte obligatoire. Changer de type **sur un calcul modifié** → confirmation (EXG-03), sinon silencieux |
| **Aide** | « ? » → E12 (« Pourquoi le type d'activité compte ») |

**Critères.** Q1-01 : *Then* « Suivant » est actif dès qu'un type est choisi, sans autre saisie. Q1-02 : *Given* un calcul déjà modifié, *When* il change de type, *Then* une confirmation est demandée.

## E03 — Q2 « Ce que ça vous coûte à chaque vente »

| | |
|---|---|
| **But** | Obtenir le coût direct par unité, en un nombre ou en détail |
| **Contenu** | Phrase d'aide : « Comptez tout ce que vous dépensez pour **une** vente. » · Interrupteur **Total / Détail** · **Total** : un champ numérique « F » · **Détail** : lignes (libellé, quantité, prix) avec total de ligne, total cumulé en pied · **Pastilles de suggestion** selon le type (+ Transport, + Emballage, + Pertes…) qui ajoutent une ligne pré-nommée · Exemple concret du type en repli |
| **Données** | écrit `coutDirect` ; lit suggestions (contenu) |
| **Actions** | Saisir · Basculer Total ↔ Détail (le total est conservé comme ligne unique, sans perte) · Suivant → E04 · Retour → E02 |
| **Règles** | Montants ≥ 0, quantités décimales admises, séparateur de milliers en direct, clavier numérique. Coût nul → « Suivant » désactivé avec raison affichée (RG-02) |
| **Aide** | « ? » → E12 (« Coût direct ») |

**Critères.** Q2-01 : *Given* un total saisi, *Then* « Suivant » s'active et le total est utilisé comme une ligne. Q2-02 : *Given* Total → Détail, *Then* la valeur apparaît comme première ligne. Q2-03 : *Given* une pastille, *Then* une ligne est ajoutée et le focus va sur son montant.

## E04 — Q3 « Vos charges du mois et vos ventes »

| | |
|---|---|
| **But** | Charges fixes mensuelles + volume mensuel |
| **Contenu** | **Charges du mois** : interrupteur Total / Détail · **Détail** = liste de **pastilles cochables** (Loyer · Électricité · Eau · Téléphone · Transport · Aide/salarié · **Ma rémunération** mise en avant), chaque pastille cochée ouvre un champ montant · Total cumulé · **Ventes par mois** : champ numérique + « soyez réaliste » · Résultat intermédiaire discret : « Part de charges par vente : 110 F » · Bouton **Voir mon prix** |
| **Données** | écrit `chargesFixes`, `volume` ; lit Activité si elle existe (« Utiliser mes charges partagées ») |
| **Actions** | Cocher · saisir · Voir mon prix → E06 (ou E05 en mode test) · Retour → E03 |
| **Règles** | Volume entier ≥ 1, sinon pas de prix (RG-08), message « Combien en vendez-vous par mois ? ». **Rappel rémunération** une fois par calcul si absente (non bloquant). Si Activité existe : choix « Mes charges partagées / Charges propres » |
| **Aide** | « ? » → E12 (« Charges fixes », « Votre salaire est une charge ») |

**Critères.** Q3-01 : *Given* volume vide ou 0, *Then* « Voir mon prix » est désactivé avec la raison. Q3-02 : *Given* aucune pastille « Ma rémunération » cochée et un total saisi, *When* il valide, *Then* un rappel s'affiche une fois, avec action « L'ajouter » et « Continuer ». Q3-03 : *Given* Détail, *Then* la part par vente se met à jour en direct.

## E05 — Q4 « À quel prix vendez-vous ? » (mode Tester mon prix)

Un seul champ « Votre prix actuel (F) » + choix **HT / TTC** si la TVA est active. Même mécanique qu'E03. Suivant → E06 en mode **Mon prix**. *Non affiché dans la trajectoire « Calculer ».*

## E06 — Résultat (écran central)

| | |
|---|---|
| **But** | Donner le prix, le **pourquoi**, le verdict, et laisser ajuster en regardant |
| **Contenu (de haut en bas, mobile)** | (1) En-tête : nom, unité, bascule **Prix conseillé ⇄ Mon prix** · (2) **Prix** en très grand + « F CFA » (+ HT/TTC si TVA) · (3) **Verdict** : icône + titre + une phrase (jamais la couleur seule) · (4) **Barre de composition** : coût direct · charges fixes · frais · marge (· TVA) · (5) **Pourquoi ce prix ?** (repliable) : lignes chiffrées, coût de revient, marge réelle, formule en clair · (6) **Ajuster** : voir ci-dessous · (7) **Indicateurs** : ventes minimum/mois, bénéfice estimé/mois (+ coefficient, taux de marge dans « plus de détails ») · (8) Barre d'actions fixe : **Enregistrer** · **Partager** |
| **Ajuster** (niveau 2) | Marge : pastilles 10 · 20 · 30 · 40 % + curseur · Frais de paiement : **Espèces 0 %**, **Mobile Money 1 %**, **Autre…** · Arrondi : interrupteur + pas · TVA : interrupteur + **HT / TTC** · Prix du concurrent (facultatif, base HT/TTC suivant le commutateur) |
| **Données** | lit/écrit le Calcul ; calculs par le moteur (RG-01 à RG-10) |
| **Actions** | Modifier un levier → recalcul < 100 ms · Basculer Conseillé ⇄ Mon prix · Enregistrer → E07 · Partager → E08 · Retour → Q3 (valeurs conservées) · Tap sur un chiffre → E12 (définition) |
| **Mode Mon prix** | Saisie du prix ; verdict selon RG-09 (perte à chaque vente / charges non couvertes / bénéfice) ; comparaison au prix conseillé |
| **États** | Calcul impossible (marge + frais trop hauts, coût nul) → message clair à la place du prix (EXG-27) ; volume nul → retour guidé vers Q3 ; concurrent sous le coût → verdict d'information |
| **Sur grand écran** | Le résultat est **toujours visible** à côté des saisies (voir 16) |

**Critères.** RES-01 : *Given* coût 210 F, charges 220 000 F, volume 2 000, activité fabrication, *Then* prix **450 F**, coût de revient **320 F** (vecteur de [03](03-regles-metier.md)). RES-02 : *Given* un levier modifié, *Then* prix, barre et indicateurs se mettent à jour ensemble en < 100 ms. RES-03 : *Given* TVA en mode TTC, *Then* le prix affiché est le TTC arrondi. RES-04 : *Given* un verdict, *Then* il est compréhensible sans couleur (icône + texte). RES-05 : *Given* Retour vers Q3, *Then* aucune saisie n'est perdue.

## E07 — Enregistrer (feuille)

Champ **Nom** prérempli (suggestion : type + unité, éditable), bouton **Enregistrer**. Si le calcul est déjà enregistré : « Mettre à jour » (principal) ou « Enregistrer une copie ». Confirmation discrète (snackbar « Enregistré · Voir »). Deux prix de même nom sont acceptés (identifiant unique, défaut F5).

## E08 — Partager (feuille)

Aperçu du résumé texte (nom, prix, coût de revient, marge, ventes minimum, mention « Calculé avec Prix Malin »), bouton **Partager** (feuille native, WhatsApp en tête) et **Copier**. Repli sur copie si le partage natif est indisponible. Aucune donnée n'est envoyée par l'app elle-même.

## E09 — Mes prix

| | |
|---|---|
| **But** | Retrouver, rouvrir, comparer, dupliquer, supprimer |
| **Contenu** | Liste : nom, prix, pastille marge + icône de verdict, date, type. Tri par défaut : plus récent. Recherche dès 6 éléments. Boutons : **Nouveau calcul** |
| **Actions** | Ouvrir → E06 · Dupliquer · Supprimer · glissement latéral ou menu « ⋯ » (même actions) |
| **Suppression** | Immédiate avec **bandeau Annuler (6 s)** : pas de modale bloquante. Définitive à l'expiration |
| **États** | Vide : illustration + « Calculer mon premier prix » · Un seul prix : texte d'encouragement |

**Critères.** MP-01 : *Given* suppression, *When* il touche Annuler < 6 s, *Then* l'élément revient à sa place. MP-02 : *Given* deux produits de même nom, *Then* deux lignes distinctes.

## E10 — Mon activité (charges partagées)

Créée automatiquement dès le **2ᵉ produit** : « Vous avez plusieurs produits. Voulez-vous saisir vos charges **une seule fois** ? » Écran : liste des charges du mois (pastilles), total, **répartition par produit** (par défaut au prorata des ventes mensuelles, modifiable en % par produit), bouton **Appliquer**. Chaque produit enregistré indique « Charges partagées ». Règle de répartition à confirmer (Q-27).

## E11 — Comprendre

Liste de cartes : 6 concepts (coût direct, charges fixes, coût de revient, marge, prix, seuil), « À compter / ne pas compter », « Les 5 erreurs qui font fermer ». Chaque carte ouvre une page courte avec **exemple chiffré** tiré de l'activité de l'utilisateur quand c'est possible. Lecture hors ligne. Contenu servi par les données versionnées ([ADR-0005](adr/0005-contenu-donnee-versionnee.md)).

## E12 — Aide contextuelle (feuille)

Définition courte d'un terme ou d'un chiffre (3 à 5 lignes) + « En savoir plus » vers E11. Ouverte par « ? » ou par tap sur un chiffre du résultat. Ne déplace pas la mise en page, ne bloque pas la saisie.

## E13 — Réglages

Thème (système / clair / sombre) · Revoir la présentation · Réinitialiser les aides · **Sauvegarde** : exporter / importer un fichier (EXG-44) · Confidentialité (« Tout reste sur votre téléphone ») · À propos, version, version du contenu · **Effacer toutes mes données** (confirmation renforcée : saisir un mot ou maintenir appuyé).

## E14 — États transverses

| État | Comportement |
|---|---|
| Stockage corrompu | Démarre sur un calcul vierge, propose « Récupérer ce qui est lisible » (NFR-09) |
| Validation | Message **sous le champ**, texte + icône, jamais seulement rouge ; focus sur le premier champ en erreur |
| Mise à jour disponible | Bandeau discret « Nouvelle version · Mettre à jour », jamais pendant la saisie |
| Hors ligne | Aucun message (normal) ; au lot 2 uniquement pour les fonctions serveur |
| Action destructive | Annulation prioritaire sur confirmation ; confirmation renforcée seulement si irréversible |
| Chargement | Squelette de mise en page, jamais de rotation seule |
| Erreur inattendue | Écran de secours : « Quelque chose s'est mal passé », bouton « Revenir à l'accueil », données intactes |
