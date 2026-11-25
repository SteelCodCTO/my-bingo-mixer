# Bingo Mixer — Agent Guide

Mobile-first social bingo game: React 19 + TypeScript + Vite 8 + Tailwind CSS 4, tested with Vitest. See [README.md](README.md) for setup.

## Mandatory checklist before finishing

- [ ] `npm run lint`
- [ ] `npm run build` (runs `tsc -b`, so type errors fail the build)
- [ ] `npm test` (Vitest, jsdom, single run)

## Architecture

- [src/App.tsx](src/App.tsx) only routes between screens. All state lives in [src/hooks/useBingoGame.ts](src/hooks/useBingoGame.ts).
- Game rules are pure functions in [src/utils/bingoLogic.ts](src/utils/bingoLogic.ts), covered by [bingoLogic.test.ts](src/utils/bingoLogic.test.ts). Keep them pure and immutable (tests assert untouched squares keep identity).
- Components in [src/components/](src/components/) are presentational: props in, callbacks out.
- Shared types live in [src/types/index.ts](src/types/index.ts). Question pool lives in [src/data/questions.ts](src/data/questions.ts).

## Pitfalls

- Board is 5x5 with the free space at index 12 (pre-marked, not toggleable). `generateBoard()` takes 24 questions, so `questions` must contain **at least 24** entries.
- Game state persists to `localStorage` (`bingo-game-state`). `validateStoredData()` in the hook whitelists line types and board shape. When adding a new `BingoLine` type (e.g. `'corners'`) or changing stored shape, update the validator and bump `STORAGE_VERSION`.
- `BingoLine['type']` already includes `'corners'`, but `checkBingo()` does not implement it yet.
- Vite `base` switches to `/<repo>/game/` when `VITE_REPO_NAME` is set (GitHub Pages deploy). Use relative asset paths.

## Styling

- Tailwind v4 is CSS-first: theme tokens are in `@theme` in [src/index.css](src/index.css) (`accent`, `marked`, `bingo`, …). There is no `tailwind.config.js`.
- Follow [.github/instructions/tailwind-4.instructions.md](.github/instructions/tailwind-4.instructions.md) and the [frontend-design skill](.github/skills/frontend-design/SKILL.md) for UI work.

## Repo layout notes

- [workshop/](workshop/GUIDE.md) holds lab markdown (with `es/` and `pt_BR/` translations). [docs/](docs/index.html) is a separate static site deployed at the Pages root. The app is deployed under `/game/` (see [.github/workflows/deploy.yml](.github/workflows/deploy.yml)). When editing lab content, keep translations in sync.
- Custom agents live in [.github/agents/](.github/agents/): Quiz Master (questions), Pixel Jam (UI), UI Review, and a TDD orchestrator with Red/Green/Refactor subagents.
