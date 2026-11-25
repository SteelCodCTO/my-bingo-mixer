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
          <span className="text-xl leading-none" aria-hidden="true">🦃</span>
          <span className="font-display text-xs mt-0.5">{square.text}</span>
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
