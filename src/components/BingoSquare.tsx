import type { BingoSquareData } from '../types';

interface BingoSquareProps {
  square: BingoSquareData;
  isWinning: boolean;
  onClick: () => void;
}

export function BingoSquare({ square, isWinning, onClick }: BingoSquareProps) {
  const baseClasses =
    'relative flex flex-col items-center justify-center p-1 text-center border-2 rounded-xl transition-all duration-150 select-none min-h-[60px] text-[11px] leading-tight font-semibold';

  const stateClasses = square.isFreeSpace
    ? isWinning
      ? 'bg-pine border-ink text-snow animate-wobble'
      : 'bg-berry border-ink text-snow'
    : square.isMarked
      ? isWinning
        ? 'bg-pine border-ink text-snow animate-wobble'
        : 'bg-marked border-berry text-ink'
      : 'bg-snow border-ink/40 text-ink active:scale-95 active:bg-frost';

  return (
    <button
      onClick={onClick}
      disabled={square.isFreeSpace}
      className={`${baseClasses} ${stateClasses}`}
      aria-pressed={square.isMarked}
      aria-label={square.isFreeSpace ? 'Free space' : square.text}
    >
      {square.isFreeSpace ? (
        <>
          <svg viewBox="0 0 40 32" className="w-9 h-7" aria-hidden="true" strokeLinejoin="round">
            <g stroke="var(--color-ink)" strokeWidth="1.5">
              <path d="M20 2 Q24 4 20 6 Q16 4 20 2 Z" fill="none" />
              <rect x="16.5" y="5.5" width="7" height="4" rx="1" fill="var(--color-snow)" />
              <circle cx="20" cy="20" r="11" fill="var(--color-gold)" />
              <path d="M9.5 17 Q20 21 30.5 17 L30.8 21 Q20 25 9.2 21 Z" fill="var(--color-snow)" />
            </g>
            <circle cx="14" cy="20" r="1.2" fill="var(--color-berry)" />
            <circle cx="20" cy="21.6" r="1.2" fill="var(--color-berry)" />
            <circle cx="26" cy="20" r="1.2" fill="var(--color-berry)" />
            <path d="M14 13 Q16 11 18.5 10.8" fill="none" stroke="var(--color-snow)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="font-display text-xs mt-0.5 drop-shadow-[1px_1px_0_var(--color-ink)]">{square.text}</span>
        </>
      ) : (
        <span className="wrap-break-word hyphens-auto">{square.text}</span>
      )}
      {square.isMarked && !square.isFreeSpace && (
        <span
          className="animate-pop absolute -top-1.5 -right-1.5 w-5 h-5 grid place-items-center rounded-full bg-berry border-2 border-ink text-snow text-[10px]"
          aria-hidden="true"
        >
          ★
        </span>
      )}
    </button>
  );
}
