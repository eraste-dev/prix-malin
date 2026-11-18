# 06 — Critères de choix de stack

> **Aucune décision ici.** Ce document fixe les critères pour que le choix, fait à la séance suivante, soit argumenté et vérifié par un POC.

## Contraintes qui pilotent le choix

| # | Contrainte | Origine |
|---|---|---|
| C1 | Un seul code pour **web, Android, iOS** | Demande initiale, NFR-01 |
| C2 | **Hors ligne** complet, stockage local fiable | Local-first, NFR-02 |
| C3 | Application **légère et rapide** sur Android d'entrée de gamme, data limitée | Public cible, NFR-03/04 |
| C4 | **Moteur de calcul pur**, testable sans UI, identique partout | TDD, NFR-08/12 |
| C5 | UI **entièrement sur mesure** (refonte complète, pas de look « framework ») | Demande design |
| C6 | Simplicité : petite équipe, peu de dépendances, maintenable par une personne | Demande initiale |
| C7 | Développement sous **Windows** ; iOS exige un Mac ou un build cloud | Environnement |
| C8 | Acceptation par les stores Apple et Google | NFR-14 |
| C9 | Partage natif (WhatsApp), installation écran d'accueil, éventuellement notifications locales | EXG-43, EXG-45 |

## Contraintes ajoutées par le système (app + API + back-office)

| # | Contrainte | Origine |
|---|---|---|
| C10 | **Moteur de calcul partageable** entre app, API et tests (idéalement même langage) | ADR-0003 |
| C11 | Contrats d'API versionnés et schémas partagés app/serveur | ADR-0004 |
| C12 | Authentification forte, rôles et audit pour le back-office | ADR-0007 |
| C13 | Hébergement abordable, exploitable par une personne, avec sauvegardes testées | SYS-06, SYS-10 |
| C14 | Un seul langage ou écosystème pour app, API et back-office, afin de limiter la charge cognitive d'une petite équipe | Simplicité |

Le choix final sera tracé dans **ADR-0008**.

## Grille d'évaluation proposée

Notes de 1 à 5, pondérées. À remplir après POC, pas avant.

| Critère | Poids |
|---|---|
| Un seul code réellement partagé (UI comprise, pas seulement la logique) | 5 |
| Poids et performance sur appareil modeste | 5 |
| Qualité du mode hors ligne / stockage local | 4 |
| Testabilité (TDD unitaire, composants, e2e) | 4 |
| Liberté de design (typographie, animations, fidélité aux maquettes) | 4 |
| Accessibilité (lecteurs d'écran, taille de texte système) | 4 |
| Chaîne de build et déploiement iOS depuis Windows | 3 |
| Courbe d'apprentissage et écosystème | 3 |
| Pérennité du projet et de la communauté | 3 |
| Coût (licences, CI, comptes) | 2 |

## Familles d'options à comparer

| Famille | Principe | Points forts | Points d'attention |
|---|---|---|---|
| **A. PWA + emballage natif** (web app + Capacitor) | Une app web (TypeScript, framework léger) emballée pour Android/iOS | Un seul code pour les 3 cibles, vrai web, déploiement web trivial, tests web mûrs, UI 100 % sur mesure | Performance de WebView à mesurer sur Android modeste ; risque de refus Apple 4.2 si trop « site » ; stockage web à protéger (éviction) → utiliser le stockage natif |
| **B. React Native / Expo** | Composants natifs, TypeScript, build cloud (EAS) | iOS depuis Windows via build cloud, bon écosystème, web via React Native Web | Le web est un citoyen de seconde zone ; design sur mesure plus laborieux ; mises à jour fréquentes |
| **C. Flutter** | Moteur de rendu propre, Dart | Un code, UI pixel-perfect identique partout, bon outillage de test | Web plus lourd (poids initial), SEO inexistant, accessibilité web moins naturelle, Dart de moins en moins mainstream pour l'équipe |
| **D. Kotlin Multiplatform + Compose** | Logique partagée, UI Compose multiplateforme | Moteur partagé de qualité | Web/iOS encore moins mûrs, plus complexe pour un projet de cette taille |

**Pré-lecture non engageante** : les familles A et B correspondent le mieux à C6, C7 et C4 (TypeScript, moteur pur trivial à partager). Le choix tient surtout à une question : *le web est-il la plateforme principale (A) ou une cible parmi d'autres (B/C) ?* Le POC doit trancher sur des mesures, pas sur des préférences.

## Proofs of concept à réaliser avant décision

1. **Moteur de calcul** en TypeScript pur avec les vecteurs de [03](03-regles-metier.md) : même résultat sur Node, navigateur, Android, iOS.
2. **Écran de saisie + résultat** sur un Android d'entrée de gamme : temps de démarrage, fluidité de saisie, poids.
3. **Stockage local** persistant après fermeture forcée, cache vidé (web), réinstallation.
4. **Chaîne iOS depuis Windows** : build cloud + installation sur un iPhone de test.
5. **Partage natif** (feuille de partage) sur les 3 plateformes.

## Règles des stores à vérifier avant de s'engager

*À confirmer sur les sources officielles au moment de la soumission, ces règles évoluent.*

- **Apple** : compte développeur payant (≈ 99 USD/an) ; règle 4.2 « fonctionnalité minimale » (une simple page web emballée peut être refusée) ; politique de confidentialité obligatoire ; déclaration des données collectées.
- **Google Play** : frais unique (≈ 25 USD) ; les nouveaux comptes personnels peuvent être soumis à une phase de **test fermé avec un nombre minimal de testeurs** avant publication en production ; déclaration de sécurité des données.
- Un compte **organisation** (société/association) est parfois requis ou préférable : à clarifier avec la porteuse du projet (qui publie sous quel nom ?).

## Architecture cible (indépendante de la stack)

```
┌───────────────────────────────┐
│  UI (écrans, composants)      │  dépend de ↓
├───────────────────────────────┤
│  Application (état, cas d'usage) │  dépend de ↓
├───────────────┬───────────────┤
│ Domaine/Moteur │  Stockage     │
│ (pur, 0 dép.)  │  (interface)  │  ← adaptateurs par plateforme
└───────────────┴───────────────┘
```

- Le **domaine** ne connaît ni l'UI ni le stockage. C'est lui que le TDD verrouille en premier.
- Le **stockage** est une interface (dépôt) avec validation de schéma et migrations ; l'implémentation dépend de la plateforme.
- Tous les **textes** passent par un dictionnaire (i18n), tous les **formats** (monnaie, nombre) par une couche de formatage.
