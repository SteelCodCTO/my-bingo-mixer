import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BingoBoard } from './BingoBoard';
import type { BingoSquareData } from '../types';

const HINTS_FOR_0 = [1, 2, 3, 4, 5, 10, 15, 20, 6, 18, 24];

function makeBoard(markedIds: number[] = []): BingoSquareData[] {
  return Array.from({ length: 25 }, (_, i) => ({
    id: i,
    text: i === 12 ? 'FREE' : `Q${i}`,
    isMarked: i === 12 || markedIds.includes(i),
    isFreeSpace: i === 12,
  }));
}

function renderBoard(board = makeBoard()) {
  render(<BingoBoard board={board} winningSquareIds={new Set()} onSquareClick={vi.fn()} />);
}

const squareButton = (id: number) =>
  screen.getByRole('button', { name: id === 12 ? 'Free space' : `Q${id}` });

const hintedButtons = () =>
  screen.getAllByRole('button').filter((b) => b.getAttribute('data-hint') === 'true');

describe('BingoBoard hover hints', () => {
  it('should not show any hints initially', () => {
    renderBoard();
    expect(hintedButtons()).toHaveLength(0);
  });

  it('should mark hint squares with data-hint="true" on mouseEnter', () => {
    renderBoard();
    fireEvent.mouseEnter(squareButton(0));
    HINTS_FOR_0.forEach((id) => {
      expect(squareButton(id)).toHaveAttribute('data-hint', 'true');
    });
    expect(hintedButtons()).toHaveLength(HINTS_FOR_0.length);
  });

  it('should not hint squares outside the hovered square lines', () => {
    renderBoard();
    fireEvent.mouseEnter(squareButton(0));
    expect(squareButton(7)).not.toHaveAttribute('data-hint', 'true');
  });

  it('should not hint the hovered square itself', () => {
    renderBoard();
    fireEvent.mouseEnter(squareButton(0));
    expect(squareButton(0)).not.toHaveAttribute('data-hint', 'true');
  });

  it('should not hint the free space', () => {
    renderBoard();
    fireEvent.mouseEnter(squareButton(6));
    expect(squareButton(12)).not.toHaveAttribute('data-hint', 'true');
  });

  it('should not hint already-marked squares', () => {
    renderBoard(makeBoard([1, 5]));
    fireEvent.mouseEnter(squareButton(0));
    expect(squareButton(1)).not.toHaveAttribute('data-hint', 'true');
    expect(squareButton(5)).not.toHaveAttribute('data-hint', 'true');
    expect(squareButton(2)).toHaveAttribute('data-hint', 'true');
  });

  it('should clear all hints on mouseLeave', () => {
    renderBoard();
    fireEvent.mouseEnter(squareButton(0));
    fireEvent.mouseLeave(squareButton(0));
    expect(hintedButtons()).toHaveLength(0);
  });

  it('should update hints when hovering a different square', () => {
    renderBoard();
    fireEvent.mouseEnter(squareButton(0));
    fireEvent.mouseLeave(squareButton(0));
    fireEvent.mouseEnter(squareButton(7));
    const ids = [2, 5, 6, 8, 9, 17, 22];
    ids.forEach((id) => {
      expect(squareButton(id)).toHaveAttribute('data-hint', 'true');
    });
    expect(hintedButtons()).toHaveLength(ids.length);
  });

  it('should show hints on focus (keyboard accessibility)', () => {
    renderBoard();
    fireEvent.focus(squareButton(0));
    HINTS_FOR_0.forEach((id) => {
      expect(squareButton(id)).toHaveAttribute('data-hint', 'true');
    });
    expect(squareButton(0)).not.toHaveAttribute('data-hint', 'true');
    expect(squareButton(7)).not.toHaveAttribute('data-hint', 'true');
  });

  it('should clear hints on blur', () => {
    renderBoard();
    fireEvent.focus(squareButton(0));
    fireEvent.blur(squareButton(0));
    expect(hintedButtons()).toHaveLength(0);
  });
});

const hoveredButtons = () =>
  screen.getAllByRole('button').filter((b) => b.hasAttribute('data-hovered'));

describe('hovered square', () => {
  it('should set data-hovered="true" only on the square under mouseEnter', () => {
    renderBoard();
    fireEvent.mouseEnter(squareButton(0));
    expect(squareButton(0)).toHaveAttribute('data-hovered', 'true');
    expect(hoveredButtons()).toEqual([squareButton(0)]);
  });

  it('should keep hovered and hint states distinct on the hovered square', () => {
    renderBoard();
    fireEvent.mouseEnter(squareButton(0));
    expect(squareButton(0)).toHaveAttribute('data-hovered', 'true');
    expect(squareButton(0)).not.toHaveAttribute('data-hint', 'true');
  });

  it('should remove data-hovered from all buttons on mouseLeave', () => {
    renderBoard();
    fireEvent.mouseEnter(squareButton(0));
    fireEvent.mouseLeave(squareButton(0));
    expect(hoveredButtons()).toHaveLength(0);
  });

  it('should set data-hovered on focus and clear it on blur', () => {
    renderBoard();
    fireEvent.focus(squareButton(3));
    expect(squareButton(3)).toHaveAttribute('data-hovered', 'true');
    expect(hoveredButtons()).toEqual([squareButton(3)]);
    fireEvent.blur(squareButton(3));
    expect(hoveredButtons()).toHaveLength(0);
  });

  it('should set data-hovered on a marked (non-free) square', () => {
    renderBoard(makeBoard([0]));
    fireEvent.mouseEnter(squareButton(0));
    expect(squareButton(0)).toHaveAttribute('data-hovered', 'true');
  });

  it('should not set data-hovered on the free space even if mouseEnter fires', () => {
    renderBoard();
    // jsdom may still dispatch mouseEnter on a disabled button, so the component must guard.
    fireEvent.mouseEnter(squareButton(12));
    expect(squareButton(12)).not.toHaveAttribute('data-hovered');
    expect(hoveredButtons()).toHaveLength(0);
  });
});
