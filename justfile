# Prix Malin - raccourcis CLI. Le workspace pnpm est dans src/.
# Usage : `just` (ou `just --list`) liste les recettes.

set windows-shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-Command"]

pnpm :="pnpm --dir src"
app := "@prix-malin/app"
domain := "@prix-malin/domain"

# Liste les commandes
default:
    @just --list

# Installe les dependances
install:
    {{pnpm}} install

# Lance l'app publique (Vite, http://localhost:5173)
dev:
    {{pnpm}} --filter {{app}} dev

# Construit l'app (typecheck + vite build)
build:
    {{pnpm}} --filter {{app}} build

# Sert le build de l'app
preview:
    {{pnpm}} --filter {{app}} preview

# Lance tous les tests
test:
    {{pnpm}} test

# Tests de l'app en mode watch
test-watch:
    {{pnpm}} --filter {{app}} test:watch

# Couverture : moteur (seuil 100 %) puis app (seuils 90 / 85 / 90 / 90)
coverage:
    {{pnpm}} --filter {{domain}} test:coverage
    pnpm --dir src/clients/app test:coverage

# Genere les icones de l'app depuis public/icon.svg
icons:
    pnpm --dir src/clients/app icons

# Previsualise le build de production (service worker actif : test du hors ligne)
preview-offline:
    pnpm --dir src/clients/app build
    pnpm --dir src/clients/app preview

# Verifie les types de tous les paquets
typecheck:
    {{pnpm}} typecheck

# Typecheck + tests
check: typecheck test
