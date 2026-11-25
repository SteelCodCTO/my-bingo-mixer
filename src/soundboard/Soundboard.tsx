import { useCallback, useEffect, useRef, useState } from 'react';
import { MASCOT_GREETING, MARK_LINES, BINGO_LINES } from '../data/mascotLines';
import { mascotAudioSlug, mascotAudioUrl, MASCOT_AUDIO_EXT } from '../utils/mascotAudio';
import { LobsterMascot } from '../components/LobsterMascot';

const GROUPS = [
  { title: 'Greeting', lines: [MASCOT_GREETING] },
  { title: 'Square checked', lines: MARK_LINES },
  { title: 'Bingo!', lines: BINGO_LINES },
];
const ALL_LINES = GROUPS.flatMap((group) => group.lines);

export function Soundboard() {
  const [line, setLine] = useState(MASCOT_GREETING);
  const [lineKey, setLineKey] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const [playingAll, setPlayingAll] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<string[]>([]);
  const playRef = useRef<(text: string) => void>(() => {});

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    queueRef.current = [];
    setPlaying(null);
    setPlayingAll(false);
  }, []);

  const play = useCallback((text: string) => {
    audioRef.current?.pause();
    const audio = new Audio(mascotAudioUrl(text));
    audioRef.current = audio;
    setLine(text);
    setLineKey((key) => key + 1);
    setPlaying(text);

    const next = () => {
      if (audioRef.current !== audio) return;
      const upcoming = queueRef.current.shift();
      if (upcoming) {
        playRef.current(upcoming);
      } else {
        setPlaying(null);
        setPlayingAll(false);
      }
    };

    audio.addEventListener('ended', next);
    audio.addEventListener('error', () => {
      setMissing((prev) => new Set(prev).add(text));
      next();
    });
    audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  const playAll = useCallback(() => {
    const [first, ...rest] = ALL_LINES;
    queueRef.current = rest;
    setPlayingAll(true);
    play(first);
  }, [play]);

  useEffect(() => stop, [stop]);

  return (
    <div className="sunburst min-h-full flex flex-col">
      <div className="stripes-70s h-4 shrink-0" aria-hidden="true" />
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6">
        <header className="text-center mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-pumpkin">Dev tool</p>
          <h1 className="font-display text-4xl text-bark drop-shadow-[2px_2px_0_var(--color-mustard)]">
            Larry's Soundboard
          </h1>
          <p className="italic text-bark/80 text-sm mt-1">
            {ALL_LINES.length} lines · tap to hear a clip · missing clips get flagged
          </p>
        </header>

        <div className="bg-parchment border-2 border-bark rounded-2xl p-3 hard-shadow mb-4">
          <LobsterMascot line={line} lineKey={lineKey} />
        </div>

        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={playingAll ? stop : playAll}
            className="bg-pumpkin text-cream font-display text-lg px-6 py-2 rounded-full border-2 border-bark hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            {playingAll ? 'Stop' : 'Play all'}
          </button>
          {playing && !playingAll && (
            <button
              onClick={stop}
              className="bg-parchment text-bark font-display text-lg px-6 py-2 rounded-full border-2 border-bark hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Stop
            </button>
          )}
        </div>

        {GROUPS.map((group) => (
          <section key={group.title} className="mb-6">
            <h2 className="font-display text-xl text-bark mb-2">
              {group.title} <span className="text-bark/60 text-sm font-body">({group.lines.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.lines.map((text) => {
                const isPlaying = playing === text;
                const isMissing = missing.has(text);
                return (
                  <button
                    key={text}
                    onClick={() => play(text)}
                    aria-pressed={isPlaying}
                    className={`flex items-center gap-3 text-left px-3 py-2 rounded-xl border-2 transition-transform active:scale-[0.98] ${
                      isMissing
                        ? 'bg-cranberry text-cream border-bark'
                        : isPlaying
                          ? 'bg-mustard text-bark border-bark hard-shadow'
                          : 'bg-cream text-bark border-bark/40'
                    }`}
                  >
                    <span
                      className={`shrink-0 w-8 h-8 grid place-items-center rounded-full border-2 border-bark ${
                        isPlaying ? 'bg-pumpkin text-cream animate-wobble' : 'bg-parchment'
                      }`}
                      aria-hidden="true"
                    >
                      {isMissing ? '!' : isPlaying ? '♪' : '▶'}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold leading-tight">{text}</span>
                      <span className={`block text-xs truncate ${isMissing ? 'text-cream/80' : 'text-bark/60'}`}>
                        {isMissing ? 'Missing clip, run npm run audio:larry' : `${mascotAudioSlug(text)}.${MASCOT_AUDIO_EXT}`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>
      <div className="stripes-70s h-4 shrink-0" aria-hidden="true" />
    </div>
  );
}
