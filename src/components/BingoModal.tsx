import { useEffect, useRef, useState } from 'react';
import type { BingoLine } from '../types';

const WIN_COPY: Record<BingoLine['type'], string> = {
  row: 'You finished a whole row.',
  column: 'You stacked up a whole column.',
  diagonal: 'You cut right across the diagonal.',
  corners: 'You hit all four corners.',
};

interface BingoModalProps {
  lineType: BingoLine['type'];
  onDismiss: () => void;
  onNewCard: () => void;
}

export function BingoModal({ lineType, onDismiss, onNewCard }: BingoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [opener] = useState(() => document.activeElement as HTMLElement | null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal?.();
    return () => opener?.focus();
  }, [opener]);

  // The delayed entrance lets the winning line wobble on the board before the modal covers it.
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="bingo-title"
      aria-describedby="bingo-desc"
      onClose={onDismiss}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
      className="animate-pop [animation-delay:900ms] sunburst m-auto p-0 overflow-hidden border-2 border-ink rounded-3xl max-w-xs w-[calc(100%-2rem)] text-center hard-shadow backdrop:bg-ink/70 backdrop:animate-fade backdrop:[animation-delay:900ms]"
    >
      <div className="stripes-70s h-4" aria-hidden="true" />
      <div className="p-6">
        <div className="text-6xl mb-3 animate-wobble [animation-delay:1100ms]" aria-hidden="true">🎄</div>
        <h2
          id="bingo-title"
          className="font-display text-4xl leading-none text-gold mb-2 drop-shadow-[2px_2px_0_var(--color-ink)]"
        >
          Wicked Good BINGO!
        </h2>
        <p id="bingo-desc" className="text-snow/85 italic mb-6">
          {WIN_COPY[lineType]} Have a cookie.
        </p>

        <button
          onClick={() => dialogRef.current?.close()}
          className="w-full bg-berry text-snow font-display text-xl py-3 px-6 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-snow"
        >
          Back to the Table
        </button>
        <button
          onClick={onNewCard}
          className="w-full mt-3 bg-snow text-ink font-display text-lg py-2 px-6 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-snow"
        >
          Deal a New Card
        </button>
      </div>
    </dialog>
  );
}
