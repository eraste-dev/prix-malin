import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Emballage natif (docs/12 P3). Le dossier `dist` produit par `pnpm build` est embarqué tel quel : l'app marche
 * hors ligne, sans serveur. Voir docs/18-emballage-natif.md pour les étapes (Android SDK, appareil de test).
 */
const config: CapacitorConfig = {
  appId: "ci.prixmalin.app",
  appName: "Prix Malin",
  webDir: "dist",
  server: { androidScheme: "https" },
};

export default config;
