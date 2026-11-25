import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { BingoSquareData, BingoLine, GameState } from '../types';
import {
  generateBoard,
  toggleSquare,
  checkAllBingos,
  getWinningSquareIds,
  shuffleDeck,
} from '../utils/bingoLogic';
import { pickLine } from '../utils/mascotLogic';
import { MASCOT_GREETING, MARK_LINES, BINGO_LINES, DECK_DONE_LINES } from '../data/mascotLines';
import { playLarry, stopLarry } from '../utils/larryVoice';

export interface BingoGameState {
  gameState: GameState;
  board: BingoSquareData[];
  winningLines: BingoLine[];
  winningSquareIds: Set<number>;
  showBingoModal: boolean;
  mascotLine: string;
  mascotKey: number;
  soundOn: boolean;
  currentCard: string | null;
  cardKey: number;
  deckSize: number;
  deckDone: boolean;
  foundCards: string[];
  foundCount: number;
  skippedCount: number;
}

export interface BingoGameActions {
  startGame: () => void;
  startDeck: () => void;
  drawCard: () => void;
  resolveCard: (result: 'found' | 'skipped') => void;
  handleSquareClick: (squareId: number) => void;
  resetGame: () => void;
  dismissModal: () => void;
  toggleSound: () => void;
}

const SOUND_STORAGE_KEY = 'bingo-sound';

function loadSoundOn(): boolean {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

const STORAGE_KEY = 'bingo-game-state';
const STORAGE_VERSION = 5;

interface StoredGameData {
  version: number;
  gameState: GameState;
  board: BingoSquareData[];
  winningLines: BingoLine[];
  hasCelebrated: boolean;
  showBingoModal: boolean;
  mascotLine: string;
  deckOrder: string[];
  deckIndex: number;
  foundCards: string[];
  skippedCount: number;
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

function isValidLine(value: unknown): value is BingoLine {
  if (!value || typeof value !== 'object') return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.type === 'string' &&
    ['row', 'column', 'diagonal', 'corners'].includes(line.type) &&
    typeof line.index === 'number' &&
    Array.isArray(line.squares) &&
    line.squares.every((idx) => typeof idx === 'number' && idx >= 0 && idx < 25)
  );
}

const lineKey = (line: BingoLine) => `${line.type}-${line.index}`;

function validateStoredData(data: unknown): data is StoredGameData {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  
  if (obj.version !== STORAGE_VERSION) {
    return false;
  }
  
  if (typeof obj.gameState !== 'string' || !['start', 'playing', 'bingo', 'deck'].includes(obj.gameState)) {
    return false;
  }
  
  if (!Array.isArray(obj.board) || (obj.board.length !== 0 && obj.board.length !== 25)) {
    return false;
  }
  
  const validSquares = obj.board.every((sq: unknown) => {
    if (!sq || typeof sq !== 'object') return false;
    const square = sq as Record<string, unknown>;
    return (
      typeof square.id === 'number' &&
      typeof square.text === 'string' &&
      typeof square.isMarked === 'boolean' &&
      typeof square.isFreeSpace === 'boolean'
    );
  });
  
  if (!validSquares) {
    return false;
  }
  
  if (!Array.isArray(obj.winningLines) || !obj.winningLines.every(isValidLine)) {
    return false;
  }

  if (typeof obj.hasCelebrated !== 'boolean' || typeof obj.showBingoModal !== 'boolean') {
    return false;
  }

  if (typeof obj.mascotLine !== 'string') {
    return false;
  }

  if (!isStringArray(obj.deckOrder) || !isStringArray(obj.foundCards)) {
    return false;
  }

  if (
    !Number.isInteger(obj.deckIndex) ||
    (obj.deckIndex as number) < -1 ||
    (obj.deckIndex as number) > obj.deckOrder.length ||
    !Number.isInteger(obj.skippedCount) ||
    (obj.skippedCount as number) < 0
  ) {
    return false;
  }
  
  return true;
}

function loadGameState(): Omit<StoredGameData, 'version'> | null {
  // SSR guard
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved);
    
    if (validateStoredData(parsed)) {
      return parsed;
    } else {
      console.warn('Invalid game state data in localStorage, clearing...');
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to load game state:', error);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return null;
}

function saveGameState(state: Omit<StoredGameData, 'version'>): void {
  // SSR guard
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const data: StoredGameData = { version: STORAGE_VERSION, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save game state:', error);
  }
}

export function useBingoGame(): BingoGameState & BingoGameActions {
  const loadedState = useMemo(() => loadGameState(), []);

  const [gameState, setGameState] = useState<GameState>(
    () => loadedState?.gameState || 'start'
  );
  const [board, setBoard] = useState<BingoSquareData[]>(
    () => loadedState?.board || []
  );
  const [winningLines, setWinningLines] = useState<BingoLine[]>(
    () => loadedState?.winningLines || []
  );
  const [hasCelebrated, setHasCelebrated] = useState(
    () => loadedState?.hasCelebrated || false
  );
  const [showBingoModal, setShowBingoModal] = useState(
    () => loadedState?.showBingoModal || false
  );
  const [mascotLine, setMascotLine] = useState(
    () => loadedState?.mascotLine || MASCOT_GREETING
  );
  const [mascotKey, setMascotKey] = useState(0);
  const [soundOn, setSoundOn] = useState(loadSoundOn);
  const [deckOrder, setDeckOrder] = useState<string[]>(
    () => loadedState?.deckOrder || []
  );
  const [deckIndex, setDeckIndex] = useState(() => loadedState?.deckIndex ?? -1);
  const [foundCards, setFoundCards] = useState<string[]>(
    () => loadedState?.foundCards || []
  );
  const [skippedCount, setSkippedCount] = useState(() => loadedState?.skippedCount || 0);
  const spokenKeyRef = useRef(mascotKey);

  const currentCard = deckIndex >= 0 ? deckOrder[deckIndex] ?? null : null;
  const deckDone = deckOrder.length > 0 && deckIndex >= deckOrder.length;

  // Only speak after a tap changes the line; browsers block speech before a user gesture.
  useEffect(() => {
    if (mascotKey === spokenKeyRef.current) return;
    spokenKeyRef.current = mascotKey;
    if (soundOn && gameState !== 'start') {
      playLarry(mascotLine);
    }
  }, [mascotKey, mascotLine, soundOn, gameState]);

  const toggleSound = useCallback(() => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, next ? 'on' : 'off');
    } catch {
      // Storage unavailable (e.g. private mode); the toggle still works for this session.
    }
    if (next) {
      playLarry(mascotLine);
    } else {
      stopLarry();
    }
  }, [soundOn, mascotLine]);

  const sayMascotLine = useCallback((lines: readonly string[]) => {
    setMascotLine((previous) => pickLine(lines, previous));
    setMascotKey((key) => key + 1);
  }, []);

  const greet = useCallback(() => {
    setMascotLine(MASCOT_GREETING);
    setMascotKey((key) => key + 1);
  }, []);

  const winningSquareIds = useMemo(
    () => getWinningSquareIds(winningLines),
    [winningLines]
  );

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    saveGameState({
      gameState,
      board,
      winningLines,
      hasCelebrated,
      showBingoModal,
      mascotLine,
      deckOrder,
      deckIndex,
      foundCards,
      skippedCount,
    });
  }, [gameState, board, winningLines, hasCelebrated, showBingoModal, mascotLine, deckOrder, deckIndex, foundCards, skippedCount]);

  const startGame = useCallback(() => {
    setBoard(generateBoard());
    setWinningLines([]);
    setHasCelebrated(false);
    setShowBingoModal(false);
    setGameState('playing');
    greet();
  }, [greet]);

  const startDeck = useCallback(() => {
    setBoard([]);
    setWinningLines([]);
    setHasCelebrated(false);
    setDeckOrder(shuffleDeck());
    setDeckIndex(-1);
    setFoundCards([]);
    setSkippedCount(0);
    setGameState('deck');
    greet();
  }, [greet]);

  const drawCard = useCallback(() => {
    setDeckIndex((index) => Math.max(index, 0));
  }, []);

  const resolveCard = useCallback((result: 'found' | 'skipped') => {
    if (!currentCard) return;
    if (result === 'found') {
      setFoundCards((cards) => [...cards, currentCard]);
    } else {
      setSkippedCount((count) => count + 1);
    }
    setDeckIndex(deckIndex + 1);

    if (deckIndex + 1 >= deckOrder.length) {
      sayMascotLine(DECK_DONE_LINES);
    } else if (result === 'found') {
      sayMascotLine(MARK_LINES);
    }
  }, [currentCard, deckIndex, deckOrder.length, sayMascotLine]);

  const handleSquareClick = useCallback((squareId: number) => {
    const target = board.find((square) => square.id === squareId);
    if (!target || target.isFreeSpace) {
      return;
    }

    const newBoard = toggleSquare(board, squareId);
    setBoard(newBoard);

    const lines = checkAllBingos(newBoard);
    const previousKeys = new Set(winningLines.map(lineKey));
    const hasNewLine = lines.some((line) => !previousKeys.has(lineKey(line)));
    setWinningLines(lines);
    setGameState(lines.length > 0 ? 'bingo' : 'playing');

    if (hasNewLine) {
      if (!hasCelebrated) {
        setHasCelebrated(true);
        setShowBingoModal(true);
      }
      sayMascotLine(BINGO_LINES);
    } else if (!target.isMarked) {
      sayMascotLine(MARK_LINES);
    }
  }, [board, winningLines, hasCelebrated, sayMascotLine]);

  const resetGame = useCallback(() => {
    setGameState('start');
    setBoard([]);
    setWinningLines([]);
    setHasCelebrated(false);
    setShowBingoModal(false);
    setDeckOrder([]);
    setDeckIndex(-1);
    setFoundCards([]);
    setSkippedCount(0);
    greet();
  }, [greet]);

  const dismissModal = useCallback(() => {
    setShowBingoModal(false);
  }, []);

  return {
    gameState,
    board,
    winningLines,
    winningSquareIds,
    showBingoModal,
    mascotLine,
    mascotKey,
    soundOn,
    currentCard,
    cardKey: deckIndex,
    deckSize: deckOrder.length,
    deckDone,
    foundCards,
    foundCount: foundCards.length,
    skippedCount,
    startGame,
    startDeck,
    drawCard,
    resolveCard,
    handleSquareClick,
    resetGame,
    dismissModal,
    toggleSound,
  };
}
