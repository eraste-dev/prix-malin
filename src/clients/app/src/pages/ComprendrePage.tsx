import { ArrowRight, Tag } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { PageHeader } from "../components/PageHeader";
import { GuidePath } from "../components/GuidePath";
import { ReadingProgress } from "../components/ReadingProgress";
import { ARTICLES, findArticle } from "../content/comprendre";
import { exampleFor } from "../lib/examples";
import { computeOutcome } from "../lib/outcome";
import { pathPosition, PATH_SLUGS, readingMinutes } from "../lib/reading";
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
      <GuidePath articles={ARTICLES} />
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
  const position = pathPosition(article.slug);
  const next = ARTICLES[ARTICLES.findIndex((item) => item.slug === article.slug) + 1];
  const [lead, ...rest] = article.paragraphs;
  return (
    <>
      <ReadingProgress />
      <PageHeader>{article.title}</PageHeader>
      <p className="-mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
        {position !== null && <span>{`Étape ${position} sur ${PATH_SLUGS.length}`}</span>}
        <span>{readingMinutes(article)} min de lecture</span>
      </p>
      <article className="grid gap-4">
        {lead !== undefined && <p className="text-xl leading-relaxed font-light">{lead}</p>}
        {rest.map((paragraph) => (
          <p key={paragraph} className="text-lg leading-relaxed">
            {paragraph}
          </p>
        ))}
        {example !== null && (
          <p data-testid="article-example" className="flex items-start gap-3 rounded-2xl bg-muted p-4 font-semibold">
            <Tag className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            {example}
          </p>
        )}
      </article>
      {next !== undefined && (
        <Link
          to={`/comprendre/${next.slug}`}
          className="flex items-center justify-between gap-4 rounded-3xl bg-card p-5 outline-offset-4 focus-visible:outline-3 focus-visible:outline-ring"
        >
          <span className="grid gap-1">
            <span className="text-muted-foreground">Suivant</span>
            <span className="text-xl font-light">{next.title}</span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
      )}
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
