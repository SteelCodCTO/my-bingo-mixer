import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { BingoSquareData, BingoLine, GameState } from '../types';
import {
  generateBoard,
  toggleSquare,
  checkBingo,
  getWinningSquareIds,
} from '../utils/bingoLogic';
import { pickLine } from '../utils/mascotLogic';
import { MASCOT_GREETING, MARK_LINES, BINGO_LINES } from '../data/mascotLines';
import { playLarry, stopLarry } from '../utils/larryVoice';

export interface BingoGameState {
  gameState: GameState;
  board: BingoSquareData[];
  winningLine: BingoLine | null;
  winningSquareIds: Set<number>;
  showBingoModal: boolean;
  mascotLine: string;
  mascotKey: number;
  soundOn: boolean;
}

export interface BingoGameActions {
  startGame: () => void;
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
const STORAGE_VERSION = 2;

interface StoredGameData {
  version: number;
  gameState: GameState;
  board: BingoSquareData[];
  winningLine: BingoLine | null;
}

function validateStoredData(data: unknown): data is StoredGameData {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  
  if (obj.version !== STORAGE_VERSION) {
    return false;
  }
  
  if (typeof obj.gameState !== 'string' || !['start', 'playing', 'bingo'].includes(obj.gameState)) {
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
  
  if (obj.winningLine !== null) {
    if (typeof obj.winningLine !== 'object') {
      return false;
    }
    const line = obj.winningLine as Record<string, unknown>;
    if (
      typeof line.type !== 'string' ||
      !['row', 'column', 'diagonal'].includes(line.type) ||
      typeof line.index !== 'number' ||
      !Array.isArray(line.squares)
    ) {
      return false;
    }
  }
  
  return true;
}

function loadGameState(): Pick<BingoGameState, 'gameState' | 'board' | 'winningLine'> | null {
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
        winningLine: parsed.winningLine,
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

function saveGameState(gameState: GameState, board: BingoSquareData[], winningLine: BingoLine | null): void {
  // SSR guard
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const data: StoredGameData = {
      version: STORAGE_VERSION,
      gameState,
      board,
      winningLine,
    };
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
  const [winningLine, setWinningLine] = useState<BingoLine | null>(
    () => loadedState?.winningLine || null
  );
  const [showBingoModal, setShowBingoModal] = useState(false);
  const [mascotLine, setMascotLine] = useState(MASCOT_GREETING);
  const [mascotKey, setMascotKey] = useState(0);
  const [soundOn, setSoundOn] = useState(loadSoundOn);
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
    () => getWinningSquareIds(winningLine),
    [winningLine]
  );

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    saveGameState(gameState, board, winningLine);
  }, [gameState, board, winningLine]);

  const startGame = useCallback(() => {
    setBoard(generateBoard());
    setWinningLine(null);
    setGameState('playing');
    greet();
  }, [greet]);

  const handleSquareClick = useCallback((squareId: number) => {
    const target = board.find((square) => square.id === squareId);
    if (!target || target.isFreeSpace) {
      return;
    }

    const newBoard = toggleSquare(board, squareId);
    setBoard(newBoard);

    const bingo = checkBingo(newBoard);
    if (bingo && !winningLine) {
      setWinningLine(bingo);
      setGameState('bingo');
      setShowBingoModal(true);
      sayMascotLine(BINGO_LINES);
    } else if (!target.isMarked) {
      sayMascotLine(MARK_LINES);
    }
  }, [board, winningLine, sayMascotLine]);

  const resetGame = useCallback(() => {
    setGameState('start');
    setBoard([]);
    setWinningLine(null);
    setShowBingoModal(false);
    greet();
  }, [greet]);

  const dismissModal = useCallback(() => {
    setShowBingoModal(false);
  }, []);

  return {
    gameState,
    board,
    winningLine,
    winningSquareIds,
    showBingoModal,
    mascotLine,
    mascotKey,
    soundOn,
    startGame,
    handleSquareClick,
    resetGame,
    dismissModal,
    toggleSound,
  };
}
