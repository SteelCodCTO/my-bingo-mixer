import { useState, useRef, type PointerEvent } from 'react';

type CardResult = 'found' | 'skipped';

interface CardDeckScreenProps {
  currentCard: string | null;
  cardKey: number;
  foundCount: number;
  skippedCount: number;
  onDraw: () => void;
  onResolve: (result: CardResult) => void;
  onBack: () => void;
}

const SWIPE_THRESHOLD = 90;

export function CardDeckScreen({
  currentCard,
  cardKey,
  foundCount,
  skippedCount,
  onDraw,
  onResolve,
  onBack,
}: CardDeckScreenProps) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!currentCard) return;
    startX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragX(event.clientX - startX.current);
  };

  const handlePointerEnd = () => {
    if (!dragging) return;
    setDragging(false);
    setDragX(0);
    if (dragX > SWIPE_THRESHOLD) onResolve('found');
    else if (dragX < -SWIPE_THRESHOLD) onResolve('skipped');
  };

  const swipeStrength = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);

  return (
    <div className="sunburst flex flex-col min-h-full">
      <div className="stripes-70s h-3 shrink-0" aria-hidden="true" />
      <header className="flex items-center justify-between px-3 py-2 border-b-2 border-ink bg-snow/80">
        <button
          onClick={onBack}
          className="text-ink text-sm font-semibold px-3 py-1.5 rounded-full border-2 border-ink bg-frost active:bg-gold"
        >
          ← Back
        </button>
        <h1 className="font-display text-xl text-ink">
          Jingle <span className="text-berry">Deck</span>
        </h1>
        <div className="w-[4.5rem]" aria-hidden="true" />
      </header>

      <p className="text-center text-snow/85 italic text-sm py-2 px-4">
        Tap to draw. Swipe right if you found 'em, left to skip.
      </p>

      <main className="flex-1 flex flex-col items-center justify-center gap-5 p-6">
        <p className="flex gap-2 text-xs font-bold uppercase tracking-widest">
          <span className="bg-pine text-snow rounded-full px-3 py-1 border-2 border-ink">Found {foundCount}</span>
          <span className="bg-ruby text-snow rounded-full px-3 py-1 border-2 border-ink">Skipped {skippedCount}</span>
        </p>

        <div className="relative w-[min(100%,20rem,37.5vh)] aspect-[3/4]">
          {/* Stacked deck edges peeking out behind the top card */}
          <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-3 rounded-3xl border-2 border-ink bg-ruby" aria-hidden="true" />
          <div className="absolute inset-0 translate-x-1 translate-y-1 -rotate-2 rounded-3xl border-2 border-ink bg-berry" aria-hidden="true" />

          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            style={{ transform: `translateX(${dragX}px) rotate(${dragX / 15}deg)` }}
            className={`absolute inset-0 touch-pan-y select-none ${dragging ? '' : 'transition-transform duration-200'} ${currentCard ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
          {currentCard ? (
            <div
              key={cardKey}
              className="absolute inset-0 rounded-3xl border-2 border-ink hard-shadow overflow-hidden bg-snow animate-flip motion-reduce:animate-none"
            >
              <div className="h-full flex flex-col items-center justify-between p-5 text-center">
                <span className="self-start font-display text-berry text-2xl leading-none" aria-hidden="true">★</span>
                <div>
                  <span className="inline-block bg-pine text-snow text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4">
                    Find someone who
                  </span>
                  <p className="font-display text-[clamp(1.25rem,7vw,1.875rem)] leading-tight text-ink break-words">{currentCard}</p>
                </div>
                <span className="self-end font-display text-berry text-2xl leading-none rotate-180" aria-hidden="true">★</span>
              </div>

              {dragX > 0 && (
                <span
                  style={{ opacity: swipeStrength }}
                  className="absolute top-6 left-4 -rotate-12 font-display text-2xl text-pine border-4 border-pine rounded-xl px-3 py-1 bg-snow"
                  aria-hidden="true"
                >
                  Found 'em!
                </span>
              )}
              {dragX < 0 && (
                <span
                  style={{ opacity: swipeStrength }}
                  className="absolute top-6 right-4 rotate-12 font-display text-2xl text-ruby border-4 border-ruby rounded-xl px-3 py-1 bg-snow"
                  aria-hidden="true"
                >
                  No dice
                </span>
              )}
            </div>
          ) : (
            <button
              key={cardKey}
              onClick={onDraw}
              aria-label="Draw a card"
              className="absolute inset-0 rounded-3xl border-2 border-ink hard-shadow overflow-hidden bg-berry transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
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

        <p className="sr-only" aria-live="polite">
          {currentCard ? `Find someone who ${currentCard}` : ''}
        </p>

        {currentCard && (
          <div className="animate-rise flex gap-3 w-full max-w-xs">
            <button
              onClick={() => onResolve('skipped')}
              aria-label="Skip, didn't find anyone"
              className="flex-1 bg-ruby text-snow font-display text-lg py-3 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <span aria-hidden="true">← </span>Skip
            </button>
            <button
              onClick={() => onResolve('found')}
              aria-label="Found someone"
              className="flex-1 bg-pine text-snow font-display text-lg py-3 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Found 'em<span aria-hidden="true"> →</span>
            </button>
          </div>
        )}
      </main>

      <div className="stripes-70s h-3 shrink-0" aria-hidden="true" />
    </div>
  );
}
