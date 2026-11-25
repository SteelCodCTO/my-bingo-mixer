---
description: "Use when building or restyling UI, components, screens, colors, typography, animations, or copy for the Christmastime in Boston retro-70s bingo theme. Covers design tokens, button/card patterns, motion, mascot, and voice."
applyTo: ["src/components/**/*.tsx", "src/index.css", "src/data/**/*.ts"]
---
# Design Guide: Wicked Good Jingle Bingo

Retro 70s Christmas card, with Boston flavor. Green, white, and red with a touch of gold. Chunky and playful. Tailwind v4 rules: [tailwind-4.instructions.md](./tailwind-4.instructions.md).

## Tokens (defined in `@theme` in [src/index.css](../../src/index.css))

- Use only palette tokens: `snow`, `frost`, `gold`, `berry`, `ruby`, `pine`, `ink` (plus `marked` for stamped squares). Never use stock Tailwind colors (`gray-*`, `blue-*`, `red-*`) or `white`/`black`.
- `ink` is the text and outline color. Use `ink/80` for secondary text and `ink/70` for overlays.
- `berry` is the primary red (buttons, stamps, Larry), `pine` is the green (badges, winning line, banners), and `gold` is for small accents only (title shadows, ornament caps).
- Fonts: `font-display` (Shrikhand) for titles, buttons, and big moments. Body text inherits Fraunces. Use italic for taglines and helper text.
- Add new colors or animations to `@theme`, not as arbitrary hex values.

## Signature patterns

- Outlines: `border-2 border-ink`, with rounded corners (`rounded-xl` for squares, `rounded-2xl` or `rounded-3xl` for cards, `rounded-full` for buttons).
- Depth: the `hard-shadow` utility (a flat offset shadow in ink). No soft or blurred `shadow-*`.
- Backgrounds: `sunburst` (solid pine with snow rays) for screens and hero cards. Text placed directly on it is `snow` (headings may use `gold` with an ink drop shadow); the bingo banner uses `berry` so it stands out from the green. Use `stripes-70s` bands (diagonal berry/snow candy cane with ink edges, `h-3` to `h-6`, `aria-hidden`) at screen edges. Avoid horizontal green/white/red bands (reads as the Italian flag).
- Primary button:
  ```tsx
  className="bg-berry text-snow font-display rounded-full border-2 border-ink hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
  ```
- Badge or label: `bg-pine text-snow text-xs font-bold uppercase tracking-widest rounded-full`.
- Square states: unmarked uses `snow`, marked uses `marked` with a berry border and a berry ★ stamp, winning uses `pine` with `animate-wobble`, and the free space is a gold ornament on `berry`.

## Motion

- Use the theme animations: `animate-rise` (page entrance, staggered with `[animation-delay:100ms]` steps), `animate-pop` (stamps, bubbles, modals), `animate-wobble` (celebration), and `animate-bob` (idle mascot).
- Pair any looping or decorative animation with `motion-reduce:animate-none`.
- To replay an animation, change the element's React `key`. Don't use timers.

## Voice and copy

- Christmas/winter + Boston accent, family-friendly: "Wicked good", "staht", "keepah", "Pass the cocoa". No Thanksgiving or fall references.
- Keep bingo prompts short (7 words or fewer) so they fit 60px tiles at 375px width.
- Keep `aria-label` text plain English (for example "Free space"), even when the visible text is themed.

## Mascot: Larry the Lobstah

- Larry is an inline SVG in [LobsterMascot.tsx](../../src/components/LobsterMascot.tsx): a flat-shaded lobster (`berry` body, `ruby` tail and claw arms) with ink outlines (`strokeWidth` 2.5) in a berry Santa hat with a snow brim and pom-pom.
- Lines live in [mascotLines.ts](../../src/data/mascotLines.ts). The SVG and visible bubble are `aria-hidden`; a stable `sr-only` `aria-live="polite"` region announces greetings and celebrations only (not per-tap `MARK_LINES`).
- Larry's voice plays pre-generated Piper TTS clips from `public/audio/larry/` via [larryVoice.ts](../../src/utils/larryVoice.ts). If a clip is missing, it falls back to browser speech ([speech.ts](../../src/utils/speech.ts)). The header 🔊 button mutes it. Only play audio in response to a tap; browsers block audio before a user gesture. Write lines phonetically ("staht", "keepah") so the voice sounds Boston, and run `npm run audio:larry` after editing lines.

## Accessibility

- Contrast: use `ink` on `snow`/`frost`/`marked`/`gold`, and `snow` on `berry`/`ruby`/`pine`/`ink`. Never put `gold` text on `snow`.
- Mark decorative emoji and stripe bands `aria-hidden="true"`.
