# infra

Infrastructure de Prix Malin : déploiement, intégration continue, environnements.

> **Statut : non commencé.** L'hébergement est pris en charge par le développeur et fera l'objet d'une ADR dédiée (ADR-0009).

## Périmètre prévu

| Sujet | Exigence | Référence |
|---|---|---|
| Intégration continue | Tests, vérification des types, contrôle de pureté du domaine, couverture | [docs/12](../../docs/12-plan-poc.md) |
| Build mobile | Build iOS via runner macOS (le développement se fait sous Windows) | P5 dans [docs/12](../../docs/12-plan-poc.md) |
| Environnements | Développement, recette, production, **sans donnée de production en développement** | SYS-04, [docs/09](../../docs/09-vision-systeme.md) |
| Déploiement | Automatisé, reproductible, retour arrière possible | SYS-09 |
| Données serveur | Sauvegarde et restauration testées | SYS-06 |
| Secrets | Jamais dans le dépôt ; variables d'environnement ou coffre | [ADR-0007](../../docs/adr/0007-securite-backoffice.md) |
| Coût | Connu et plafonné | SYS-10 |

## Règles

- Aucun secret versionné. Fournir un `.env.example` documenté pour toute configuration.
- Toute évolution d'infrastructure se justifie par une ADR si elle est difficile à défaire.
