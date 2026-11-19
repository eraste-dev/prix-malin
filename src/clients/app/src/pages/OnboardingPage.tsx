import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Fragment, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { SceneLock } from "../components/SceneLock";
import { SceneMarket } from "../components/SceneMarket";
import { SceneQuestions } from "../components/SceneQuestions";
import { ONBOARDING_CARDS, type OnboardingCard } from "../content/onboarding";
import { ONBOARD, motionAllowed } from "../lib/motion";
import { useStores } from "../lib/storeContext";

const SCENES: Readonly<Record<OnboardingCard["scene"], () => ReactNode>> = {
  market: () => <SceneMarket />,
  questions: () => <SceneQuestions />,
  lock: () => <SceneLock />,
};

/** Largeurs du tiret de progression, en px : le tiret actif (w-8) et les autres (w-2). */
const DASH_ACTIVE_PX = 32;
const DASH_IDLE_PX = 8;
/** Distance horizontale minimale, en px, pour qu'un glissement compte comme un changement de carte. */
const SWIPE_MIN_PX = 50;

/** Le titre entre mot à mot ; le texte reste lu d'un seul tenant (les espaces sont dans le DOM). */
function Words({ text }: { readonly text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, position) => (
        <Fragment key={`${position}-${word}`}>
          <span data-word className="inline-block">
            {word}
          </span>
          {position < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

/** Présentation en trois cartes illustrées (docs/14) : courte, passable à tout moment, sans rien demander. */
export function OnboardingPage() {
  const stores = useStores();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const direction = useRef(1);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const previous = useRef(0);
  const card = ONBOARDING_CARDS[index] ?? ONBOARDING_CARDS[0];
  const last = index === ONBOARDING_CARDS.length - 1;

  // À chaque carte : la scène glisse dans le sens du parcours, le titre entre mot à mot, puis le message ;
  // les tirets de progression s'allongent et se raccourcissent. La scène joue ensuite sa propre chorégraphie.
  useGSAP(
    () => {
      const from = previous.current;
      previous.current = index;
      if (!motionAllowed()) return;
      const select = gsap.utils.selector(mainRef);
      gsap.from(select("[data-scene]"), {
        x: direction.current * ONBOARD.sceneSlidePx,
        opacity: 0,
        duration: ONBOARD.sceneDuration,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
      gsap.from(select("[data-word]"), {
        y: 20,
        opacity: 0,
        duration: ONBOARD.wordDuration,
        delay: ONBOARD.textDelay,
        stagger: ONBOARD.wordStagger,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
      gsap.from(select("[data-message]"), {
        y: 12,
        opacity: 0,
        duration: ONBOARD.wordDuration,
        delay: ONBOARD.messageDelay,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
      if (from === index) return;
      const dashes = select("[data-dash]");
      gsap.from(dashes[index] ?? [], { width: DASH_IDLE_PX, duration: ONBOARD.dashDuration, ease: "power2.out", clearProps: "width" });
      gsap.from(dashes[from] ?? [], { width: DASH_ACTIVE_PX, duration: ONBOARD.dashDuration, ease: "power2.out", clearProps: "width" });
    },
    { scope: mainRef, dependencies: [index], revertOnUpdate: true },
  );

  if (card === undefined) return null;
  const Scene = SCENES[card.scene];

  function go(target: number): void {
    direction.current = target > index ? 1 : -1;
    setIndex(target);
  }

  function onPointerDown(event: PointerEvent<HTMLElement>): void {
    swipeStart.current = { x: event.clientX, y: event.clientY };
  }

  /** Un glissement surtout horizontal et assez long change de carte ; le défilement vertical reste libre. */
  function onPointerUp(event: PointerEvent<HTMLElement>): void {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const target = dx < 0 ? index + 1 : index - 1;
    if (target >= 0 && target < ONBOARDING_CARDS.length) go(target);
  }

  function skip(): void {
    stores.settings.getState().markOnboardingSeen();
    void navigate("/", { replace: true });
  }

  function startOwn(): void {
    stores.settings.getState().markOnboardingSeen();
    stores.calc.getState().reset();
    void navigate("/calculer", { replace: true });
  }

  return (
    <main
      ref={mainRef}
      data-testid="onboarding-swipe"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipeStart.current = null;
      }}
      className="mx-auto touch-pan-y select-none grid min-h-dvh max-w-xl grid-rows-[auto_1fr_auto_auto] gap-6 px-5 pt-6 pb-8"
    >
      <div className="flex h-12 justify-end">
        {last ? null : (
          <Button type="button" variant="ghost" onClick={skip} className="h-12 rounded-full px-5 text-base">
            Passer
          </Button>
        )}
      </div>

      <div className="grid min-h-56 place-items-center overflow-hidden rounded-3xl bg-muted">
        <div key={index} data-scene className="grid size-full place-items-center">
          {Scene()}
        </div>
      </div>

      <div className="grid content-start justify-items-start gap-3">
        <h1 key={`title-${index}`} className="text-4xl leading-tight font-light">
          <Words text={card.title} />
        </h1>
        <p key={`message-${index}`} data-message className="text-xl text-muted-foreground">
          {card.message}
        </p>
      </div>

      <div className="grid gap-4">
        <ol aria-label={`Carte ${index + 1} sur ${ONBOARDING_CARDS.length}`} className="-mx-1 flex list-none p-0">
          {ONBOARDING_CARDS.map((item, position) => (
            <li key={item.title}>
              <button
                type="button"
                aria-label={`Aller à la carte ${position + 1}`}
                aria-current={position === index ? "step" : undefined}
                onClick={() => go(position)}
                className="flex h-11 cursor-pointer items-center px-1 focus-visible:outline-3 focus-visible:outline-ring"
              >
                <span
                  data-dash
                  className={
                    position === index ? "h-2 w-8 rounded-full bg-foreground" : "h-2 w-2 rounded-full bg-border"
                  }
                />
              </button>
            </li>
          ))}
        </ol>

        <div role="group" aria-label="Navigation de la présentation" className="flex items-center justify-between gap-3">
          {index > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => go(index - 1)}
              className="h-12 rounded-full bg-muted px-5 text-base hover:bg-muted/70"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
              Retour
            </Button>
          ) : (
            <span />
          )}
          {last ? (
            <Button type="button" onClick={startOwn} className="h-12 rounded-full px-6 text-base">
              Commencer
            </Button>
          ) : (
            <Button type="button" onClick={() => go(index + 1)} className="h-12 rounded-full px-6 text-base">
              Suivant
              <ArrowRight className="size-5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
