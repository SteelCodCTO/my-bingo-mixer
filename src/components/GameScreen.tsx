import { useRef } from 'react';
import type { BingoSquareData } from '../types';
import { BingoBoard } from './BingoBoard';
import { LobsterMascot } from './LobsterMascot';

interface GameScreenProps {
  board: BingoSquareData[];
  winningSquareIds: Set<number>;
  hasBingo: boolean;
  mascotLine: string;
  mascotKey: number;
  soundOn: boolean;
  onSquareClick: (squareId: number) => void;
  onReset: () => void;
  onToggleSound: () => void;
}

export function GameScreen({
  board,
  winningSquareIds,
  hasBingo,
  mascotLine,
  mascotKey,
  soundOn,
  onSquareClick,
  onReset,
  onToggleSound,
}: GameScreenProps) {
  const confirmRef = useRef<HTMLDialogElement>(null);
  const hasMarks = board.some((square) => square.isMarked && !square.isFreeSpace);

  const handleBack = () => {
    if (hasMarks) confirmRef.current?.showModal();
    else onReset();
  };

  return (
    <div className="sunburst flex flex-col min-h-full">
      <div className="stripes-70s h-3 shrink-0" aria-hidden="true" />
      <header className="flex items-center justify-between px-3 py-2 border-b-2 border-ink bg-snow/80">
        <button
          onClick={handleBack}
          className="min-h-11 text-ink text-sm font-semibold px-4 rounded-full border-2 border-ink bg-frost active:bg-gold"
        >
          <span aria-hidden="true">← </span>Back
        </button>
        <h1 className="font-display text-xl text-ink">
          Jingle <span className="text-berry">Bingo</span>
        </h1>
        <div className="w-[5rem] flex justify-end">
          <button
            onClick={onToggleSound}
            aria-pressed={soundOn}
            aria-label="Larry's voice"
            title="Larry's voice"
            className="w-11 h-11 grid place-items-center rounded-full border-2 border-ink bg-frost text-lg active:bg-gold"
          >
            <span aria-hidden="true">{soundOn ? '🔊' : '🔇'}</span>
          </button>
        </div>
      </header>

      {/* Banner and helper share one fixed-height slot so the board doesn't jump on a win. */}
      {hasBingo ? (
        <div className="h-11 flex items-center justify-center bg-berry text-snow font-display text-base border-y-2 border-ink">
          <span aria-hidden="true">🎄 </span>BINGO! You got a wicked good line!
        </div>
      ) : (
        <p className="h-11 flex items-center justify-center text-snow/85 italic text-sm px-4">
          Tap a square when you find someone who matches it.
        </p>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-3">
        <BingoBoard
          board={board}
          winningSquareIds={winningSquareIds}
          onSquareClick={onSquareClick}
        />
        <LobsterMascot line={mascotLine} lineKey={mascotKey} />
      </div>

      <dialog
        ref={confirmRef}
        aria-labelledby="toss-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) confirmRef.current?.close();
        }}
        className="m-auto p-6 max-w-xs w-[calc(100%-2rem)] bg-frost text-ink text-center border-2 border-ink rounded-3xl hard-shadow backdrop:bg-ink/70"
      >
        <h2 id="toss-title" className="font-display text-3xl text-berry mb-2">
          Toss this card?
        </h2>
        <p className="text-sm mb-6">Your stamps go in the snowbank. No takebacks.</p>
        <div className="flex gap-3">
          <button
            onClick={() => confirmRef.current?.close()}
            className="flex-1 bg-snow text-ink font-display text-lg py-2 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Keep it
          </button>
          <button
            onClick={() => {
              confirmRef.current?.close();
              onReset();
            }}
            className="flex-1 bg-berry text-snow font-display text-lg py-2 rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Toss it
          </button>
        </div>
      </dialog>
    </div>
  );
}
