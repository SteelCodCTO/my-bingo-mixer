// Regenerates Larry's voice clips with Piper TTS: npm run audio:larry
// Needs PIPER_MODEL, PIPER_BIN (if piper isn't on PATH), and the lameenc Python package for MP3 encoding.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MASCOT_GREETING, MARK_LINES, BINGO_LINES } from '../src/data/mascotLines.ts';
import { mascotAudioSlug, MASCOT_AUDIO_EXT } from '../src/utils/mascotAudio.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'audio', 'larry');
const piperBin = process.env.PIPER_BIN ?? 'piper';
const piperModel = process.env.PIPER_MODEL;
const lengthScale = process.env.PIPER_LENGTH_SCALE ?? '0.85';
// Default to the Python next to piper (same venv) so lameenc is importable.
const python = process.env.PIPER_PYTHON ?? (piperBin.includes('/') ? join(dirname(piperBin), 'python') : 'python3');

// MP3 rather than AAC: Chromium/Electron builds without proprietary codecs (e.g. VS Code's browser) can't play AAC.
const ENCODE_MP3 = `
import sys, wave, lameenc
w = wave.open(sys.argv[1])
e = lameenc.Encoder()
e.set_bit_rate(48)
e.set_in_sample_rate(w.getframerate())
e.set_channels(w.getnchannels())
e.set_quality(2)
open(sys.argv[2], 'wb').write(e.encode(w.readframes(w.getnframes())) + e.flush())
`;

if (!piperModel) {
  console.error(
    'Set PIPER_MODEL to a Piper .onnx voice. Easiest:\n' +
      '  eval "$(bash .github/skills/larry-audio/scripts/setup-piper.sh)" && npm run audio:larry'
  );
  process.exit(1);
}

function run(cmd, args, input) {
  const result = spawnSync(cmd, args, { input, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${cmd} failed: ${result.stderr || result.error}`);
  }
}

const lines = [MASCOT_GREETING, ...MARK_LINES, ...BINGO_LINES];
const wanted = new Set(lines.map((line) => `${mascotAudioSlug(line)}.${MASCOT_AUDIO_EXT}`));

mkdirSync(outDir, { recursive: true });
const workDir = mkdtempSync(join(tmpdir(), 'larry-'));

try {
  for (const line of lines) {
    const slug = mascotAudioSlug(line);
    const wav = join(workDir, `${slug}.wav`);
    const file = `${slug}.${MASCOT_AUDIO_EXT}`;
    run(piperBin, ['-m', piperModel, '--length-scale', lengthScale, '-f', wav], line);
    run(python, ['-c', ENCODE_MP3, wav, join(outDir, file)]);
    console.log(`✓ ${file}  "${line}"`);
  }

  for (const file of readdirSync(outDir)) {
    if (!wanted.has(file)) {
      rmSync(join(outDir, file));
      console.log(`✗ removed stale ${file}`);
    }
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
