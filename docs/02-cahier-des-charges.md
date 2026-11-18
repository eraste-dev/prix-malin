# 02 — Cahier des charges

Convention : chaque exigence a un ID stable (`EXG-xx` fonctionnelle, `NFR-xx` non fonctionnelle). Les tests y font référence. Priorité MoSCoW : **M**ust, **S**hould, **C**ould, **W**on't (pas pour le MVP). Détail du périmètre dans [04-mvp.md](04-mvp.md).

## 1. Exigences fonctionnelles

### A. Saisie du contexte produit

| ID | Exigence | Prio |
|---|---|---|
| EXG-01 | L'utilisateur choisit un **type d'activité** : achat-revente, fabrication, prestation. Le type adapte les libellés, exemples et conseils. | M |
| EXG-02 | L'utilisateur nomme son produit/service et son **unité de vente** (pièce, plat, heure…). | M |
| EXG-03 | Changer de type d'activité sur un calcul déjà saisi demande **confirmation** et ne détruit jamais les données sans accord. | M |
| EXG-04 | Un **exemple prérempli** est proposé par type pour démarrer, clairement identifié comme exemple et effaçable en un geste. | S |

### B. Coûts

| ID | Exigence | Prio |
|---|---|---|
| EXG-10 | Saisie de **coûts directs par unité** : libellé, quantité, prix unitaire, total de ligne calculé. Ajout, modification, suppression. | M |
| EXG-11 | Saisie de **charges fixes mensuelles** : libellé, montant. Ajout, modification, suppression. | M |
| EXG-12 | Saisie du **volume mensuel** vendu estimé. | M |
| EXG-13 | Si le volume est vide ou nul, aucun prix n'est présenté comme fiable : l'outil demande le volume (voir RG-08). | M |
| EXG-14 | Rappels pédagogiques contextuels : rémunération de l'exploitant, pertes, transport, usure du matériel. | M |
| EXG-15 | Suggestions de lignes de coût fréquentes selon le type d'activité (ajout en un geste). | S |
| EXG-16 | Les **charges fixes peuvent être partagées** entre plusieurs produits (profil d'activité) plutôt que ressaisies par produit (répartition simple par part de volume). | M |

### C. Calcul du prix

| ID | Exigence | Prio |
|---|---|---|
| EXG-20 | Calcul du **prix conseillé** à partir du coût de revient, de la marge souhaitée (sur prix de vente) et des frais de paiement. | M |
| EXG-21 | Choix de la **marge souhaitée** (0–70 %). | M |
| EXG-22 | Saisie des **frais de paiement** (%) : Mobile Money, carte, plateforme de livraison. | M |
| EXG-23 | **Arrondi activable/désactivable** (interrupteur). Activé : choix du pas (5, 25, 50, 100, 500 F), toujours vers le haut. Désactivé : prix au franc. | M |
| EXG-24 | Option **TVA 18 %** (désactivée par défaut) avec **commutateur HT / TTC** désignant le prix de référence (arrondi, concurrent, résumé). La TVA n'est jamais comptée comme coût ni comme marge. | M |
| EXG-25 | Le résultat se met à jour **en direct** à chaque modification. | M |
| EXG-26 | Mode inverse : l'utilisateur saisit **son prix actuel** et obtient sa marge réelle, son verdict et son seuil. | M |
| EXG-27 | Les paramètres inutilisables (marge + frais ≥ 95 %, coût nul) produisent un message explicite, jamais un prix absurde. | M |

### D. Résultat et pédagogie

| ID | Exigence | Prio |
|---|---|---|
| EXG-30 | Présentation du résultat : prix, **décomposition** (coût direct, part charges fixes, frais de paiement, marge, TVA), coût de revient, marge réelle. | M |
| EXG-31 | **Verdict** en langage simple (prix perdant, charges non couvertes, bien placé, trop cher/bon marché vs concurrent). | M |
| EXG-32 | Indicateurs : **seuil de rentabilité** (ventes min/mois), **bénéfice mensuel estimé**, coefficient multiplicateur, taux de marge sur coût. | M |
| EXG-33 | Comparaison avec le **prix d'un concurrent** (optionnel) et simulation : marge si l'on s'aligne. | M |
| EXG-34 | Section « Comprendre » : définitions (coût direct, charges fixes, coût de revient, marge, seuil), ce qui compte ou non, erreurs fréquentes. | M |
| EXG-35 | Chaque indicateur affiche une **explication courte** au toucher (« pourquoi ce chiffre ? »). | S |
| EXG-36 | Analyse de sensibilité : « et si le sucre augmente de 10 % ? ». | C |

### E. Sauvegarde et partage

| ID | Exigence | Prio |
|---|---|---|
| EXG-40 | **Enregistrer** un calcul dans « Mes prix » (identifiant unique par produit, pas par nom). | M |
| EXG-41 | Lister, ouvrir, modifier, **dupliquer**, supprimer un prix enregistré. La suppression est **annulable pendant 6 s** (remplace la confirmation modale, voir Q-29). | M |
| EXG-42 | Brouillon en cours **conservé automatiquement** en cas de fermeture de l'app. | M |
| EXG-43 | **Partager un résumé** texte (WhatsApp en priorité) via la feuille de partage native, avec repli sur copie. | M |
| EXG-44 | **Export/import de sauvegarde** (fichier) pour ne pas perdre ses données en changeant de téléphone. Non obligatoire au MVP (stockage local sur l'appareil), mais recommandé. | S |
| EXG-45 | Historique des révisions d'un prix (« le sucre a augmenté, nouveau prix »), rappel de revoir ses prix. | C |
| EXG-46 | Export PDF/image d'une fiche prix. | C |

### F. Transverses

| ID | Exigence | Prio |
|---|---|---|
| EXG-50 | Interface en **français** ; tous les textes externalisés (prêt pour d'autres langues). | M |
| EXG-51 | Thème clair/sombre suivant le système, avec bascule manuelle. | S |
| EXG-52 | Premier lancement : courte **prise en main** (3 écrans max, passable). | S |
| EXG-60 | **Parcours express** : un premier prix avec 3 nombres (coût par vente, charges du mois, volume) ; valeurs par défaut par activité ; aucun texte obligatoire. Voir [13](13-parcours-utilisateur.md). | M |
| EXG-61 | **Total ou détail** pour les coûts directs et les charges fixes ; basculement sans perte de données. | M |
| EXG-62 | Charges fixes fréquentes proposées en **pastilles cochables**, dont « Ma rémunération » mise en avant avec rappel non bloquant. | M |
| EXG-63 | **Onboarding** ≤ 3 cartes, passable, rejouable, suivi d'un exemple guidé étiqueté et non enregistré. Voir [14](14-onboarding.md). | M |
| EXG-64 | **Disposition adaptée** à trois classes d'écran (compacte, moyenne, étendue) : une question à la fois sur mobile, tout visible avec résultat permanent sur grand écran. Voir [16](16-responsive-et-mouvement.md). | M |
| EXG-65 | **Mouvement coordonné** (jetons de durée et de courbe, chorégraphies définies) avec alternative « animations réduites » respectant le réglage système. | M |
| EXG-66 | Navigation et saisie complètes **au clavier**, raccourcis documentés. | S |
| EXG-53 | Comptes, synchronisation multi-appareils, stockage serveur. | W (V2) |
| EXG-54 | Multi-devises, multi-pays, plusieurs taux de TVA, régimes fiscaux particuliers (simplifié, TSE). | W |
| EXG-55 | Paiement, abonnement, **limites d'utilisation** liées à une offre tarifaire. | W (V2) |
| EXG-56 | Back-office d'administration : statistiques d'usage, gestion des offres et quotas. | W (V2) |
| EXG-57 | Contenu pédagogique géré comme **donnée versionnée et validée** (relecture comptable), séparé du code. | S |

## 2. Exigences non fonctionnelles

| ID | Catégorie | Exigence |
|---|---|---|
| NFR-01 | Plateformes | Une base de code unique livrée en **web (PWA installable), Android, iOS**. |
| NFR-02 | Hors ligne | Toutes les fonctions M/S marchent sans réseau après le premier chargement. |
| NFR-03 | Performance | Résultat recalculé < 100 ms. Premier affichage utile < 3 s sur Android d'entrée de gamme en 3G. |
| NFR-04 | Poids | Téléchargement initial web < 500 Ko compressé (cible), pas de police externe bloquante. |
| NFR-05 | Compatibilité | Android 8+, iOS 15+, navigateurs récents (Chrome, Safari, Firefox, Samsung Internet). Écrans 320 px et plus. |
| NFR-06 | Accessibilité | WCAG 2.2 AA : contraste, cibles tactiles ≥ 44 px, navigation clavier, lecteurs d'écran, `prefers-reduced-motion`. |
| NFR-07 | Lisibilité | Texte courant ≥ 16 px, vocabulaire simple, pas de jargon non expliqué. |
| NFR-08 | Fiabilité numérique | Calculs en **entiers (F CFA, sans décimale)** ou arithmétique exacte, jamais de dérive flottante visible. Mêmes résultats sur toutes les plateformes. |
| NFR-09 | Intégrité des données | Toute donnée relue du stockage est **validée** (schéma + version). Un stockage corrompu ne fait jamais planter l'app. Migrations de schéma versionnées. |
| NFR-10 | Confidentialité | Aucune donnée de coût ne quitte l'appareil au MVP. Aucun traceur tiers. Politique de confidentialité courte et honnête (exigée par les stores). |
| NFR-11 | Sécurité | Aucune injection possible via les champs libres (échappement systématique). Pas de secret embarqué. Dépendances auditées. |
| NFR-12 | Testabilité | Le **moteur de calcul est une bibliothèque pure**, sans dépendance UI, testée à 100 % sur les règles métier. Couverture globale ≥ 80 %. |
| NFR-13 | Maintenabilité | Moteur métier, UI et stockage séparés. Fichiers < 800 lignes, fonctions < 50 lignes. |
| NFR-14 | Conformité stores | Respect des règles Apple App Store et Google Play (voir [06](06-criteres-stack.md)). |
| NFR-15 | Observabilité | Journalisation d'erreurs anonyme et optionnelle (consentement), à décider. |

## 3. Critères d'acceptation (échantillon représentatif)

Format Given/When/Then, destinés à devenir des tests. Les valeurs chiffrées viennent de [03-regles-metier.md](03-regles-metier.md).

**EXG-20 / EXG-23 — Prix conseillé**
- *Given* coût direct 210 F, charges fixes 220 000 F/mois, volume 2 000, marge 25 %, frais 1 %, arrondi 25 F
  *When* le prix est calculé
  *Then* le prix conseillé est **450 F** et le coût de revient affiché est **320 F**.

**EXG-13 — Volume manquant**
- *Given* un volume à 0 ou vide
  *When* l'utilisateur consulte le résultat
  *Then* aucun prix n'est présenté comme conseillé, et un message demande le volume mensuel.

**EXG-27 — Paramètres impossibles**
- *Given* marge 70 % et frais 30 %
  *When* le prix est calculé
  *Then* un message explique que marge et frais sont trop élevés, et aucun prix n'est affiché.

**EXG-24 — TVA, mode HT**
- *Given* un prix HT arrondi à 450 F et la TVA activée en mode HT
  *When* le résultat s'affiche
  *Then* le TTC est 531 F, la TVA 81 F est identifiée comme reversée à l'État, et la marge reste calculée sur le HT.

**EXG-24 — TVA, mode TTC**
- *Given* un prix HT brut de 432,43 F, la TVA activée en mode TTC, arrondi 25 F
  *When* le résultat s'affiche
  *Then* le prix TTC est 525 F (rond), le HT déduit est 444,92 F et la marge est ≥ à la marge visée.

**EXG-23 — Arrondi désactivé**
- *Given* l'arrondi désactivé et un prix brut de 432,43 F
  *Then* le prix est 432 F.

**EXG-03 — Changement de type**
- *Given* un calcul modifié par l'utilisateur
  *When* il choisit un autre type d'activité
  *Then* une confirmation est demandée ; en cas de refus, rien ne change.

**EXG-40/41 — Mes prix**
- *Given* deux produits distincts portant le même nom
  *When* l'utilisateur enregistre les deux
  *Then* deux entrées existent (aucun écrasement silencieux).

**NFR-09 — Stockage corrompu**
- *Given* un stockage local contenant du JSON invalide ou un type d'activité inconnu
  *When* l'app démarre
  *Then* elle démarre sur un calcul vierge et propose de récupérer ce qui est lisible, sans erreur bloquante.

**NFR-02 — Hors ligne**
- *Given* l'app installée puis le réseau coupé
  *When* l'utilisateur calcule et enregistre un prix
  *Then* tout fonctionne et les données persistent après relance.
