import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBingoGame } from './useBingoGame';

vi.mock('../utils/larryVoice', () => ({
  playLarry: vi.fn(),
  stopLarry: vi.fn(),
}));

function setup() {
  const hook = renderHook(() => useBingoGame());
  act(() => hook.result.current.startGame());
  const tap = (...ids: number[]) =>
    ids.forEach((id) => act(() => hook.result.current.handleSquareClick(id)));
  return { result: hook.result, tap };
}

describe('useBingoGame', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    });
  });

  it('clears the bingo when a winning square is unmarked', () => {
    const { result, tap } = setup();
    tap(0, 1, 2, 3, 4);
    expect(result.current.gameState).toBe('bingo');
    expect(result.current.showBingoModal).toBe(true);

    act(() => result.current.dismissModal());
    tap(0);

    expect(result.current.gameState).toBe('playing');
    expect(result.current.winningLines).toEqual([]);
    expect(result.current.winningSquareIds.size).toBe(0);
  });

  it('highlights a second line without reopening the modal', () => {
    const { result, tap } = setup();
    tap(0, 1, 2, 3, 4);
    act(() => result.current.dismissModal());

    tap(5, 10, 15, 20);

    expect(result.current.showBingoModal).toBe(false);
    expect(result.current.winningLines.map((l) => l.type)).toEqual(['row', 'column']);
    expect(result.current.winningSquareIds).toEqual(new Set([0, 1, 2, 3, 4, 5, 10, 15, 20]));
  });

  it('does not reopen the modal when the first line is re-completed', () => {
    const { result, tap } = setup();
    tap(0, 1, 2, 3, 4);
    act(() => result.current.dismissModal());
    tap(4, 4);

    expect(result.current.gameState).toBe('bingo');
    expect(result.current.showBingoModal).toBe(false);
  });

  it('counts four corners as a bingo', () => {
    const { result, tap } = setup();
    tap(0, 4, 20, 24);
    expect(result.current.gameState).toBe('bingo');
    expect(result.current.winningLines[0].type).toBe('corners');
  });

  it('restores winning lines after a reload', () => {
    const { result, tap } = setup();
    tap(0, 1, 2, 3, 4);

    const reloaded = renderHook(() => useBingoGame());
    expect(reloaded.result.current.gameState).toBe('bingo');
    expect(reloaded.result.current.winningLines).toHaveLength(1);
    expect(result.current.board).toEqual(reloaded.result.current.board);
  });
});
