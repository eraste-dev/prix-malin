# 08 — Questions et décisions

Mise à jour 2026-11-18. Les réponses sont reportées dans les documents concernés.

## Décisions prises

| ID | Sujet | Décision | Reporté dans |
|---|---|---|---|
| Q-01 | Utilisateur type | Recommandation retenue : entretiens terrain avant de figer l'UX | [04](04-mvp.md) |
| Q-02 | Vente par lot/poids | Conversion de conditionnement en V1.1 | [04](04-mvp.md) |
| Q-03 | Mode « tester mon prix actuel » | **Inclus au MVP** (EXG-26 en Must) | [02](02-cahier-des-charges.md) |
| Q-04 | Charges fixes partagées | **Incluses au MVP**, version simple (EXG-16 en Must) | [02](02-cahier-des-charges.md) |
| Q-05 | Arrondi | **Interrupteur activé/désactivé**, pas configurable quand activé | EXG-23, RG-03 |
| Q-06 | Prix concurrent HT ou TTC | Suit le **commutateur HT/TTC** global | EXG-24, RG-06, RG-10 |
| Q-08 | Plafonds de marge (70 %) et de frais (20 %) | Validés | RG-02, RG-12 |
| Q-09 | TVA / régimes | **Optionnels** : TVA 18 % seule, désactivée par défaut ; régimes particuliers hors MVP | EXG-24, EXG-54 |
| Q-10 | Compte développeur, budget | Hors sujet pour l'instant | — |
| Q-11 | Propriété du code | **Remplacée par Q-16** : l'app est le projet de la porteuse ; le statut du développeur reste à préciser | README |
| Q-12 | Distribution | **PWA web et stores** | [04](04-mvp.md) |
| Q-13 | Statistiques d'usage | **V2** : back-office, tarification avec limites d'utilisation | EXG-55/56, [04](04-mvp.md) |
| Q-14 | Sauvegarde | **Local sur l'appareil** au MVP, serveur en V2. Export/import reste recommandé (Should) | EXG-44 |
| Q-15 | Validation du contenu | La porteuse du projet (comptable) | EXG-57 |

## Décidées d'après le prototype (2026-11-18)

| ID | Sujet | Décision | Source |
|---|---|---|---|
| Q-07 | Assiette des frais de paiement | Calculés sur le **prix HT** (`frais = P × f`), TVA exclue. Simplification assumée ; revoir seulement si la comptable le demande. | Prototype, fonction `compute` |
| Q-17 | Coûts HT ou TTC | Coûts saisis **tels que payés** ; la TVA ne s'applique qu'au prix de vente et n'est jamais un coût. | Prototype + texte « Comprendre » |
| Q-18 | Arrondi par défaut | **Activé** par défaut, pas dépendant de l'activité : revente 500 F, fabrication 25 F, prestation 500 F. Pas disponibles : 5, 25, 50, 100, 500 F. | Prototype, presets |
| Q-22 | Hébergement et budget | Pris en charge par le développeur, hors périmètre documentaire. ADR-0009 sera rédigée à ce moment. | 2026-11-18 |
| Q-23 | Utilisateurs du back-office | **Utilisateurs désignés** (ensemble fermé, par invitation, pas d'inscription libre). | BO-01 |
| Q-25 | Site public indexé | **Oui** : site distinct de l'app (accueil, articles pédagogiques, calculateur d'entrée), alimenté par le même contenu que le back-office. Stack et date : voir [09 §7](09-vision-systeme.md). | 2026-11-18 |
| Q-24 | Calendrier | **Aucune date cible** : on privilégie la qualité. Le découpage en lots se fait par dépendances, pas par échéances. | 2026-11-18 |

## Questions encore ouvertes

| ID | Question | Pourquoi ça compte | Ma recommandation |
|---|---|---|---|
| Q-21 | **Contrat de travail du développeur** : clauses de propriété intellectuelle, d'exclusivité, de non-concurrence. Le développeur et la porteuse du projet travaillent dans la même société. | Un projet mené hors société peut tout de même être revendiqué par l'employeur selon le contrat et la loi applicable. | Relire le contrat, travailler hors temps et matériel de la société, ne réutiliser aucun code de la société, obtenir si besoin une confirmation écrite. |
| Q-16 | **Statut du développeur et propriété du projet.** L'app est celle de la porteuse du projet (prototype créé avec une IA, devenu limitant) ; le développeur la construit pour elle. Qui possède le code, le nom et le contenu ? Le développeur est-il bénévole, prestataire payé ou associé ? Qui touche quoi si la V2 devient payante ? | Sans accord écrit, risque de désaccord au lancement, à la monétisation, ou si l'un des deux arrête. La propriété des contenus générés par IA est de plus floue selon les pays. | Une demi-page écrite et signée par les deux : statut du développeur, propriété du code/nom/contenu, partage éventuel des revenus, qui reprend le projet en cas d'arrêt. Non bloquant pour le travail en cours. |
| Q-17 | Les coûts saisis sont-ils **HT ou TTC** (prix d'achat auprès d'un fournisseur assujetti : TVA récupérable ou non) ? | Pour une entreprise assujettie, la TVA payée sur les achats n'est pas un coût. Pour un informel, elle l'est. | Saisie des coûts « tels que payés » par défaut ; question à poser à la comptable pour le cas assujetti. |
| Q-26 | **iOS** : as-tu un iPhone de test et un compte développeur Apple (ou prévois-tu de les obtenir) ? Sinon, publication iOS reportée. | P5 et la publication sur l'App Store en dépendent. | Démarrer P5 tôt pour lever le doute. |
| Q-27 | **Répartition des charges partagées** entre produits : au prorata des ventes mensuelles (simple, proposé), au prorata du chiffre d'affaires, ou % manuel ? | Un prorata en unités fait supporter autant de charges à un produit bon marché qu'à un produit cher, ce qui fausse le prix. | Défaut au prorata des unités, avec % modifiable par produit. À valider par la comptable. |
| Q-28 | Le **rappel de rémunération** (Q3) doit-il rester non bloquant ? | C'est le piège n°1 du prototype ; mais bloquer ferait fuir. | Non bloquant, une fois par calcul, avec ajout en un tap. |
| Q-29 | Suppression d'un prix : **annulation 6 s** (proposée) au lieu de la confirmation prévue en EXG-41 ? | Moins de friction et plus sûr que la modale. | Oui ; EXG-41 est reformulé. |
| Q-19 | **Limites d'utilisation V2** : quelles ressources seront limitées (nombre de prix, de produits, d'exports) et sur quelle base (gratuit/payant) ? | Détermine le modèle de données et le point de contrôle des droits (voir [04](04-mvp.md)). | À cadrer plus tard ; en attendant, un point de vérification unique, toujours « autorisé ». |
| Q-20 | Politique de confidentialité et consentement pour les **statistiques V2** (RGPD / loi ivoirienne sur la protection des données) | Obligatoire pour les stores et la loi dès qu'on collecte. | À rédiger avant tout envoi de données. Aucune collecte au MVP. |
