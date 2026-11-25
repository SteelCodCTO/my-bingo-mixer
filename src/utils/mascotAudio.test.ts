import { describe, it, expect } from 'vitest';
import { mascotAudioSlug, mascotAudioUrl } from './mascotAudio';
import { MASCOT_GREETING, MARK_LINES, BINGO_LINES } from '../data/mascotLines';

const allLines = [MASCOT_GREETING, ...MARK_LINES, ...BINGO_LINES];
// Lazy glob: only the matched paths are used, the clips are never loaded.
const clipPaths = new Set(Object.keys(import.meta.glob('/public/audio/larry/*.m4a')));

describe('mascotAudio', () => {
  it('slugifies lines into safe file names', () => {
    expect(mascotAudioSlug("Pahk the cah, you got one!")).toBe('pahk-the-cah-you-got-one');
    expect(mascotAudioSlug("Now we're cookin' with gas!")).toBe('now-were-cookin-with-gas');
  });

  it('builds URLs under the given base path', () => {
    expect(mascotAudioUrl('Wicked!', '/repo/game/')).toBe('/repo/game/audio/larry/wicked.m4a');
  });

  it('gives every mascot line a unique slug', () => {
    const slugs = allLines.map(mascotAudioSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => slug.length > 0)).toBe(true);
  });

  it('has a generated clip for every mascot line (run `npm run audio:larry` if this fails)', () => {
    const missing = allLines.filter(
      (line) => !clipPaths.has(`/public/audio/larry/${mascotAudioSlug(line)}.m4a`)
    );
    expect(missing).toEqual([]);
  });
});
