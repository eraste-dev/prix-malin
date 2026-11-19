import { ChevronRight, Clock, ListChecks, TriangleAlert, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import type { Article } from "../content/comprendre";
import { GUIDE } from "../lib/motion";
import { PATH_SLUGS, readingMinutes } from "../lib/reading";
import { SCENE_CLEAR, useScene } from "../lib/useScene";

const EXTRA_ICONS: Readonly<Record<string, LucideIcon>> = {
  "a-compter": ListChecks,
  "cinq-erreurs": TriangleAlert,
};

/** Une carte d'article : titre léger, résumé, temps de lecture et chevron. Le nom du lien commence par le titre. */
function ArticleCard({ article }: { readonly article: Article }) {
  return (
    <Link
      to={`/comprendre/${article.slug}`}
      data-part="card"
      className="flex items-center justify-between gap-4 rounded-3xl bg-card p-5 outline-offset-4 focus-visible:outline-3 focus-visible:outline-ring"
    >
      <span className="grid min-w-0 gap-1">
        <span className="text-xl font-light">{article.title}</span>
        <span className="text-muted-foreground">{article.summary}</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Clock className="size-4 shrink-0" aria-hidden="true" />
          {readingMinutes(article)} min de lecture
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}

interface GuidePathProps {
  readonly articles: readonly Article[];
}

/**
 * Le chemin du prix : les six premiers articles, numérotés et reliés par un trait par étape, forment la formule du prix ;
 * les autres sont rangés sous « À savoir ». À l'arrivée, le trait se trace, les ronds apparaissent un à un et
 * chaque carte glisse à sa place (DESIGN.md « Comprendre »).
 */
export function GuidePath({ articles }: GuidePathProps) {
  const path = PATH_SLUGS.flatMap((slug) => articles.filter((article) => article.slug === slug));
  const extra = articles.filter((article) => !(PATH_SLUGS as readonly string[]).includes(article.slug));

  const ref = useScene<HTMLDivElement>((_root, part, timeline) => {
    timeline
      .from(
        part("line"),
        {
          scaleY: 0,
          transformOrigin: "50% 0%",
          duration: GUIDE.lineDuration,
          stagger: GUIDE.stepStagger,
          ease: "power2.inOut",
          clearProps: "transform",
        },
        0.1,
      )
      .from(
        part("step"),
        { scale: 0, duration: GUIDE.stepDuration, stagger: GUIDE.stepStagger, ease: "back.out(2)", clearProps: SCENE_CLEAR },
        0,
      )
      .from(
        part("card"),
        {
          x: GUIDE.cardSlidePx,
          opacity: 0,
          duration: GUIDE.stepDuration,
          stagger: GUIDE.stepStagger,
          ease: "power2.out",
          clearProps: SCENE_CLEAR,
        },
        0.05,
      );
  });

  return (
    <div ref={ref} className="grid gap-12">
      <ol className="relative grid list-none gap-4 p-0">
        {path.map((article, index) => (
          <li key={article.slug} className="relative grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3">
            {index < path.length - 1 && (
              <span
                aria-hidden="true"
                data-part="line"
                className="absolute top-10 -bottom-14 left-4 w-0.5 -translate-x-1/2 bg-border"
              />
            )}
            <span
              data-part="step"
              data-testid="path-step"
              className="relative z-10 mt-6 grid size-8 place-items-center rounded-full bg-foreground text-base font-semibold text-background"
            >
              {index + 1}
            </span>
            <ArticleCard article={article} />
          </li>
        ))}
      </ol>

      {extra.length > 0 && (
        <section aria-label="À savoir" className="grid gap-4">
          <h2 className="text-xl font-light">À savoir</h2>
          <ul className="grid list-none gap-3 p-0">
            {extra.map((article) => {
              const Icon = EXTRA_ICONS[article.slug] ?? ListChecks;
              return (
                <li key={article.slug} className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3">
                  <span className="mt-6 grid size-8 place-items-center rounded-full bg-muted text-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <ArticleCard article={article} />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
