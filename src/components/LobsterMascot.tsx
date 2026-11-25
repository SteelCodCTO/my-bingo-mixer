interface LobsterMascotProps {
  line: string;
  lineKey: number;
}

const OUTLINE = 'var(--color-bark)';

export function LobsterMascot({ line, lineKey }: LobsterMascotProps) {
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
          <path d="M30 58 Q18 56 14 46" fill="none" stroke="var(--color-cranberry)" strokeWidth="2.5" />
          <path d="M70 58 Q82 56 86 46" fill="none" stroke={OUTLINE} strokeWidth="5" />
          <path d="M70 58 Q82 56 86 46" fill="none" stroke="var(--color-cranberry)" strokeWidth="2.5" />
          <path
            d="M14 48 C2 46 2 30 10 28 L14 36 L18 30 C24 34 22 46 14 48 Z"
            fill="var(--color-pumpkin)"
            stroke={OUTLINE}
            strokeWidth="2.5"
          />
          <path
            d="M86 48 C98 46 98 30 90 28 L86 36 L82 30 C76 34 78 46 86 48 Z"
            fill="var(--color-pumpkin)"
            stroke={OUTLINE}
            strokeWidth="2.5"
          />

          {/* tail */}
          <path
            d="M40 82 L36 96 L50 92 L64 96 L60 82 Z"
            fill="var(--color-cranberry)"
            stroke={OUTLINE}
            strokeWidth="2.5"
          />

          {/* body */}
          <ellipse cx="50" cy="62" rx="20" ry="22" fill="var(--color-pumpkin)" stroke={OUTLINE} strokeWidth="2.5" />
          <ellipse cx="50" cy="68" rx="11" ry="12" fill="var(--color-cream)" />
          <path d="M42 66 H58 M43 72 H57 M45 78 H55" stroke="var(--color-mustard)" strokeWidth="2" />

          {/* eyes */}
          <circle cx="43" cy="52" r="5" fill="var(--color-cream)" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="57" cy="52" r="5" fill="var(--color-cream)" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="44" cy="53" r="2" fill={OUTLINE} />
          <circle cx="58" cy="53" r="2" fill={OUTLINE} />
          <path d="M45 60 Q50 64 55 60" fill="none" stroke={OUTLINE} strokeWidth="2" />

          {/* pilgrim hat */}
          <path d="M37 42 L40 22 H60 L63 42 Z" fill="#1f1a17" stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="39" y="34" width="22" height="5" fill="var(--color-bark)" />
          <rect x="45" y="32" width="10" height="9" rx="1" fill="var(--color-mustard)" stroke={OUTLINE} strokeWidth="1.5" />
          <rect x="48" y="35" width="4" height="3" fill="#1f1a17" />
          <ellipse cx="50" cy="43" rx="20" ry="4" fill="#1f1a17" stroke={OUTLINE} strokeWidth="2.5" />
        </svg>
      </div>

      <div className="relative flex-1 mb-6" aria-live="polite">
        <p
          key={lineKey}
          className="animate-pop motion-reduce:animate-none origin-bottom-left relative bg-cream border-2 border-bark rounded-2xl rounded-bl-sm px-3 py-2 font-display text-base leading-snug text-bark hard-shadow"
        >
          {line}
        </p>
        <span
          className="absolute -left-2 bottom-2 w-3 h-3 bg-cream border-l-2 border-b-2 border-bark rotate-45"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
