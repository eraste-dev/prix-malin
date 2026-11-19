import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

const { version } = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf8")) as {
  version: string;
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  // La version vient de package.json : une seule source (Réglages > À propos).
  define: { __APP_VERSION__: JSON.stringify(version) },
  build: {
    target: "es2022",
    sourcemap: false,
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/vite-env.d.ts"],
      thresholds: { statements: 90, branches: 85, functions: 90, lines: 90 },
    },
  },
});
