import { MARK_LINES } from '../data/mascotLines';

interface LobsterMascotProps {
  line: string;
  lineKey: number;
}

const OUTLINE = 'var(--color-ink)';

export function LobsterMascot({ line, lineKey }: LobsterMascotProps) {
  // Per-tap quips would make screen readers chatty; announce only greetings and celebrations.
  const announce = !MARK_LINES.includes(line);
  return (
    <div className="flex items-end gap-2 w-full max-w-md mx-auto px-1">
      <div className="shrink-0 animate-bob motion-reduce:animate-none">
        <svg
          key={lineKey}
          viewBox="0 0 100 100"
          className="w-20 h-20 origin-bottom animate-wobble motion-reduce:animate-none"
          aria-hidden="true"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {/* antennae */}
          <path d="M42 36 Q30 18 14 20" fill="none" stroke={OUTLINE} strokeWidth="2.5" />
          <path d="M58 36 Q70 18 86 20" fill="none" stroke={OUTLINE} strokeWidth="2.5" />

          {/* claws */}
          <path d="M30 58 Q18 56 14 46" fill="none" stroke={OUTLINE} strokeWidth="5" />
          <path d="M30 58 Q18 56 14 46" fill="none" stroke="var(--color-ruby)" strokeWidth="2.5" />
          <path d="M70 58 Q82 56 86 46" fill="none" stroke={OUTLINE} strokeWidth="5" />
          <path d="M70 58 Q82 56 86 46" fill="none" stroke="var(--color-ruby)" strokeWidth="2.5" />
          <path
            d="M14 48 C2 46 2 30 10 28 L14 36 L18 30 C24 34 22 46 14 48 Z"
            fill="var(--color-berry)"
            stroke={OUTLINE}
            strokeWidth="2.5"
          />
          <path
            d="M86 48 C98 46 98 30 90 28 L86 36 L82 30 C76 34 78 46 86 48 Z"
            fill="var(--color-berry)"
            stroke={OUTLINE}
            strokeWidth="2.5"
          />

          {/* tail */}
          <path
            d="M40 82 L36 96 L50 92 L64 96 L60 82 Z"
            fill="var(--color-ruby)"
            stroke={OUTLINE}
            strokeWidth="2.5"
          />

          {/* body */}
          <ellipse cx="50" cy="62" rx="20" ry="22" fill="var(--color-berry)" stroke={OUTLINE} strokeWidth="2.5" />
          <ellipse cx="50" cy="68" rx="11" ry="12" fill="var(--color-snow)" />
          <path d="M42 66 H58 M43 72 H57 M45 78 H55" stroke="var(--color-gold)" strokeWidth="2" />

          {/* eyes */}
          <circle cx="43" cy="52" r="5" fill="var(--color-snow)" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="57" cy="52" r="5" fill="var(--color-snow)" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="44" cy="53" r="2" fill={OUTLINE} />
          <circle cx="58" cy="53" r="2" fill={OUTLINE} />
          <path d="M45 60 Q50 64 55 60" fill="none" stroke={OUTLINE} strokeWidth="2" />

          {/* santa hat */}
          <path d="M34 41 C36 26 46 16 58 17 C68 18 74 24 78 34 L71 38 C67 30 63 27 60 28 C63 32 65 36 66 41 Z" fill="var(--color-berry)" stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="30" y="38" width="40" height="8" rx="4" fill="var(--color-snow)" stroke={OUTLINE} strokeWidth="2.5" />
          <circle cx="76" cy="38" r="5" fill="var(--color-snow)" stroke={OUTLINE} strokeWidth="2.5" />
        </svg>
      </div>

      {/* Reserve two lines so changing quips don't nudge the board above. */}
      <div className="relative flex-1 mb-6 min-h-16 flex flex-col justify-end">
        <p className="sr-only" aria-live="polite">
          {announce ? line : ''}
        </p>
        <p
          key={lineKey}
          aria-hidden="true"
          className="animate-pop motion-reduce:animate-none origin-bottom-left relative bg-snow border-2 border-ink rounded-2xl rounded-bl-sm px-3 py-2 font-display text-base leading-snug text-ink hard-shadow"
        >
          {line}
        </p>
        <span
          className="absolute -left-2 bottom-2 w-3 h-3 bg-snow border-l-2 border-b-2 border-ink rotate-45"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
