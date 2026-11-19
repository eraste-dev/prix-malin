# 19 — État du lot 1 (app publique)

> Dernière mise à jour : 2026-11-19. Branche `feat/ecran-calculer-etapes`.

**L'app publique du lot 1 est fonctionnelle** : on peut calculer un prix, tester son prix actuel, l'ajuster, l'enregistrer, le partager, retrouver ses prix, apprendre, tout cela **hors ligne** et sans compte. Ce qui reste demande un appareil, un compte ou un regard humain (voir « À faire par le propriétaire »).

## Écrans de docs/15

| ID | Écran | État | Où |
|---|---|---|---|
| E00 | Splash | Fait | logo seul dans `index.html`, retiré au premier rendu |
| E01 | Accueil | Fait | `AccueilPage` : reprendre, calculer, tester mon prix, derniers prix, conseil du moment |
| E02 | Q1 — Que vendez-vous ? | Fait | type (3 tuiles), nom, unité ; confirmation au changement de type (EXG-03) |
| E03 | Q2 — coût direct | Fait | Total ou Détail, suggestions, quantités décimales |
| E04 | Q3 — charges et ventes | Fait | Total ou Détail en pastilles, « Ma rémunération » en tête, rappel non bloquant, part par vente en direct |
| E05 | Q4 — prix actuel | Fait | bascule « Prix conseillé / Mon prix » dans l'étape Résultat |
| E06 | Résultat | Fait | prix, indicateurs, verdict (Mon prix), concurrent, demi-cercle de composition, « Pourquoi ce prix ? », Ajuster (marge, frais, arrondi, TVA HT/TTC, concurrent) |
| E07 | Enregistrer | Fait | feuille, mettre à jour ou copie |
| E08 | Partager | Fait | aperçu, partage natif ou copie |
| E09 | Mes prix | Fait | liste, rouvrir, dupliquer, supprimer avec annulation, recherche dès 6 prix |
| E10 | Mon activité | Fait (version simple) | charges partagées, répartition au prorata des ventes |
| E11 | Comprendre | Fait | 8 articles, exemples chiffrés tirés du calcul |
| E12 | Aide contextuelle | Fait | boutons « ? » avec définition courte et lien |
| E13 | Réglages | Fait | thème, présentation, aides, sauvegarde/import, confidentialité, à propos, effacement renforcé |
| E14 | États transverses | Fait | stockage abîmé (bandeaux), écran de secours, mises à jour proposées, hors ligne |
| — | Onboarding (docs/14) | Fait | 3 cartes, exemple guidé séparé des données, aides à usage unique |

Hors parcours demandé par le propriétaire : stepper vertical fixe (rail de progression), demi-cercle animé, thèmes clair/sombre, GSAP.

## Choix faits sans attendre de réponse (à valider)

| Sujet | Choix par défaut | Pourquoi / à confirmer |
|---|---|---|
| Répartition des charges partagées (Q-27) | Au prorata des **ventes mensuelles**, sans réglage manuel du pourcentage | Le docs/08 propose le prorata avec % modifiable : la partie « modifiable » n'est pas faite. À valider par la comptable. |
| Rappel de rémunération (Q-28) | Non bloquant, une fois par calcul, « L'ajouter » en un appui | Conforme à la recommandation. |
| Navigation | **5 entrées** : Accueil · Calculer · Mes prix · Comprendre · Réglages | docs/15 en prévoit 4 ; « Calculer » reste accessible en permanence pour reprendre son brouillon. |
| Textes de l'onboarding, de Comprendre et des aides | Rédigés ici, **provisoires** | Le fond doit être validé par la comptable, la forme par le guide de rédaction (docs/07). |
| Exemple guidé | Stockages en mémoire séparés | Garantit ONB-04 : rien ne tombe dans « Mes prix » ni dans le brouillon. |
| Sauvegarde | Fichier JSON des prix seulement ; l'import n'écrase jamais | Pas de réglages ni de brouillon dans le fichier. |
| Effacer toutes mes données | Confirmation en tapant « EFFACER » (casse libre) | « Confirmation renforcée » de docs/15 E13. |
| Stockage | `localStorage` derrière une interface | Voir ADR-0012 ; adaptateur natif si Capacitor le purge. |

## Qualité

| Mesure | Valeur |
|---|---|
| Tests | **439** (58 moteur, 381 app), tous verts |
| Couverture du moteur | 100 % (seuil 100 %) |
| Couverture de l'app | 99,0 % instructions, 91,6 % branches, 93,4 % fonctions (seuils 90 / 85 / 90) ; `components/ui/` (shadcn copié) exclu |
| Typage | `tsc` strict sans erreur |
| Poids du build | JS 230 Ko, CSS 9 Ko, polices 47 Ko : **≈ 295 Ko compressés** (cible 500 Ko) |
| Hors ligne | service worker et précache de 21 fichiers générés (non testés sur appareil) |
| Contrastes | jetons de la carte résultat contrôlés par test (`contrast.test.ts`) ; les autres paires restent à contrôler (L-22) |

## Sécurité et données

| Point | État |
|---|---|
| Lecture du stockage | Tout est validé par schéma (zod) ; un contenu abîmé est écarté et signalé, jamais exécuté ni fatal. |
| Import de sauvegarde | Fichier limité à 5 Mo et 1 000 prix, validé élément par élément, ne remplace jamais l'existant ; une clé `__proto__` n'a aucun effet (test). |
| Réseau | Aucun appel pendant l'usage (test : `fetch` jamais appelé à l'export). Aucune permission demandée. |
| Injection | React échappe tout ; aucun `innerHTML`, `eval` ni lien `target="_blank"` dans le code (vérifié). |
| Secrets | Aucun : pas de clé, pas de compte, pas de serveur. |
| Données sur l'appareil | `localStorage` en clair, comme tout stockage web ; l'utilisateur peut tout effacer (E13). Pas de chiffrement : les chiffres d'un petit commerce ne sont pas des données sensibles au sens d'ADR-0006, mais à revoir avec les comptes (V2). |
| **Non fait** : politique de sécurité de contenu (CSP) | Une CSP stricte en production (`script-src 'self'`, `connect-src 'self'`, `object-src 'none'`) est recommandée, mais elle n'a pas été activée : une CSP erronée donnerait une page blanche et il est impossible de la vérifier sans lancer un navigateur (L-31). À essayer avec `just preview-offline`. |

## À faire par le propriétaire (non faisable sans appareil, compte ou regard humain)

1. **Regarder le rendu** : `just dev`. Les règles du projet interdisent de piloter Chrome sans accord ([L-31](17-lecons-apprises.md)) ; **aucun écran n'a été vu en vrai** depuis la migration vers les routes, les feuilles et l'onboarding. Points d'attention : rail fixe centré sur petit écran, densité de la carte résultat à 360 px, barre de navigation à 5 entrées, lisibilité des feuilles basses.
2. **Hors ligne sur appareil (P4)** : suivre [docs/18](18-emballage-natif.md).
3. **Android (P3)** et **partage natif (P8)** sur le Redmi ; **iOS (P5)** demande un Mac ou un service de build et un compte Apple (Q-26).
4. **Fluidité à CPU ×4 (MOV-04)** et Lighthouse (docs/12, conditions de mesure) : non mesurés.
5. **Valider les textes** avec la comptable (fond) et le guide de rédaction (forme), et trancher Q-27 (pourcentage modifiable).
6. **Contrôler les contrastes** des paires de couleurs restantes (pastilles, tuiles, bandeaux) avec `designmd lint` (L-25, demande d'autorisation).
7. **Hébergement et déploiement** (ADR-0009, Q-22) : rien n'est publié.

## Ensuite (lots suivants)

API et back-office B0 (contenu et configuration servis), site public indexé, puis B1 à B3 — [docs/09](09-vision-systeme.md). Le contenu pédagogique, la configuration et le stockage sont déjà versionnés avec schéma pour que ce soit un branchement, pas une refonte (ADR-0005, ADR-0012).
