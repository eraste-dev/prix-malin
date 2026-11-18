# 03 — Règles métier

Cette page est la **spécification du moteur de calcul**. Elle est issue du prototype existant (`docs/Prix Malin.html`, fonction `compute`), clarifiée et corrigée là où le prototype est défaillant (voir [05](05-audit-existant.md)). Le moteur sera une bibliothèque pure testée avec les vecteurs ci-dessous.

## 1. Définitions

| Symbole | Nom | Définition |
|---|---|---|
| D | Coût direct unitaire | Σ (quantité × prix unitaire) des lignes de coûts directs |
| Fx | Charges fixes mensuelles | Σ des montants mensuels |
| V | Volume mensuel | Unités vendues par mois (entier ≥ 1) |
| FU | Part de charges fixes | Fx ÷ V |
| CR | **Coût de revient** | D + FU |
| m | Marge souhaitée | Part **du prix de vente** que l'on garde (0 ≤ m ≤ 0,70) |
| f | Frais de paiement | Part du prix prélevée par le canal de paiement (0 ≤ f ≤ 0,20) |
| a | Arrondi | Pas d'arrondi en F (0 = au franc) |
| P | Prix de vente HT | Voir RG-03 |
| t | Taux de TVA | 18 % si activée, sinon 0 |

## 2. Règles

**RG-01 — Coût de revient.** `CR = D + Fx ÷ V`.

**RG-02 — Dénominateur.** `den = 1 − m − f`. Le calcul est valide si `den > 0,05` et `CR > 0`. Sinon : pas de prix, message explicite (EXG-27).

**RG-03 — Prix.** `P_brut = CR ÷ den`.
- **Arrondi désactivé** (interrupteur ; il est **activé par défaut**, pas par défaut selon l'activité : revente 500, fabrication 25, prestation 500) : `P = ⌈P_brut⌉` (franc **supérieur**, jamais en dessous du prix brut : garantit que la marge visée est tenue ; le prototype arrondissait au plus proche, ce qui pouvait rogner la marge de moins d'un franc).
- **Arrondi activé** avec un pas `a` > 0 : `P = ⌈P_brut ÷ a⌉ × a` (toujours **au-dessus**, jamais sous le prix brut).
- L'arrondi s'applique au **prix de référence** choisi par le commutateur HT/TTC (RG-06).

**RG-04 — Marge sur prix de vente, pas sur coût.** La marge est un pourcentage du **prix**. Ajouter 25 % au coût donne 20 % du prix. Les deux taux sont affichés et nommés distinctement :
- *taux de marque* = marge ÷ P ;
- *taux de marge* = marge ÷ CR.

**RG-05 — Décomposition du prix HT.** Les frais de paiement sont calculés sur le **prix HT** (décision Q-07, TVA exclue de l'assiette). Dans le mode TTC de RG-06, `P` désigne le HT déduit. `frais = P × f` ; `marge = P − frais − CR` ; `P = D + FU + frais + marge`. L'arrondi se retrouve dans la marge, qui est donc **≥ à la marge visée**.

**RG-06 — TVA et commutateur HT/TTC.** La TVA est **optionnelle** (désactivée par défaut). Quand elle est activée, un **commutateur HT / TTC** désigne le **prix de référence** :
- **Mode HT** : `P_HT` est calculé (RG-03), arrondi si l'arrondi est activé ; `TVA = P_HT × t`, `TTC = P_HT + TVA` (peut être « non rond »).
- **Mode TTC** : on calcule `P_TTC = P_HT_brut × (1 + t)`, on l'arrondit si activé, puis `P_HT = P_TTC ÷ (1 + t)`. La marge se recalcule sur ce `P_HT` : elle reste **≥ à la marge visée**.
- Dans les deux cas, la TVA n'entre ni dans le coût, ni dans la marge ; elle est reversée à l'État.
- Une seule règle fiscale gérée : un taux unique (18 %). Les régimes particuliers (simplifié, TSE…) ne sont pas gérés : optionnel, hors MVP.
- Le commutateur détermine aussi la base du **prix concurrent** (RG-10) et l'affichage du résumé partagé.

**RG-07 — Seuil de rentabilité.** `contribution = P × (1 − f) − D`. Si `contribution ≤ 0` : seuil impossible. Sinon `seuil = ⌈Fx ÷ contribution⌉`. `bénéfice_mensuel = V × contribution − Fx`.

**RG-08 — Volume invalide.** Si `V < 1` : aucun prix conseillé. *(Le prototype calcule alors un prix sans charges fixes, c'est un défaut : voir [05](05-audit-existant.md).)*

**RG-09 — Seuils de verdict.** Avec `plancher = D ÷ (1 − f)` (prix minimal pour ne pas perdre sur l'unité) et `équilibre = CR ÷ (1 − f)` (prix minimal pour couvrir tout) :
- `P < plancher` → perte à chaque vente ;
- `plancher ≤ P < équilibre` → charges non couvertes ;
- sinon bénéfice.
Ces règles servent surtout au **mode inverse** (EXG-26), où l'utilisateur impose son prix. En mode conseil, `P ≥ équilibre` est garanti par construction.

**RG-10 — Comparaison concurrent.** Soit `C` le prix du concurrent, exprimé **dans la même base que le commutateur HT/TTC** (libellé explicite dans l'interface : « prix affiché au client en TTC » ou « HT »). Sans TVA, base unique. `d = (client − C) ÷ C` où `client` = prix payé par le client.
- `C_HT < équilibre` → « le concurrent vend sous votre coût de revient », ne pas s'aligner ;
- `d > +15 %` → plus cher, afficher la marge au prix du concurrent ;
- `d < −15 %` → moins cher, suggérer une hausse testée ;
- sinon « bien placé ».

**RG-11 — Monnaie.** Montants stockés et calculés en **entiers de F CFA**. Les divisions produisent des valeurs exactes (fractions ou milli-francs) arrondies seulement à l'affichage et à l'étape d'arrondi du prix. Affichage : séparateur de milliers espace insécable, « F » ou « F CFA ».

**RG-12 — Plage de saisie.** Quantités ≥ 0 (décimales admises : 0,5 kg). Prix et montants ≥ 0. Marge 0–70 %. Frais 0–20 %. Valeurs non numériques traitées comme 0 avec signalement visuel.

## 3. Vecteurs de test (référence TDD)

Calculés avec l'algorithme du prototype, sur les trois exemples préremplis. Tout moteur doit retrouver exactement ces valeurs.

| Cas | D | Fx | V | CR | m | f | a | P_brut | **P** | Frais/u | Marge/u | Taux de marque | Seuil | Bénéfice/mois |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Revente — pagne wax | 9 600 | 189 000 | 120 | 11 175 | 20 % | 1 % | 500 | 14 145,57 | **14 500** | 145 | 3 180 | 21,93 % | 40 | 381 600 |
| Fabrication — bissap | 210 | 220 000 | 2 000 | 320 | 25 % | 1 % | 25 | 432,43 | **450** | 4,5 | 125,5 | 27,89 % | 935 | 251 000 |
| Prestation — tresses | 6 300 | 122 000 | 80 | 7 825 | 30 % | 0 % | 500 | 11 178,57 | **11 500** | 0 | 3 675 | 31,96 % | 24 | 294 000 |

Coefficient (P ÷ D) : 1,51 · 2,14 · 1,83.

### Cas limites à couvrir

| Cas | Entrée | Résultat attendu |
|---|---|---|
| Volume nul | bissap avec V = 0 | **pas de prix** (le prototype affiche 300 F pour un coût de revient de 320 F : défaut) |
| Marge + frais trop hauts | m = 70 %, f = 30 % | `den ≤ 0,05` → pas de prix |
| Coût nul | aucune ligne | pas de prix |
| Arrondi désactivé | switch off | franc supérieur de P_brut (432,43 → **433**) |
| Mode TTC | P_HT_brut = 432,43 ; t = 18 % ; a = 25 | TTC brut 510,27 → **TTC 525** ; HT = 444,92 ; marge ≥ visée |
| Arrondi supérieur | P_brut = 432,43 ; a = 25 | 450 |
| P_brut déjà rond | P_brut = 450 ; a = 25 | 450 (pas 475) |
| TVA | P = 450, t = 18 % | TVA 81, TTC 531 |
| Contribution ≤ 0 | f = 20 %, D > P×0,8 | seuil « impossible » |
| Concurrent sous le coût | C = 250, bissap | message « ne vous alignez pas » |
| Quantité décimale | 0,5 × 1 200 | ligne = 600 |

### Propriétés (tests de propriété)

Pour tout jeu d'entrées valide :
1. `P ≥ P_brut` et `P − P_brut < a` (si `a > 0`).
2. `D + FU + frais + marge = P` exactement.
3. `marge ≥ m × P` : le taux de marque obtenu n'est jamais inférieur au taux visé (conséquence de `P ≥ P_brut`).
4. `P` est croissant en `m`, en `f`, en `D`, en `Fx`, et décroissant en `V`.
5. Le calcul est **identique** sur web, Android et iOS.
