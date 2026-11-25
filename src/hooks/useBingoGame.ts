import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { BingoSquareData, BingoLine, GameState } from '../types';
import {
  generateBoard,
  toggleSquare,
  checkAllBingos,
  getWinningSquareIds,
} from '../utils/bingoLogic';
import { pickLine } from '../utils/mascotLogic';
import { MASCOT_GREETING, MARK_LINES, BINGO_LINES } from '../data/mascotLines';
import { playLarry, stopLarry } from '../utils/larryVoice';
import { questions } from '../data/questions';

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
const STORAGE_VERSION = 4;

interface StoredGameData {
  version: number;
  gameState: GameState;
  board: BingoSquareData[];
  winningLines: BingoLine[];
  hasCelebrated: boolean;
}

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

  if (typeof obj.hasCelebrated !== 'boolean') {
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
      return {
        gameState: parsed.gameState,
        board: parsed.board,
        winningLines: parsed.winningLines,
        hasCelebrated: parsed.hasCelebrated,
      };
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
  const [showBingoModal, setShowBingoModal] = useState(false);
  const [mascotLine, setMascotLine] = useState(MASCOT_GREETING);
  const [mascotKey, setMascotKey] = useState(0);
  const [soundOn, setSoundOn] = useState(loadSoundOn);
  const [currentCard, setCurrentCard] = useState<string | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const spokenKeyRef = useRef(mascotKey);

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
    saveGameState({ gameState, board, winningLines, hasCelebrated });
  }, [gameState, board, winningLines, hasCelebrated]);

  const startGame = useCallback(() => {
    setBoard(generateBoard());
    setWinningLines([]);
    setHasCelebrated(false);
    setGameState('playing');
    greet();
  }, [greet]);

  const startDeck = useCallback(() => {
    setBoard([]);
    setWinningLines([]);
    setHasCelebrated(false);
    setCurrentCard(null);
    setFoundCount(0);
    setSkippedCount(0);
    setGameState('deck');
  }, []);

  const drawCard = useCallback(() => {
    setCurrentCard((previous) => pickLine(questions, previous));
    setCardKey((key) => key + 1);
  }, []);

  const resolveCard = useCallback((result: 'found' | 'skipped') => {
    if (result === 'found') {
      setFoundCount((count) => count + 1);
    } else {
      setSkippedCount((count) => count + 1);
    }
    drawCard();
  }, [drawCard]);

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
    setCurrentCard(null);
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
    cardKey,
    foundCount,
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
