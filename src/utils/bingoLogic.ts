import { questions, FREE_SPACE } from '../data/questions';
import type { BingoSquareData, BingoLine } from '../types';

// Re-export types for convenience
export type { BingoSquareData, BingoLine } from '../types';

const BOARD_SIZE = 5;
const CENTER_INDEX = 12; // 5x5 grid, center is index 12 (row 2, col 2)

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a new 5x5 bingo board
 */
export function generateBoard(): BingoSquareData[] {
  const shuffledQuestions = shuffleArray(questions).slice(0, 24);
  const board: BingoSquareData[] = [];

  let questionIndex = 0;
  for (let i = 0; i < 25; i++) {
    if (i === CENTER_INDEX) {
      board.push({
        id: i,
        text: FREE_SPACE,
        isMarked: true,
        isFreeSpace: true,
      });
    } else {
      board.push({
        id: i,
        text: shuffledQuestions[questionIndex],
        isMarked: false,
        isFreeSpace: false,
      });
      questionIndex++;
    }
  }

  return board;
}

/**
 * Toggle a square's marked state
 */
export function toggleSquare(board: BingoSquareData[], squareId: number): BingoSquareData[] {
  return board.map((square) =>
    square.id === squareId && !square.isFreeSpace
      ? { ...square, isMarked: !square.isMarked }
      : square
  );
}

/**
 * Get all possible winning lines
 */
function getWinningLines(): BingoLine[] {
  const lines: BingoLine[] = [];

  // Rows
  for (let row = 0; row < BOARD_SIZE; row++) {
    const squares = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      squares.push(row * BOARD_SIZE + col);
    }
    lines.push({ type: 'row', index: row, squares });
  }

  // Columns
  for (let col = 0; col < BOARD_SIZE; col++) {
    const squares = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      squares.push(row * BOARD_SIZE + col);
    }
    lines.push({ type: 'column', index: col, squares });
  }

  // Diagonal (top-left to bottom-right)
  lines.push({
    type: 'diagonal',
    index: 0,
    squares: [0, 6, 12, 18, 24],
  });

  // Diagonal (top-right to bottom-left)
  lines.push({
    type: 'diagonal',
    index: 1,
    squares: [4, 8, 12, 16, 20],
  });

  lines.push({ type: 'corners', index: 0, squares: [0, 4, 20, 24] });

  return lines;
}

/**
 * Return every complete line (rows, columns, diagonals, four corners)
 */
export function checkAllBingos(board: BingoSquareData[]): BingoLine[] {
  return getWinningLines().filter((line) =>
    line.squares.every((idx) => board[idx].isMarked)
  );
}

/**
 * Return the first complete line, or null
 */
export function checkBingo(board: BingoSquareData[]): BingoLine | null {
  return checkAllBingos(board)[0] ?? null;
}

/**
 * Get the square IDs that are part of one or more winning lines
 */
export function getWinningSquareIds(lines: BingoLine | readonly BingoLine[] | null): Set<number> {
  if (!lines) return new Set();
  const list = Array.isArray(lines) ? lines : [lines as BingoLine];
  return new Set(list.flatMap((line) => line.squares));
}

/**
 * Get unmarked squares sharing a winning line with the given square
 */
export function getHintSquareIds(board: BingoSquareData[], squareId: number): Set<number> {
  const hints = new Set<number>();
  if (board[squareId]?.isFreeSpace) return hints;

  for (const line of getWinningLines()) {
    if (!line.squares.includes(squareId)) continue;
    for (const idx of line.squares) {
      if (idx !== squareId && !board[idx].isMarked) hints.add(idx);
    }
  }

  return hints;
}
