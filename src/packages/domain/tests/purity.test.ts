import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "..", "src");
const IMPORT_RE = /(?:import|export)[^'"]*?from\s*["']([^"']+)["']/g;

describe("pureté du domaine (ADR-0003)", () => {
  it("n'importe que des fichiers du domaine, aucune dépendance externe", () => {
    const offenders: string[] = [];
    for (const file of readdirSync(SRC).filter((f) => f.endsWith(".ts"))) {
      const content = readFileSync(join(SRC, file), "utf8");
      for (const match of content.matchAll(IMPORT_RE)) {
        const spec = match[1] ?? "";
        if (!spec.startsWith("./")) offenders.push(`${file} → ${spec}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("n'utilise ni l'UI, ni le réseau, ni le stockage, ni le hasard", () => {
    const forbidden = /\b(document|window|localStorage|fetch|XMLHttpRequest|Math\.random|Date\.now)\b/;
    for (const file of readdirSync(SRC).filter((f) => f.endsWith(".ts"))) {
      expect(readFileSync(join(SRC, file), "utf8"), file).not.toMatch(forbidden);
    }
  });
});
