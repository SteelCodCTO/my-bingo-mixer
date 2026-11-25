import { useEffect, useRef, useState } from 'react';

interface BingoModalProps {
  onDismiss: () => void;
}

export function BingoModal({ onDismiss }: BingoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [opener] = useState(() => document.activeElement as HTMLElement | null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal?.();
    return () => opener?.focus();
  }, [opener]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="bingo-title"
      onClose={onDismiss}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
      className="animate-pop sunburst m-auto p-0 overflow-hidden border-2 border-ink rounded-3xl max-w-xs w-[calc(100%-2rem)] text-center hard-shadow backdrop:bg-ink/70"
    >
      <div className="stripes-70s h-4" aria-hidden="true" />
      <div className="p-6">
        <div className="text-6xl mb-3 animate-wobble" aria-hidden="true">🎄</div>
        <h2
          id="bingo-title"
          className="font-display text-4xl leading-none text-gold mb-2 drop-shadow-[2px_2px_0_var(--color-ink)]"
        >
          Wicked Good BINGO!
        </h2>
        <p className="text-snow/85 italic mb-6">You finished a whole row. Have a cookie.</p>

        <button
          onClick={() => dialogRef.current?.close()}
          className="w-full bg-berry text-snow font-display text-xl py-3 px-6 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Back to the Table
        </button>
      </div>
    </dialog>
  );
}
