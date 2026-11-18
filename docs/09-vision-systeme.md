# 09 — Vision système

Prix Malin n'est pas une application isolée mais un **système** : une application publique, un back-office, et une API qui les relie. Les documents 01 à 08 décrivent surtout l'application publique ; ce document pose le cadre d'ensemble. Chaque choix structurant est tracé dans [adr/](adr/README.md).

## 1. Composants

```
┌─────────────────────────┐        ┌────────────────────────┐
│ App publique            │        │ Back-office            │
│ web (PWA) · Android · iOS│        │ (équipe interne)       │
│ 100 % utilisable hors   │        │ contenu · statistiques │
│ ligne                   │        │ comptes/offres · support│
└───────────┬─────────────┘        └───────────┬────────────┘
            │  HTTPS, contrat d'API versionné   │
            └───────────────┬───────────────────┘
                    ┌───────▼────────┐
                    │ API            │
                    │ contenu/config │
                    │ événements     │
                    │ comptes/droits │
                    └───────┬────────┘
                    ┌───────▼────────┐
                    │ Données        │
                    └────────────────┘

Bibliothèque partagée : moteur de calcul (domaine pur), utilisé par l'app et, si utile, par l'API (validation, tests croisés).
```

## 2. Acteurs

| Acteur | Interagit avec | Rôle |
|---|---|---|
| Utilisateur final | App publique | Calcule et enregistre ses prix |
| Rédactrice / relectrice de contenu (la comptable) | Back-office | Édite, relit, publie le contenu pédagogique et la configuration |
| Administrateur | Back-office | Gère les accès, les offres, supervise |
| Analyste | Back-office | Consulte les statistiques agrégées, sans donnée personnelle |
| Support | Back-office | Traite les signalements et les erreurs |

## 3. Principes d'architecture

1. **Le serveur enrichit, ne bloque jamais.** Sans réseau ni serveur, l'app fonctionne complètement. Les données serveur (contenu, config) sont mises en cache localement avec une **valeur de repli embarquée** dans l'app. ([ADR-0001](adr/0001-app-hors-ligne-serveur-optionnel.md))
2. **Contrats d'abord.** L'API est décrite par un contrat versionné avant d'être implémentée. L'app et le back-office en dépendent, pas de l'implémentation. Une ancienne version d'app doit continuer à fonctionner. ([ADR-0004](adr/0004-contrat-api-versionne.md))
3. **Le moteur de calcul est la propriété du domaine**, pur et testé, identique partout. ([ADR-0003](adr/0003-moteur-de-calcul-pur-partage.md))
4. **Le contenu est de la donnée versionnée**, pas du code. Il a un cycle brouillon → relu → publié. ([ADR-0005](adr/0005-contenu-donnee-versionnee.md))
5. **Minimisation des données.** On ne collecte que ce qui sert une fonction identifiée, avec consentement explicite. Les coûts d'un commerce ne quittent jamais l'appareil sans action volontaire de l'utilisateur. ([ADR-0006](adr/0006-donnees-personnelles-et-consentement.md))
6. **Sécurité par défaut** dans le back-office : droits par rôle, journal d'audit, authentification forte. ([ADR-0007](adr/0007-securite-backoffice.md))

## 4. Tranches du back-office

Les quatre fonctions demandées dépendent les unes des autres. L'ordre de livraison suit les dépendances, pas l'importance.

| Tranche | Contenu | Dépend de | Données personnelles |
|---|---|---|---|
| **B0 — Contenu et configuration** | Éditeur de contenu pédagogique, exemples par activité, suggestions de coûts, paramètres (taux de TVA, valeurs par défaut). Cycle brouillon/relu/publié. Publication vers l'app. | API de contenu | Aucune |
| **B1 — Supervision et support** | Journal d'erreurs anonymes, état du service, signalements | B0 (socle API), consentement pour les erreurs | Minimales |
| **B2 — Statistiques d'usage** | Événements anonymes agrégés : fonctions utilisées, parcours, abandon | B1 (collecte), consentement, politique de confidentialité | Pseudonymes, agrégés |
| **B3 — Comptes, offres, quotas** | Comptes utilisateurs, offres, limites, synchronisation, paiement | B2, authentification, conformité stores | Oui (compte, e-mail ou téléphone) |

**Ordre de construction (décision du 2026-11-18)** :

| Lot | Contenu | But |
|---|---|---|
| **Lot 1 — App publique seule** | Parcours complet, hors ligne, contenu et configuration **embarqués** (données versionnées avec schéma) | Valider le design et l'expérience utilisateur auprès de vrais utilisateurs |
| **Lot 2 — API + B0** | API AdonisJS, back-office de contenu et configuration, app branchée au serveur avec repli embarqué | Rendre le contenu pilotable sans republication |
| **Lot 3 — Site public** | Site indexé alimenté par le contenu de B0 | Acquisition |
| **Lots suivants** | B1, B2, B3 | Supervision, statistiques, comptes et quotas |

B1 à B3 restent **conçus** dès maintenant (modèles de données, contrats d'API, exigences dans [10](10-cahier-des-charges-backoffice.md)). Aucune date, l'ordre suit les dépendances et la validation du design.

Précaution du lot 1 : même sans serveur, le contenu, la configuration et le stockage respectent déjà les schémas versionnés et les interfaces prévus (ADR-0001, 0003, 0005), pour que le lot 2 soit un branchement et non une refonte.

## 5. Point d'attention : quotas et app hors ligne

Une app qui marche hors ligne ne peut pas **faire respecter** un quota localement (contournable : cache vidé, avion, réinstallation). Deux conséquences, à trancher au moment de B3 :

- Limiter ce qui **dépend du serveur** (sauvegarde cloud, synchronisation multi-appareils, exports hébergés, nombre de produits synchronisés), pas le calcul local.
- Ou accepter un contrôle « au mieux » (côté appareil) pour du confort, sans valeur de sécurité.

Dès la livraison 1, un **point unique de vérification des droits** existe dans l'app (aujourd'hui toujours « autorisé ») pour ne pas avoir à réécrire ensuite.

## 6. Exigences transverses du système

| ID | Exigence |
|---|---|
| SYS-01 | L'app publique reste 100 % fonctionnelle sans serveur (voir NFR-02). |
| SYS-02 | Toute évolution d'API est rétro-compatible tant qu'une version d'app active l'utilise. |
| SYS-03 | Aucun secret dans l'app. Les clés côté app sont publiques par conception. |
| SYS-04 | Environnements séparés : développement, recette, production. Aucune donnée de production en développement. |
| SYS-05 | Journal d'audit de toute action d'administration. |
| SYS-06 | Sauvegarde et restauration des données serveur testées. |
| SYS-07 | Contenu publié signé ou vérifié côté app avant usage (intégrité). |
| SYS-08 | Observabilité : journaux, métriques, alertes sur l'API. |
| SYS-09 | Déploiement automatisé et reproductible (CI/CD), retour arrière possible. |
| SYS-10 | Le coût d'exploitation est connu et plafonné (hébergement, stockage, notifications). |

## 7. Site public indexé (décision du 2026-11-18)

Un **site public référencé par Google** complète le système : page d'accueil, articles pédagogiques (« comment fixer son prix », « marge ou marque ? »), pages par activité, lien vers l'app.

| Sujet | Décision proposée |
|---|---|
| Nature | Site **distinct** de l'app (l'app reste une SPA hors ligne, mal adaptée au référencement) |
| Source du contenu | **Le même contenu que celui du back-office (B0)** : une seule source validée par la comptable, publiée vers l'app **et** vers le site |
| Technologie | Générateur de site statique ou à rendu serveur, choix en ADR (candidats : Astro avec îlots React, Next.js). Pente : **Astro**, le site étant orienté contenu et rapide à charger |
| Domaine | Site sur le domaine principal, app sur un sous-domaine, PWA limitée à son périmètre |
| Calculateur d'entrée | Version allégée du calculateur sur le site (moteur partagé), qui renvoie vers l'app pour enregistrer et aller plus loin. Fort levier de référencement |
| Calendrier | Pas de date : concevoir dès B0 (champs SEO du contenu), construire **après la livraison 1** |
| Contraintes | Performance (Core Web Vitals), accessibilité, données structurées, plan du site, pas de collecte sans consentement |

Conséquence sur le back-office B0 : le contenu porte dès maintenant les champs nécessaires au site (voir BO-13 à BO-15 dans [10](10-cahier-des-charges-backoffice.md)).

## 8. Ce que ce changement impose aux autres documents

- [README](README.md) : sommaire étendu (09, 10, adr/).
- [06 — Stack](06-criteres-stack.md) : ajout des critères serveur/API et partage du domaine.
- [04 — MVP](04-mvp.md) : la livraison 1 inclut **B0**.
- [08 — Questions](08-questions-ouvertes.md) : questions sur l'hébergement, la conformité et le choix de l'API.
