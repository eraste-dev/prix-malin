# admin

Back-office et API de Prix Malin.

> **Statut : non commencé.** Prévu au lot 2, après validation du design et de l'expérience de l'app publique.

## Rôle

Outil réservé à des **utilisateurs désignés** (par invitation, pas d'inscription libre), qui pilote ce que voit l'app publique.

| Tranche | Contenu | Lot |
|---|---|---|
| **B0** | Contenu pédagogique et configuration : cycle brouillon → relu → publié, relecture par un autre rôle | 2 |
| B1 | Supervision et support : erreurs anonymes, signalements | Ensuite |
| B2 | Statistiques d'usage anonymes, avec consentement | Ensuite |
| B3 | Comptes, offres, limites d'utilisation, paiement | Ensuite |

Dépendances entre tranches : [docs/09-vision-systeme.md](../../docs/09-vision-systeme.md). Exigences : [docs/10-cahier-des-charges-backoffice.md](../../docs/10-cahier-des-charges-backoffice.md).

## Stack prévue

AdonisJS (TypeScript), PostgreSQL, interface en React via Inertia. À prouver au démarrage du lot 2 : contrat d'API partagé avec l'app (P6) et second facteur d'authentification (P7). Voir [ADR-0008](../../docs/adr/0008-choix-de-la-stack.md).

## Exigences de sécurité (non négociables)

- Second facteur obligatoire, droits par rôle appliqués **côté serveur**, journal d'audit.
- Séparation auteur / relecteur testée automatiquement.
- Contenu publié assaini : aucun HTML ni script exécutable.

Détail : [ADR-0007](../../docs/adr/0007-securite-backoffice.md), [ADR-0006](../../docs/adr/0006-donnees-personnelles-et-consentement.md).
