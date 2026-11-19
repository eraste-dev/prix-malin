import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

const { version } = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf8")) as {
  version: string;
};

/** Couleurs de la marque (docs/ui-ux/DESIGN.md) : le fond sable pour le thème clair. */
const BACKGROUND = "#F6EFE7";

export default defineConfig(({ mode }) => {
  const testing = mode === "test";
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Hors ligne (ADR-0001) : tout le code et les polices sont mis en cache ; la mise à jour est proposée, jamais imposée.
      ...(testing
        ? []
        : [
            VitePWA({
              registerType: "prompt" as const,
              includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png", "icon.svg"],
              manifest: {
                name: "Prix Malin",
                short_name: "Prix Malin",
                description: "Trouvez le bon prix de vente de vos produits, même sans internet.",
                lang: "fr",
                start_url: ".",
                scope: ".",
                display: "standalone" as const,
                orientation: "portrait" as const,
                background_color: BACKGROUND,
                theme_color: BACKGROUND,
                icons: [
                  { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
                  { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
                  { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
                  { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
                ],
              },
              workbox: {
                globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
                cleanupOutdatedCaches: true,
                navigateFallback: "index.html",
              },
            }),
          ]),
    ],
    resolve: {
      // Une seule copie de React, sinon les hooks échouent (« Invalid hook call ») selon l'ordre de chargement.
      dedupe: ["react", "react-dom"],
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        // Le module virtuel du service worker n'existe pas sous test : un double contrôlable le remplace.
        ...(testing
          ? { "virtual:pwa-register/react": path.resolve(import.meta.dirname, "tests/stubs/pwa-register-react.ts") }
          : {}),
      },
    },
    // La version vient de package.json : une seule source (Réglages > À propos).
    define: { __APP_VERSION__: JSON.stringify(version) },
    build: {
      target: "es2022",
      sourcemap: false,
    },
    test: {
      // Ces paquets sont traités comme le code de l'app : une seule instance de React, quel que soit l'ordre
      // de chargement (sinon « Invalid hook call » quand on lance un seul fichier de test).
      server: { deps: { inline: [/react-router/, /react-error-boundary/, /sonner/, /zustand/, /@gsap\/react/, /radix-ui/, /@radix-ui/] } },
      environment: "jsdom",
      include: ["tests/**/*.test.{ts,tsx}"],
      setupFiles: ["tests/setup.ts"],
      coverage: {
        provider: "v8" as const,
        include: ["src/**/*.{ts,tsx}"],
        // `components/ui/` est du code shadcn copié tel quel (L-01) : ses sous-composants inutilisés fausseraient la mesure.
        exclude: ["src/main.tsx", "src/vite-env.d.ts", "src/components/ui/**"],
        thresholds: { statements: 90, branches: 85, functions: 90, lines: 90 },
      },
    },
  };
});
