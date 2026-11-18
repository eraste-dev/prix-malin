import { PageHeader } from "../components/PageHeader";
import { Reveal } from "../components/Reveal";
import { ThemeCards } from "../components/ThemeCards";
import { useThemeContext } from "../lib/themeContext";

/** Réglages (E13). Le thème d'abord ; sauvegarde, aides et données viennent ensuite. */
export function ReglagesPage() {
  const { theme, choose } = useThemeContext();
  return (
    <>
      <PageHeader>Réglages</PageHeader>
      <section aria-label="Thème" className="grid gap-3">
        <Reveal as="h2" beat={0} className="text-xl font-light">
          Thème
        </Reveal>
        <ThemeCards theme={theme} onChange={choose} />
      </section>
    </>
  );
}
