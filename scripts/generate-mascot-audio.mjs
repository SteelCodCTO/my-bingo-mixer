// Regenerates Larry's voice clips with Piper TTS: npm run audio:larry
// Needs PIPER_MODEL (and PIPER_BIN if piper isn't on PATH) plus macOS afconvert.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MASCOT_GREETING, MARK_LINES, BINGO_LINES } from '../src/data/mascotLines.ts';
import { mascotAudioSlug } from '../src/utils/mascotAudio.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'audio', 'larry');
const piperBin = process.env.PIPER_BIN ?? 'piper';
const piperModel = process.env.PIPER_MODEL;
const lengthScale = process.env.PIPER_LENGTH_SCALE ?? '0.85';

if (!piperModel) {
  console.error(
    'Set PIPER_MODEL to a Piper .onnx voice, e.g.\n' +
      '  python3 -m venv /tmp/piper-venv && /tmp/piper-venv/bin/pip install piper-tts\n' +
      '  /tmp/piper-venv/bin/python -m piper.download_voices --download-dir /tmp/piper-voices en_US-ryan-high\n' +
      '  PIPER_BIN=/tmp/piper-venv/bin/piper PIPER_MODEL=/tmp/piper-voices/en_US-ryan-high.onnx npm run audio:larry'
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
const wanted = new Set(lines.map((line) => `${mascotAudioSlug(line)}.m4a`));

mkdirSync(outDir, { recursive: true });
const workDir = mkdtempSync(join(tmpdir(), 'larry-'));

try {
  for (const line of lines) {
    const slug = mascotAudioSlug(line);
    const wav = join(workDir, `${slug}.wav`);
    run(piperBin, ['-m', piperModel, '--length-scale', lengthScale, '-f', wav], line);
    run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '48000', wav, join(outDir, `${slug}.m4a`)]);
    console.log(`✓ ${slug}.m4a  "${line}"`);
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
