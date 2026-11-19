import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

const TERRACOTTA = "#B84A2E";

/** Génère les icônes de l'app (PWA et écran d'accueil) depuis `public/icon.svg` : `pnpm icons`. */
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { background: TERRACOTTA, fit: "contain" },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { background: TERRACOTTA, fit: "contain" },
    },
  },
  images: ["public/icon.svg"],
});
