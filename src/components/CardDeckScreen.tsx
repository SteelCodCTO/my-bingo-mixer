import { useState, useRef, type PointerEvent, type TransitionEvent } from 'react';
import { LobsterMascot } from './LobsterMascot';

type CardResult = 'found' | 'skipped';

interface CardDeckScreenProps {
  currentCard: string | null;
  cardKey: number;
  deckSize: number;
  deckDone: boolean;
  foundCards: string[];
  foundCount: number;
  skippedCount: number;
  mascotLine: string;
  mascotKey: number;
  onDraw: () => void;
  onResolve: (result: CardResult) => void;
  onReshuffle: () => void;
  onBack: () => void;
}

const SWIPE_THRESHOLD = 90;
const FLICK_MIN_DISTANCE = 40;
const FLICK_MIN_VELOCITY = 0.5; // px per ms

export function CardDeckScreen({
  currentCard,
  cardKey,
  deckSize,
  deckDone,
  foundCards,
  foundCount,
  skippedCount,
  mascotLine,
  mascotKey,
  onDraw,
  onResolve,
  onReshuffle,
  onBack,
}: CardDeckScreenProps) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exitDir, setExitDir] = useState<1 | -1 | null>(null);
  const [snapping, setSnapping] = useState(false);
  const startX = useRef(0);
  const lastMove = useRef({ x: 0, t: 0, v: 0 });

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!currentCard || exitDir) return;
    startX.current = event.clientX;
    lastMove.current = { x: event.clientX, t: event.timeStamp, v: 0 };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const { x, t } = lastMove.current;
    const dt = event.timeStamp - t;
    if (dt > 0) lastMove.current = { x: event.clientX, t: event.timeStamp, v: (event.clientX - x) / dt };
    setDragX(event.clientX - startX.current);
  };

  const handlePointerEnd = () => {
    if (!dragging) return;
    setDragging(false);
    const { v } = lastMove.current;
    const flicked = Math.abs(dragX) >= FLICK_MIN_DISTANCE && Math.abs(v) >= FLICK_MIN_VELOCITY && Math.sign(v) === Math.sign(dragX);
    if (Math.abs(dragX) > SWIPE_THRESHOLD || flicked) {
      const dir = dragX > 0 ? 1 : -1;
      setExitDir(dir);
      setDragX(dir * window.innerWidth);
    } else {
      setDragX(0);
    }
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (!exitDir || event.target !== event.currentTarget) return;
    onResolve(exitDir > 0 ? 'found' : 'skipped');
    setExitDir(null);
    // Jump back to center without animating; the next card flips in instead.
    setSnapping(true);
    setDragX(0);
    requestAnimationFrame(() => requestAnimationFrame(() => setSnapping(false)));
  };

  const handlePointerCancel = () => {
    setDragging(false);
    setDragX(0);
  };

  const swipeStrength = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);
  const cardsDealt = Math.min(cardKey + 1, deckSize);

  const helperText = deckDone
    ? null
    : currentCard
      ? "Swipe right if you found 'em, left to pass."
      : 'Tap the deck to draw your first card.';

  return (
    <div className="sunburst flex flex-col min-h-full overflow-x-hidden">
      <div className="stripes-70s h-3 shrink-0" aria-hidden="true" />
      <header className="flex items-center justify-between px-3 py-2 border-b-2 border-ink bg-snow/80">
        <button
          onClick={onBack}
          className="min-h-11 text-ink text-sm font-semibold px-4 rounded-full border-2 border-ink bg-frost active:bg-gold"
        >
          <span aria-hidden="true">← </span>Back
        </button>
        <h1 className="font-display text-xl text-ink">
          Jingle <span className="text-berry">Deck</span>
        </h1>
        <p className="w-[4.5rem] text-right text-xs font-bold text-ink tabular-nums">
          {deckSize > 0 && !deckDone && cardKey >= 0 && (
            <>
              <span className="sr-only">Card </span>
              {cardsDealt}/{deckSize}
            </>
          )}
        </p>
      </header>

      {helperText && (
        <p className="text-center text-snow/85 italic text-sm py-2 px-4">{helperText}</p>
      )}

      <main className="flex-1 flex flex-col landscape:flex-row items-center justify-center gap-4 landscape:gap-8 p-4">
        {deckDone ? (
          <section
            aria-labelledby="deck-done-title"
            className="animate-pop motion-reduce:animate-none w-full max-w-xs bg-snow border-2 border-ink rounded-3xl hard-shadow p-5 text-center"
          >
            <span className="inline-block bg-pine text-snow text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-3">
              Deck done
            </span>
            <h2 id="deck-done-title" className="font-display text-3xl leading-none text-berry mb-2">
              Wicked good mingling!
            </h2>
            <p className="text-sm italic text-ink/80 mb-4">
              You found {foundCount} {foundCount === 1 ? 'person' : 'people'} and passed on {skippedCount}.
            </p>
            {foundCards.length > 0 && (
              <ul className="text-left text-sm max-h-40 overflow-y-auto bg-frost border-2 border-ink rounded-2xl p-3 mb-4 space-y-1">
                {foundCards.map((card) => (
                  <li key={card}>
                    <span className="text-berry mr-1" aria-hidden="true">★</span>
                    {card}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={onReshuffle}
              className="w-full bg-berry text-snow font-display text-xl py-3 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Reshuffle
            </button>
          </section>
        ) : (
          <div className="relative @container w-[min(100%,20rem,37.5vh)] landscape:w-[min(20rem,calc((100dvh-10rem)*0.75))] aspect-[3/4] shrink-0">
            {/* Stacked deck edges peeking out behind the top card */}
            <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-3 rounded-3xl border-2 border-ink bg-ruby" aria-hidden="true" />
            <div className="absolute inset-0 translate-x-1 translate-y-1 -rotate-2 rounded-3xl border-2 border-ink bg-berry" aria-hidden="true" />

            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerCancel}
              onTransitionEnd={handleTransitionEnd}
              style={{ transform: `translateX(${dragX}px) rotate(${dragX / 15}deg)` }}
              className={`absolute inset-0 touch-pan-y select-none ${dragging || snapping ? '' : 'transition-transform duration-200'} ${currentCard ? 'cursor-grab active:cursor-grabbing' : ''}`}
            >
            {currentCard ? (
              <div
                key={cardKey}
                aria-hidden="true"
                className="absolute inset-0 rounded-3xl border-2 border-ink hard-shadow overflow-hidden bg-snow animate-flip motion-reduce:animate-none"
              >
                <div className="h-full flex flex-col items-center justify-between p-[6cqi] text-center">
                  <span className="self-start font-display text-berry text-2xl leading-none">★</span>
                  <div>
                    <span className="inline-block bg-pine text-snow text-[clamp(0.6rem,4cqi,0.75rem)] font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-[5cqi]">
                      Find someone who
                    </span>
                    <p className="font-display text-[clamp(1rem,9.5cqi,1.875rem)] leading-tight text-ink text-balance break-words">{currentCard}</p>
                  </div>
                  <span className="self-end font-display text-berry text-2xl leading-none rotate-180">★</span>
                </div>

                {dragX > 0 && (
                  <span
                    style={{ opacity: swipeStrength }}
                    className="absolute top-6 left-4 -rotate-12 font-display text-2xl text-pine border-4 border-pine rounded-xl px-3 py-1 bg-snow"
                  >
                    Found 'em!
                  </span>
                )}
                {dragX < 0 && (
                  <span
                    style={{ opacity: swipeStrength }}
                    className="absolute top-6 right-4 rotate-12 font-display text-2xl text-ruby border-4 border-ruby rounded-xl px-3 py-1 bg-snow"
                  >
                    Pass
                  </span>
                )}
              </div>
            ) : (
              <button
                key={cardKey}
                onClick={onDraw}
                aria-label="Draw a card"
                className="absolute inset-0 rounded-3xl border-2 border-ink hard-shadow overflow-hidden bg-berry transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-snow"
              >
                <div className="h-full p-3">
                  <div className="h-full rounded-2xl border-2 border-snow/70 stripes-70s flex items-center justify-center">
                    <div className="bg-snow border-2 border-ink rounded-2xl px-5 py-4 hard-shadow rotate-[-3deg]">
                      <p className="font-display text-3xl text-berry leading-none">Tap to</p>
                      <p className="font-display text-3xl text-ink leading-none">draw!</p>
                    </div>
                  </div>
                </div>
              </button>
            )}
            </div>
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {currentCard ? `Find someone who ${currentCard}` : ''}
        </p>

        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          {!deckDone && (
            <p className="flex gap-2 text-xs font-bold uppercase tracking-widest">
              <span className="bg-pine text-snow rounded-full px-3 py-1 border-2 border-ink">Found {foundCount}</span>
              <span className="bg-ruby text-snow rounded-full px-3 py-1 border-2 border-ink">Passed {skippedCount}</span>
            </p>
          )}

          {currentCard && (
            <div className="animate-rise flex gap-3 w-full">
              <button
                onClick={() => onResolve('skipped')}
                disabled={exitDir !== null}
                className="flex-1 bg-ruby text-snow font-display text-lg py-3 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-snow"
              >
                <span aria-hidden="true">← </span>Pass
              </button>
              <button
                // Drawing unmounts the deck button, so hand focus to the main action.
                autoFocus
                onClick={() => onResolve('found')}
                disabled={exitDir !== null}
                className="flex-1 bg-pine text-snow font-display text-lg py-3 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-snow"
              >
                Found 'em<span aria-hidden="true"> →</span>
              </button>
            </div>
          )}

          <LobsterMascot line={mascotLine} lineKey={mascotKey} />
        </div>
      </main>

      <div className="stripes-70s h-3 shrink-0" aria-hidden="true" />
    </div>
  );
}
