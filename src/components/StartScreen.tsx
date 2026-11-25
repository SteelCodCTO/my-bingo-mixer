interface StartScreenProps {
  onStart: () => void;
  onStartDeck: () => void;
}

export function StartScreen({ onStart, onStartDeck }: StartScreenProps) {
  return (
    <div className="sunburst flex flex-col min-h-full">
      <div className="stripes-70s h-6 shrink-0" aria-hidden="true" />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <p className="animate-rise text-xs font-bold uppercase tracking-[0.3em] text-snow mb-3">
            Christmastime in Boston
          </p>
          <h1 className="animate-rise [animation-delay:100ms] font-display text-5xl leading-[0.95] text-snow mb-2 drop-shadow-[3px_3px_0_var(--color-ink)]">
            Wicked Good
            <br />
            <span className="text-gold">Jingle</span> Bingo
          </h1>
          <p className="animate-rise [animation-delay:200ms] text-lg italic text-snow/85 mb-8">
            Find your people. Pass the cocoa.
          </p>

          <div className="animate-rise [animation-delay:300ms] relative bg-frost border-2 border-ink rounded-2xl p-5 hard-shadow mb-8 text-left">
            <span className="absolute -top-3 left-5 bg-berry text-snow text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              The Recipe
            </span>
            <ol className="text-ink text-sm space-y-2 mt-2 list-none">
              <li><span className="font-display text-berry mr-2">1.</span>Mingle and find someone who matches a square</li>
              <li><span className="font-display text-berry mr-2">2.</span>Tap the square to stamp it</li>
              <li><span className="font-display text-berry mr-2">3.</span>Get 5 in a row or all 4 corners for a wicked good BINGO!</li>
            </ol>
          </div>

          <button
            onClick={onStart}
            className="animate-rise [animation-delay:400ms] w-full bg-berry text-snow font-display text-2xl py-4 px-8 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-snow"
          >
            Pass the Bingo
          </button>

          <button
            onClick={onStartDeck}
            className="animate-rise [animation-delay:500ms] w-full mt-4 bg-snow text-ink font-display text-xl py-3 px-8 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-snow"
          >
            Shuffle the Deck
          </button>
        </div>
      </main>

      <div className="stripes-70s h-6 shrink-0" aria-hidden="true" />
    </div>
  );
}
