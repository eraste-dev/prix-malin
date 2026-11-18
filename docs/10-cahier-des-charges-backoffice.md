# 10 — Cahier des charges du back-office

Convention : `BO-xx` pour les exigences, priorité MoSCoW. La tranche indique quand l'exigence est **construite** (voir [09](09-vision-systeme.md)) ; toutes sont **conçues** dès maintenant.

## B0 — Contenu et configuration (livraison 1)

| ID | Exigence | Prio |
|---|---|---|
| BO-01 | Authentification des utilisateurs du back-office, avec rôles (rédacteur, relecteur, administrateur). | M |
| BO-02 | Édition du **contenu pédagogique** : concepts (coût direct, charges fixes…), pièges, erreurs fréquentes, « à compter / ne pas compter ». | M |
| BO-03 | Gestion des **exemples par type d'activité** : produit, unité, lignes de coût, charges fixes, volume, marge, frais, concurrent. | M |
| BO-04 | Gestion des **suggestions de lignes de coût** par activité (EXG-15). | S |
| BO-05 | Gestion des **paramètres** : taux de TVA, bornes marge/frais, pas d'arrondi, valeurs par défaut. Chaque paramètre est typé et validé. | M |
| BO-06 | **Cycle de vie** : brouillon → à relire → publié → archivé. Un contenu publié n'est jamais modifié, on en crée une nouvelle version. | M |
| BO-07 | **Relecture obligatoire** par un rôle différent de l'auteur avant publication (la comptable valide le fond). | M |
| BO-08 | **Historique** et possibilité de **restaurer** une version antérieure. | M |
| BO-09 | **Prévisualisation** du rendu dans l'app avant publication. | S |
| BO-10 | Publication vers l'API de contenu ; l'app récupère la dernière version publiée, avec **repli** sur la version embarquée. | M |
| BO-11 | Journal d'audit : qui a modifié, relu, publié quoi et quand. | M |
| BO-12 | Contenus **multilingues** prévus dans le modèle (une seule langue active : français). | S |
| BO-13 | Chaque contenu porte des **métadonnées de référencement** : adresse (slug) stable, titre, description, image, date de publication, mise à jour. | M |
| BO-14 | Un contenu est publiable vers une ou plusieurs **cibles** : app, site public. La relecture couvre toutes les cibles. | M |
| BO-15 | Changement d'adresse d'un contenu publié : **redirection** conservée, jamais de lien cassé. | S |

## B1 — Supervision et support

| ID | Exigence | Prio |
|---|---|---|
| BO-20 | Réception de **rapports d'erreur anonymes** émis par l'app (avec consentement), regroupés par type et version d'app. | M |
| BO-21 | Tableau d'état du service (disponibilité, latence, erreurs de l'API). | S |
| BO-22 | Formulaire de **signalement** dans l'app (message libre, version, plateforme) et file de traitement dans le back-office. | S |
| BO-23 | Marquage des signalements : nouveau, en cours, résolu ; réponse éventuelle. | C |

## B2 — Statistiques d'usage

| ID | Exigence | Prio |
|---|---|---|
| BO-30 | **Événements d'usage anonymes** définis par un catalogue fermé (écran vu, calcul lancé, prix enregistré, partage…). Aucune valeur saisie (montants, noms de produits) n'est transmise. | M |
| BO-31 | Tableaux de bord **agrégés** : utilisateurs actifs, parcours, taux d'abandon par étape, fonctions les plus utilisées, répartition par version et plateforme. | M |
| BO-32 | Consentement **explicite et révocable** dans l'app ; aucun événement envoyé sans lui. | M |
| BO-33 | Durée de conservation limitée et suppression automatique des événements bruts. | M |
| BO-34 | Export des statistiques agrégées (CSV). | C |

## B3 — Comptes, offres, quotas

| ID | Exigence | Prio |
|---|---|---|
| BO-40 | Gestion des **offres** (gratuite, payantes), de leurs **limites** (nombre de prix enregistrés, synchronisation, exports…) et de leur durée. | M |
| BO-41 | Gestion des **comptes utilisateurs** : consultation, suspension, suppression à la demande (droit à l'effacement). | M |
| BO-42 | Attribution d'une offre à un utilisateur, avec historique. | M |
| BO-43 | Vérification des **droits côté serveur** ; l'app interroge un point unique et met le résultat en cache. | M |
| BO-44 | Intégration du **paiement** conforme aux règles des stores pour les achats dans l'app. | M |
| BO-45 | Synchronisation des prix enregistrés entre appareils (stockage serveur). | S |
| BO-46 | Codes promotionnels, offres d'essai. | C |

## Exigences non fonctionnelles du back-office

| ID | Exigence |
|---|---|
| BO-NFR-01 | **Authentification forte** (second facteur) pour tout compte du back-office. |
| BO-NFR-02 | Contrôle d'accès par rôle appliqué **côté serveur**, jamais seulement dans l'interface. |
| BO-NFR-03 | Toute saisie est validée et échappée ; le contenu publié est assaini avant d'être rendu dans l'app (aucun HTML ni script exécutable). |
| BO-NFR-04 | Aucune donnée personnelle dans les journaux applicatifs. |
| BO-NFR-05 | Limitation de débit et protection contre les abus sur toute l'API publique. |
| BO-NFR-06 | Interface accessible (WCAG 2.2 AA), utilisable sur ordinateur, lisible sur tablette. |
| BO-NFR-07 | Les rôles et permissions sont testés automatiquement (un rédacteur ne peut pas publier, un relecteur ne peut pas relire son propre contenu). |

## Critères d'acceptation (échantillon)

**BO-07 — Séparation des rôles**
- *Given* un contenu rédigé par A
  *When* A tente de le publier lui-même
  *Then* l'action est refusée ; seul un relecteur différent peut le faire passer à « publié ».

**BO-10 — Repli hors ligne**
- *Given* une app qui n'a jamais joint le serveur
  *When* elle affiche la section « Comprendre »
  *Then* elle utilise le contenu embarqué, sans erreur ni écran vide.

**BO-10 — Contenu invalide**
- *Given* un contenu publié dont la version de schéma est inconnue de l'app
  *When* l'app le récupère
  *Then* elle l'ignore et garde le dernier contenu valide.

**BO-30 — Pas de fuite**
- *Given* l'utilisateur a accepté les statistiques
  *When* il enregistre un prix
  *Then* l'événement transmis ne contient ni nom de produit ni montant.
