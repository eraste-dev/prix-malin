import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { PageHeader } from "../components/PageHeader";
import { Reveal } from "../components/Reveal";
import { ARTICLES, findArticle } from "../content/comprendre";
import { exampleFor } from "../lib/examples";
import { computeOutcome } from "../lib/outcome";
import { useCalc } from "../lib/storeContext";

/** Comprendre (E11) : la liste des articles, ou un article quand l'adresse en nomme un. */
export function ComprendrePage() {
  const { slug } = useParams();
  return slug === undefined ? <ArticleList /> : <ArticleView slug={slug} />;
}

function ArticleList() {
  return (
    <>
      <PageHeader>Comprendre</PageHeader>
      <ul className="grid list-none gap-3 p-0">
        {ARTICLES.map((article, index) => (
          <Reveal as="li" key={article.slug} beat={Math.min(index, 5)}>
            <Link
              to={`/comprendre/${article.slug}`}
              className="flex items-center justify-between gap-4 rounded-3xl bg-card p-6 outline-offset-4 focus-visible:outline-3 focus-visible:outline-ring"
            >
              <span className="grid gap-1">
                <span className="text-xl font-light">{article.title}</span>
                <span className="text-muted-foreground">{article.summary}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </Reveal>
        ))}
      </ul>
    </>
  );
}

function ArticleView({ slug }: { readonly slug: string }) {
  const article = findArticle(slug);
  const calcul = useCalc((state) => state.calcul);
  // L'exemple reprend le calcul de l'utilisateur quand il aboutit à un prix, sinon un exemple générique.
  const data = useMemo(() => {
    const outcome = computeOutcome({ ...calcul, modeResultat: "conseille" });
    return "data" in outcome ? outcome.data : null;
  }, [calcul]);

  if (article === undefined) {
    return (
      <>
        <PageHeader>Comprendre</PageHeader>
        <p>Cet article n'existe pas.</p>
        <BackLink />
      </>
    );
  }

  const example = exampleFor(article.slug, data);
  return (
    <>
      <PageHeader>{article.title}</PageHeader>
      <article className="grid gap-4">
        {article.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-lg leading-relaxed">
            {paragraph}
          </p>
        ))}
        {example !== null && (
          <p data-testid="article-example" className="rounded-2xl bg-muted p-4 font-semibold">
            {example}
          </p>
        )}
      </article>
      <BackLink />
    </>
  );
}

function BackLink() {
  return (
    <Link
      to="/comprendre"
      className="w-fit rounded-md text-muted-foreground underline underline-offset-4 outline-offset-4 focus-visible:outline-3 focus-visible:outline-ring"
    >
      Tous les articles
    </Link>
  );
}
