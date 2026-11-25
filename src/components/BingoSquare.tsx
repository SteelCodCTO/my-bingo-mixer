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
      ? 'bg-cranberry border-bark text-cream animate-wobble'
      : 'bg-pumpkin border-bark text-cream'
    : square.isMarked
      ? isWinning
        ? 'bg-cranberry border-bark text-cream animate-wobble'
        : 'bg-marked border-pumpkin text-bark'
      : 'bg-cream border-bark/40 text-bark active:scale-95 active:bg-parchment';

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
            <g stroke="var(--color-bark)" strokeWidth="1.5">
              <path d="M20 22 L4 14 A17 17 0 0 1 9 5 Z" fill="var(--color-mustard)" />
              <path d="M20 22 L9 5 A17 17 0 0 1 20 3 Z" fill="var(--color-cranberry)" />
              <path d="M20 22 L20 3 A17 17 0 0 1 31 5 Z" fill="var(--color-cream)" />
              <path d="M20 22 L31 5 A17 17 0 0 1 36 14 Z" fill="var(--color-harvest)" />
              <ellipse cx="20" cy="22" rx="8" ry="8" fill="var(--color-bark)" />
              <circle cx="20" cy="13" r="4" fill="var(--color-parchment)" />
            </g>
            <circle cx="18.6" cy="12.4" r="0.9" fill="var(--color-bark)" />
            <circle cx="21.4" cy="12.4" r="0.9" fill="var(--color-bark)" />
            <path d="M19 14 L21 14 L20 15.8 Z" fill="var(--color-mustard)" />
            <path d="M20.8 14.6 Q22 17 20.6 18" fill="none" stroke="var(--color-cranberry)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className="font-display text-xs mt-0.5 drop-shadow-[1px_1px_0_var(--color-bark)]">{square.text}</span>
        </>
      ) : (
        <span className="wrap-break-word hyphens-auto">{square.text}</span>
      )}
      {square.isMarked && !square.isFreeSpace && (
        <span
          className="animate-pop absolute -top-1.5 -right-1.5 w-5 h-5 grid place-items-center rounded-full bg-pumpkin border-2 border-bark text-cream text-[10px]"
          aria-hidden="true"
        >
          ★
        </span>
      )}
    </button>
  );
}
