import { describe, it, expect } from 'vitest';
import { pickLine } from './mascotLogic';
import { MARK_LINES } from '../data/mascotLines';

describe('pickLine', () => {
  it('returns a line from the pool', () => {
    for (let i = 0; i < 50; i++) {
      expect(MARK_LINES).toContain(pickLine(MARK_LINES, null));
    }
  });

  it('never repeats the previous line when the pool has more than one line', () => {
    let previous: string | null = null;
    for (let i = 0; i < 100; i++) {
      const next = pickLine(MARK_LINES, previous);
      expect(next).not.toBe(previous);
      previous = next;
    }
  });

  it('returns the only line when the pool has one entry', () => {
    expect(pickLine(['Wicked!'], 'Wicked!')).toBe('Wicked!');
  });

  it('is deterministic with an injected random source', () => {
    const lines = ['a', 'b', 'c'];
    expect(pickLine(lines, null, () => 0)).toBe('a');
    expect(pickLine(lines, null, () => 0.99)).toBe('c');
    expect(pickLine(lines, 'a', () => 0)).toBe('b');
  });
});
