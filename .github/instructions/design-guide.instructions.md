---
description: "Use when building or restyling UI, components, screens, colors, typography, animations, or copy for the Thanksgiving in Boston retro-70s bingo theme. Covers design tokens, button/card patterns, motion, mascot, and voice."
applyTo: ["src/components/**/*.tsx", "src/index.css", "src/data/**/*.ts"]
---
# Design Guide: Wicked Good Gobble Bingo

Retro 70s Thanksgiving card, with Boston flavor. Warm, chunky, and playful. Tailwind v4 rules: [tailwind-4.instructions.md](./tailwind-4.instructions.md).

## Tokens (defined in `@theme` in [src/index.css](../../src/index.css))

- Use only palette tokens: `cream`, `parchment`, `mustard`, `pumpkin`, `cranberry`, `bark`, `harvest`. Never use stock Tailwind colors (`gray-*`, `blue-*`, `amber-*`) or `white`/`black`.
- `bark` is the text and outline color. Use `bark/80` for secondary text and `bark/70` for overlays.
- Fonts: `font-display` (Shrikhand) for titles, buttons, and big moments. Body text inherits Fraunces. Use italic for taglines and helper text.
- Add new colors or animations to `@theme`, not as arbitrary hex values.

## Signature patterns

- Outlines: `border-2 border-bark`, with rounded corners (`rounded-xl` for squares, `rounded-2xl` or `rounded-3xl` for cards, `rounded-full` for buttons).
- Depth: the `hard-shadow` utility (a flat offset shadow in bark). No soft or blurred `shadow-*`.
- Backgrounds: `sunburst` for screens and hero cards, and `stripes-70s` bands (`h-3` to `h-6`, `aria-hidden`) at screen edges.
- Primary button:
  ```tsx
  className="bg-pumpkin text-cream font-display rounded-full border-2 border-bark hard-shadow transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
  ```
- Badge or label: `bg-cranberry text-cream text-xs font-bold uppercase tracking-widest rounded-full`.
- Square states: unmarked uses `cream`, marked uses `marked` with a pumpkin border and a ★ stamp, and winning uses `cranberry` with `animate-wobble`.

## Motion

- Use the theme animations: `animate-rise` (page entrance, staggered with `[animation-delay:100ms]` steps), `animate-pop` (stamps, bubbles, modals), `animate-wobble` (celebration), and `animate-bob` (idle mascot).
- Pair any looping or decorative animation with `motion-reduce:animate-none`.
- To replay an animation, change the element's React `key`. Don't use timers.

## Voice and copy

- Thanksgiving + Boston accent, family-friendly: "Wicked good", "staht", "keepah", "Back to the Table".
- Keep bingo prompts short (7 words or fewer) so they fit 60px tiles at 375px width.
- Keep `aria-label` text plain English (for example "Free space"), even when the visible text is themed.

## Mascot: Larry the Lobstah

- Larry is an inline SVG in [LobsterMascot.tsx](../../src/components/LobsterMascot.tsx): a flat-shaded lobster with bark outlines (`strokeWidth` 2.5) in a black pilgrim hat with a mustard buckle.
- Lines live in [mascotLines.ts](../../src/data/mascotLines.ts). The SVG is `aria-hidden`, and the speech bubble sits inside a stable `aria-live="polite"` wrapper.
- Larry's voice uses the Web Speech API via [speech.ts](../../src/utils/speech.ts), and the header 🔊 button mutes it. Only speak in response to a tap; browsers block audio before a user gesture. Write lines phonetically ("staht", "keepah") so the voice sounds Boston.

## Accessibility

- Contrast: use `bark` on `cream`/`parchment`/`mustard`, and `cream` on `pumpkin`/`cranberry`/`bark`. Never put `mustard` text on `cream`.
- Mark decorative emoji and stripe bands `aria-hidden="true"`.
