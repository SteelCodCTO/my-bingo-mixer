# Design Spec

## Card Deck Shuffle mode

**Intent:** Each player opens the game, taps once, and gets a random icebreaker card. No board and no scoring.

### Flow
1. On the start screen, a secondary **Shuffle the Deck** button (snow fill, ink text) sits below the primary **Pass the Bingo** button.
2. The deck screen opens with a face-down card that says "Tap to draw!".
3. Tapping flips the card face up to show "Find someone who …" and a random question from `questions.ts`.
4. Swipe **right** (or tap **Found 'em →**) for success, or swipe **left** (or tap **← Skip**) for fail. Either one records the result and draws the next card. The same question never comes up twice in a row (uses `pickLine`).
5. **← Back** goes back to the start screen.

### Decisions
- **State:** `GameState` gets a new `'deck'` value, and the storage validator whitelists it, so a refresh keeps you in deck mode. The drawn card isn't saved, so a reload shows the deck face down again. Old saved games are still valid, so `STORAGE_VERSION` stays the same.
- **Card back:** a `stripes-70s` candy-cane panel inside a berry frame, with a tilted snow "Tap to draw!" label. Two offset berry and ruby cards behind it look like a stacked deck.
- **Card face:** a snow card with a pine "Find someone who" badge, the question in `font-display text-3xl`, and berry ★ pips in opposite corners like a playing card.
- **Motion:** a new `animate-flip` (rotateY 90°→0) replays when the React `key` (`cardKey`) changes. It's disabled with `motion-reduce`.
- **Sizing:** the card is `w-[min(100%,20rem,37.5vh)]` at a 3:4 aspect ratio, so it fits both narrow and short viewports. Question text uses `clamp()` sizing.
- **Swipe:** pointer events on a wrapper div (the card itself keeps `animate-flip`, whose fill mode would override an inline transform). The card follows your finger and tilts (`dragX/15` degrees). The swipe threshold is 90px. A shorter drag snaps back. `touch-pan-y` keeps vertical scrolling working.
- **Feedback:** while dragging, a tilted stamp fades in with drag distance: "Found 'em!" (pine) on the right and "No dice" (ruby) on the left.
- **Buttons:** ruby **← Skip** on the left and pine **Found 'em →** on the right, matching the swipe directions. They're the accessible alternative to swiping.
- **Tally:** pine "Found N" and ruby "Skipped N" pills above the card. They reset when you enter deck mode and aren't saved.
- **A11y:** a stable `sr-only` `aria-live="polite"` region announces each drawn card. The card button has a plain-English `aria-label`.

### Open ideas (not built)
- Larry reacting to each draw
- A card exit fly-off animation
