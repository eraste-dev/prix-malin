# 17 — Leçons apprises et règles de travail

Registre court, **lu au début de chaque session** (référencé dans `CLAUDE.md`). Chaque entrée dit quoi faire ou ne pas faire, et pourquoi. Quand une erreur se répète ou qu'une correction est donnée, on **ajoute une ligne ici dans la même session**.

Format : `L-xx` · règle · pourquoi · date.

## Design et interface

| ID | Règle | Pourquoi | Date |
|---|---|---|---|
| L-01 | **Ne pas écrire les composants UI à la main.** Utiliser **shadcn/ui** (Tailwind + Radix, [ADR-0010](adr/0010-bibliotheque-ui-shadcn.md)). Ajouter un composant avec `pnpm dlx shadcn@latest add <nom>`. | Écrire le CSS et les composants de zéro coûte du temps et de l'accessibilité. Demandé par le propriétaire. | 2026-11-18 |
| L-02 | **Les captures de `docs/ui-ux/` servent au style, pas au contenu.** Reprendre : en-tête (date discrète + gros titre léger), cartes teintées aux grands arrondis, barre de navigation flottante en pilule, contrôle segmenté sombre, un accent unique (citron). Ne jamais reprendre leur texte, leurs photos ni leur domaine (santé). | Un premier écran « neutre » ignorait les inspirations ; le propriétaire les a fournies pour le design. | 2026-11-18 |
| L-03 | **Appliquer la direction visuelle dès le premier écran**, même provisoire. Ne pas livrer un écran « sans style » en attendant. | Un écran brut ne permet pas de juger. | 2026-11-18 |
| L-04 | **Le thème suit le système par défaut, avec bascule manuelle** (EXG-51), dans l'onglet Réglages. Mécanisme : `<html data-theme="light\|dark">`, absent = système. Penser clair **et** sombre pour chaque jeton. | Un écran sombre sans bascule a surpris le propriétaire. | 2026-11-18 |
| L-05 | Texte ≥ 16 px, cibles ≥ 44 px, poids léger **réservé aux grands chiffres** (≥ 40 px). Pas de flou d'arrière-plan en temps réel. Contrôler le contraste AA de chaque paire de couleurs. | NFR-06, NFR-07, performance sur appareil modeste. | 2026-11-18 |

## Portée et communication

| ID | Règle | Pourquoi | Date |
|---|---|---|---|
| L-06 | **Dire clairement ce qui est construit et ce qui ne l'est pas** avant que le propriétaire ouvre l'app. Un spike (P2) n'a ni onboarding ni navigation. | Le propriétaire a cherché l'onboarding, qui n'existait pas. | 2026-11-18 |
| L-07 | **Vérifier le rendu réel avant de dire que c'est fait.** Les tests ne prouvent pas que l'écran s'affiche. Charger la page (navigateur, Playwright ou outils Chrome) ; sinon dire « je n'ai pas vérifié le rendu ». | Page noire après la migration, non détectée par les tests. | 2026-11-18 |
| L-08 | Un **choix difficile à défaire** (bibliothèque, base de données, hébergement) passe par une recommandation puis un ADR. | CLAUDE.md : ADR pour tout choix difficile à défaire. | 2026-11-18 |
| L-09 | **Ne pas commiter les images tierces de `docs/ui-ux/*.webp`** tant que la question des droits n'est pas tranchée. Seul le README s'y commite. | Œuvres de tiers dans un dépôt potentiellement public. | 2026-11-18 |

## Outillage

| ID | Règle | Pourquoi | Date |
|---|---|---|---|
| L-10 | **Ajouter une dépendance avec `pnpm --filter @prix-malin/app add …` depuis `src/`.** `pnpm add` depuis `src/clients/app` échoue (« Cannot read properties of undefined (reading 'manifest') ») tant que `src/admin` n'a pas de `package.json`. | Workspace listant `admin`, dossier vide. | 2026-11-18 |
| L-11 | **Redémarrer le serveur de développement et recharger avec Ctrl+Maj+R** après un changement de `vite.config.ts`, d'alias ou de dépendances. Vérifier `curl` sur quelques modules (200) et lire le journal du serveur. | Le serveur gardait l'ancienne configuration : `@/` introuvable, page noire. | 2026-11-18 |
| L-12 | **Relire les imports générés par la CLI shadcn.** Elle a produit `from "cn"` ; la bonne forme est `from "@/lib/utils"`. L'alias `@/` doit exister dans `tsconfig.json` **et** `vite.config.ts`. | Erreur de résolution au premier lancement. | 2026-11-18 |
| L-13 | **Écrire les fichiers avec l'outil d'écriture**, pas avec de gros scripts shell mêlant heredocs, Python et apostrophes. | Erreur de syntaxe : rien n'a été exécuté. | 2026-11-18 |
| L-14 | **Avant de numéroter un ADR, lire `docs/adr/README.md`** : les numéros réservés y figurent (0009 = hébergement, Q-22). | Collision de numéro évitée de justesse. | 2026-11-18 |
| L-15 | Tailwind v4 : la variante `dark:` est redéfinie pour le thème **forcé** (`@custom-variant` dans `styles.css`). En mode système, seuls les jetons de couleur s'adaptent : ne pas compter sur `dark:` pour le style essentiel. | Limite connue, documentée dans l'ADR-0010. | 2026-11-18 |
| L-16 | Radix `ToggleGroup` en mode `single` : rôle `radiogroup`, items `radio` ; il renvoie `""` quand on reclique l'option active (à ignorer). | Test écrit avec le mauvais rôle. | 2026-11-18 |

## Méthode

| ID | Règle | Pourquoi | Date |
|---|---|---|---|
| L-17 | **Test d'abord, vu rouge, puis le code** (y compris pour les composants d'interface). Citer l'exigence (`EXG-xx`) ou la règle (`RG-xx`). | SDD + TDD du projet. | 2026-11-18 |
| L-18 | **Le moteur (`src/clients/domain`) ne reçoit aucune dépendance** ; l'interface vit dans `src/clients/app`. | Test de pureté, ADR-0003. | 2026-11-18 |
| L-19 | **Relire les docs de spécification avant de construire un écran** (13, 14, 15, 16) et dire ce qu'on s'apprête à couvrir. | Éviter les écarts avec ce que le propriétaire attend. | 2026-11-18 |

## Palette

| ID | Règle | Pourquoi | Date |
|---|---|---|---|
| L-20 | **Deux couleurs de marque seulement : primaire terracotta `#B84A2E`, secondaire vert sauge `#2F4F43`, plus des neutres chauds** (sable `#F6EFE7`, encre `#241915`). Sombre : terracotta éclairci `#E07B5F`, fond `#1B1512`. Pas de troisième couleur d'accent sans décision du propriétaire. | Palette « Terre et sauge » choisie le 2026-11-18. Le citron et la lavande des captures sont abandonnés. | 2026-11-18 |
| L-21 | **Terracotta = action, onglet actif, repère** ; **sauge = carte résultat, verdict « bénéfice »**. Le terracotta tire vers le rouge : ne pas l'employer pour de grandes surfaces ni pour un état normal. Un verdict a toujours une icône et un texte, jamais la couleur seule (RES-04). | Éviter qu'une action ressemble à une alerte. | 2026-11-18 |
| L-22 | **Contrôler le contraste (script) pour chaque nouvelle paire de couleurs**, en clair et en sombre : texte ≥ 4,5, grands chiffres ≥ 3. Le terracotta classique `#C2553A` est trop limite (4,51 avec du blanc). | WCAG 2.2 AA, NFR-06. | 2026-11-18 |
| L-23 | **Après un changement de thème, chercher les déclarations en double** dans `styles.css` : une valeur déclarée deux fois dans le même bloc écrase la précédente en silence (les anciens jetons gris écrasaient les nouveaux sombres). | Bug détecté en appliquant la palette. | 2026-11-18 |
| L-24 | **`docs/ui-ux/DESIGN.md` est la référence de l'interface** (format Google Labs : jetons YAML + sections dans l'ordre Overview, Colors, Typography, Layout, Elevation, Shapes, Motion, Voice, Components, Do's and Don'ts). Toute valeur change **d'abord là**, puis dans `styles.css`, avec une ligne au « Journal ». Ne jamais mettre une couleur en dur dans un composant. | Éviter la dérive visuelle entre sessions. | 2026-11-18 |
| L-25 | `designmd lint` / `diff` (paquet npm `@google/design.md`) valide le fichier et le contraste ; sous Windows utiliser `npx -p @google/design.md designmd lint DESIGN.md` (l'alias sans `.md`). Il télécharge un paquet : demander l'autorisation au propriétaire avant de l'exécuter. | La commande a été refusée par les permissions ; le lint n'a donc pas encore été lancé. | 2026-11-18 |
| L-26 | **Un réglage utilisé souvent (thème) se met dans l'en-tête sous forme d'un bouton rond d'icône avec menu**, toujours visible, pas dans un onglet. Le contrôle segmenté est réservé aux choix de 2 à 3 libellés courts. Les composants de réglage lisent un **état partagé** (`useTheme` dans `App`), pas un état local chacun. | Retour du propriétaire sur le contrôle de thème. | 2026-11-18 |
| L-27 | **La CLI shadcn génère encore `from "cn"`** à chaque ajout de composant : corriger systématiquement en `@/lib/utils` (voir L-12). | Même bug revu avec `dropdown-menu`. | 2026-11-18 |
| L-28 | **Champs de saisie : exemple clair en filigrane (« ex. 210 »), unité FCFA dans le champ à droite, pas de sous-libellé visible.** Un filigrane disparaît dès qu'on tape : la **consigne complète reste dans une description accessible** (`aria-describedby`, `sr-only`), jamais supprimée. Le filigrane doit garder un contraste ≥ 4,5. | Choix du propriétaire ; ne pas perdre l'aide pour les lecteurs d'écran. | 2026-11-18 |
| L-29 | **Animer chaque élément séparément, dans une chorégraphie unique** : pas de bloc entier qui entre d'un coup. Tous les temps viennent de `lib/motion.ts` (temps forts de 40 ms, rang de 20 ms) via `<Reveal beat sub>` ; jamais de délai ou de classe d'animation écrits à la main dans un composant. Toute animation est sous `motion-safe:` (MOV-01). Une surface (carte, barre) fait un fondu seul. | Demandé par le propriétaire ; un test vérifie l'ordre des retards et le préfixe `motion-safe`. | 2026-11-18 |
| L-30 | **Un réglage binaire se bascule d'un clic**, sans menu ni liste déroulante (thème clair/sombre). Le troisième état (« Système ») vit dans Réglages. | Retour du propriétaire sur le menu de thème. | 2026-11-18 |
