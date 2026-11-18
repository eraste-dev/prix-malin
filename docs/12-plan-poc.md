# 12 — Plan des POC (lot 1 : app publique)

Objectif : **lever les risques de la stack** de l'app ([ADR-0008](adr/0008-choix-de-la-stack.md)) avec des mesures, avant de construire le produit. P6 et P7 (API, back-office) sont reportés au lot 2.

## Principes

- **Mesurer, pas supposer.** Chaque POC a un critère chiffré, noté dans l'ADR-0008.
- **TDD là où le code est durable.** P1 (moteur de calcul) deviendra du vrai code : tests d'abord. P2 à P5 sont des **spikes jetables** (branche à part, code non réutilisé tel quel).
- **Même scénario partout** : l'écran « coûts directs + résultat » du bissap, avec les valeurs de [03](03-regles-metier.md).
- **Web d'abord, puis Redmi** (Android 14, personnel). Les mesures sur Redmi sont **plus favorables** que sur un téléphone d'entrée de gamme : on applique en plus un ralentissement simulé (voir « Conditions de mesure »).

## Conditions de mesure

| Paramètre | Valeur |
|---|---|
| Navigateur de référence | Chrome récent, profil vierge, extensions désactivées |
| Réseau simulé | « Slow 4G » (puis « 3G rapide » en test sévère) |
| Processeur simulé | Ralentissement ×4 (puis ×6 en test sévère) dans les outils de développement |
| Outil | Lighthouse (mobile) + panneau Performance de Chrome |
| Répétitions | 5 mesures, on retient la **médiane** et le pire cas |
| Redmi | Même scénario, sans simulation, en application installée (PWA puis Capacitor) |
| Journalisation | Résultats datés dans [ADR-0008](adr/0008-choix-de-la-stack.md), section « Mesures » |

## Les POC

### P1 — Moteur de calcul (TDD, durable)

| | |
|---|---|
| But | Prouver que le moteur est pur, exact et identique partout (ADR-0002, ADR-0003) |
| Spécification | [03](03-regles-metier.md) : RG-01 à RG-12, vecteurs et propriétés |
| Tests d'abord | Les 3 vecteurs de référence, les cas limites, les propriétés (fast-check), les modes HT/TTC et arrondi activé/désactivé |
| Stratégie numérique | Comparer 2 options : entiers + fractions exactes, et bibliothèque décimale. Garder la plus simple qui passe |
| Réussite | 100 % des vecteurs, propriétés vertes sur ≥ 1 000 cas aléatoires, **identiques** sur Node, Chrome et Redmi |
| Livrable | Paquet `domain` sans aucune dépendance sur l'UI ; contrôle automatique de ses imports |

### P2 — Écran de saisie + résultat en PWA (spike)

| | |
|---|---|
| But | Mesurer démarrage, fluidité et poids de React + Vite |
| Contenu | Saisie des coûts directs, calcul en direct, ticket de résultat (design provisoire, sans soin visuel) |
| Réussite | Démarrage à froid < 3 s en Slow 4G + CPU ×4 ; aucune latence perçue à la saisie (< 100 ms entre frappe et résultat) ; JS initial < 500 Ko compressé ; Lighthouse performance ≥ 90 en mobile |
| Mouvement | Inclure la **révélation du résultat** (chiffre qui roule, barre en cascade, [16 §6](16-responsive-et-mouvement.md)) : ≥ 30 i/s à CPU ×4, saisie toujours possible pendant l'animation (MOV-03, MOV-04) |
| Variante | Si le poids dépasse la cible : refaire avec **Preact** (alias de compatibilité) et comparer |
| Sortie | Tableau de mesures React vs Preact |

### P3 — Emballage Capacitor (spike)

| | |
|---|---|
| But | Vérifier que l'app emballée n'est pas moins bonne que la PWA et que le stockage natif résiste |
| Contenu | Le même écran, installé sur le Redmi |
| Réussite | Démarrage et fluidité équivalents à P2 (écart < 20 %) ; données conservées après vidage du cache navigateur et fermeture forcée |
| Piège | Stockage web purgeable : utiliser le stockage natif derrière l'interface « dépôt » |

### P4 — Hors ligne (spike)

| | |
|---|---|
| But | Valider ADR-0001 : l'app marche sans réseau |
| Contenu | Service worker, contenu embarqué, stockage du brouillon |
| Réussite | Après un premier chargement, avion activé : calcul, enregistrement, relance **sans erreur** ; mise à jour de l'app détectée au retour du réseau sans casser les données |
| Test | Scénario Playwright automatisé (hors ligne simulé) + essai manuel sur Redmi |

### P5 — Build iOS depuis Windows (spike)

| | |
|---|---|
| But | Savoir si on peut publier sur iOS sans Mac |
| Contenu | Build via runner macOS en CI |
| Réussite | Un build installable sur un iPhone de test **ou** décision documentée sur l'alternative (Mac loué, service de build) |
| À savoir | Il faut un iPhone de test et un compte développeur Apple pour l'installer. À clarifier avec toi (Q-26) |

### P8 — Partage natif (spike)

| | |
|---|---|
| But | Valider EXG-43 (résumé vers WhatsApp) |
| Contenu | Feuille de partage native avec repli sur la copie |
| Réussite | Fonctionne sur le web (Chrome Android), sur Capacitor Android ; iOS si P5 réussit |

## Ordre et dépendances

```
P1 (moteur, TDD) ──► P2 (PWA, web) ──► P4 (hors ligne) ──► P3 (Capacitor/Redmi) ──► P8 (partage)
                                                                        └────────────► P5 (iOS, en parallèle dès que possible)
```

P1 d'abord car tout en dépend et il est durable. P2 puis P4 sur le web (rapide à itérer). P3 et P8 quand le web est validé. P5 est indépendant : à lancer tôt car il peut révéler un blocage logistique (matériel, compte).

## Règle de décision

| Résultat | Décision |
|---|---|
| P1 à P4 passent (React) | ADR-0008 « Acceptée » |
| P2 échoue sur le poids, passe avec Preact | Préact adopté |
| P2/P3 échouent même avec Preact, P1 passe | Bascule vers **React Native (Expo)** pour la couche UI mobile ; domaine, contrats, API, back-office inchangés |
| P5 échoue | iOS repoussé ou solution alternative documentée ; ne bloque pas Android et web |

## Livrables des POC

1. Dépôt en monorepo initialisé (`packages/domain`, `apps/app`), avec CI minimale (tests, vérification des imports du domaine).
2. Tableau de mesures dans l'ADR-0008.
3. Liste des écarts à la spécification trouvés pendant les POC.
4. Décision finale consignée.

## Ce qui n'est pas dans les POC

Design visuel définitif, contenu pédagogique, enregistrement des prix, mode « tester mon prix », charges partagées : tout cela appartient au lot 1 proprement dit, après les POC.
