# 05 — Audit du prototype existant

Fichier analysé : `docs/Prix Malin.html` (450 lignes, HTML + CSS + JS vanilla, un seul fichier, aucun build). Données dans `localStorage` (`pm_draft`, `pm_list`).

## Ce qu'il fait

- 3 vues : **Calculer** (4 étapes + ticket de résultat), **Mes prix**, **Comprendre**.
- 3 types d'activité avec exemples préremplis réalistes (pagne wax, bissap, tresses).
- Calcul de prix en marge sur prix de vente, frais de paiement, arrondi, TVA 18 %, comparaison concurrent, seuil de rentabilité.
- Thème clair/sombre, responsive, copie du résumé pour WhatsApp.

## À garder (valeur réelle)

| Élément | Pourquoi |
|---|---|
| **Le fond pédagogique** (section Comprendre, « pièges », « erreurs qui font fermer ») | C'est le cœur de la valeur. Contenu bien écrit et adapté au contexte ivoirien. |
| **Le choix de la marge sur prix de vente** et l'explication du piège | Rigoureux et rare dans ce type d'outil. |
| **Les exemples localisés** (Adjamé, CIE, SODECI, patente, TSE, Mobile Money) | Crédibilité immédiate. |
| **La logique en 4 étapes** | Bonne progression : coûts directs → charges fixes → marge → marché. |
| **La décomposition du prix en « ticket »** | Idée forte, à retravailler visuellement. |

## Défauts fonctionnels

| # | Gravité | Défaut | Détail |
|---|---|---|---|
| F1 | **Haute** | Volume à 0 : prix faux silencieux | Avec V = 0, `FU = 0` et le prix est calculé **sans charges fixes** (300 F pour le bissap alors que le coût de revient est de 320 F). L'utilisateur vend à perte sans alerte. → RG-08. |
| F2 | **Haute** | Pas de modèle multi-produits | Les charges fixes sont répétées dans chaque produit enregistré. Impossible de répartir un loyer entre 10 produits sans calcul manuel. → EXG-16. |
| F3 | Moyenne | On ne peut pas tester son prix actuel | L'outil ne fait que recommander un prix. Les verdicts « perte » / « charges non couvertes » (`P < plancher`, `P < équilibre`) sont **inatteignables** : le prix calculé est toujours ≥ équilibre. Les zones rouge et orange de l'échelle sont du code mort. → EXG-26. |
| F4 | Moyenne | Changer de type d'activité efface tout | Le clic sur un mode recharge l'exemple sans confirmation. Perte de saisie. → EXG-03. |
| F5 | Moyenne | Identité des prix enregistrés = le nom | `findIndex(name)` : deux produits de même nom (ex. « Tresses ») s'écrasent. Pas d'identifiant. → EXG-40. |
| F6 | Moyenne | Arrondi appliqué au HT, pas au TTC | Avec TVA : 450 × 1,18 = 531 F, prix client « pas rond ». Résolu par le commutateur HT/TTC (RG-06). |
| F7 | Basse | Frais de paiement calculés sur le HT | Un Mobile Money prélève en réalité sur le montant encaissé, TVA incluse. Écart faible. **Comportement conservé** par décision (Q-07). |
| F8 | Basse | Concurrent supposé TTC sans le dire | `conc/1,18` si TVA activée, sans que l'interface l'indique. → Q-06. |
| F9 | Basse | Pas de revue des prix dans le temps | Le texte dit « revoyez vos prix » mais l'app ne propose ni historique ni rappel. → EXG-45. |

## Défauts techniques

| # | Gravité | Défaut |
|---|---|---|
| T1 | Haute | **Stockage non validé** : `JSON.parse` sans contrôle de schéma. Un `pm_draft` altéré (mode inconnu) provoque `PRESETS[S.mode].trap` → exception, et l'app est inutilisable jusqu'à vidage manuel du stockage. → NFR-09. |
| T2 | Moyenne | Logique métier, rendu et état **mélangés** dans un script de 140 lignes : intestable en l'état. → NFR-12. |
| T3 | Moyenne | Rendu par `innerHTML` avec `esc()` partiel (`>` et `'` non échappés). Pas exploitable aujourd'hui car les valeurs sont dans des attributs entre guillemets doubles ou en texte, mais fragile. → NFR-11. |
| T4 | Moyenne | Calcul en **flottants** : pas de problème visible aujourd'hui, risque dès qu'on cumule des pourcentages. → NFR-08. |
| T5 | Basse | Police Google chargée depuis le CDN : problème hors ligne, poids, et vie privée. → NFR-02, 04. |
| T6 | Basse | Aucune version de schéma de données : toute évolution casserait les données existantes. → NFR-09. |
| T7 | Info | Aucun test. |
| T8 | Info | Pas de PWA : pas d'installation, pas de mode hors ligne garanti. |

## Défauts d'ergonomie (entrée pour la refonte UX)

Détaillés dans [07-brief-ux.md](07-brief-ux.md).

## Conclusion

Le **contenu et la logique métier sont bons** et constituent la base du produit. Le **code est un prototype jetable** : à reprendre sur une architecture testable, en gardant le moteur de calcul comme spécification (vecteurs de test dans [03](03-regles-metier.md)), en corrigeant F1 à F6.
