---
name: dogfood
description: 'Play-test a running web app like a critical dogfooder and report on fun, engagement, UX, and bugs. Use when asked to dogfood, play-test, playtest, critique, review how fun or usable an app is, give honest product feedback, or hunt for state/flow bugs in the browser.'
argument-hint: 'Optional focus area (e.g. "onboarding", "mobile", "checkout flow")'
---

# Dogfood the App

Use the running app end-to-end in the browser as a skeptical real user, then deliver blunt, prioritized feedback. **Report only** — do not change code; offer fixes at the end.

## Procedure

### 1. Get a clean session
- Reuse a shared browser page if one exists; otherwise start the dev server and open it.
- If the app restored prior state (localStorage, cookies, session), note it, then reset to the first-run experience.
- Skim the project's README/agent guide to learn the app's core loop and where state lives.

### 2. Walk the core loop as a user
Screenshot each new screen and judge first impressions before reading any code.
1. **Entry / onboarding** — Is the pitch compelling? Is the first action obvious?
2. **Main screen** — Readability, tap-target size, hierarchy, visual identity vs. generic defaults.
3. **Core actions** — Does each interaction give satisfying feedback? Is progress visible?
4. **Success moment** — Is the payoff proportional? What are the next actions?
5. **After success** — Is continued use rewarded, or does the app go flat?

### 3. Try to break it
- **Undo/reverse** an action that triggered a success state — does derived state (banners, highlights, scores) update?
- **Repeat** the success action — is it recognized again?
- **Navigate away** (back, reset, close) mid-flow — is work lost without confirmation?
- **Reload** mid-flow — is state restored correctly?
- Watch for **layout shift** when banners, toasts, or modals appear.
- Try narrow (mobile) and wide viewports if relevant.

When behavior looks wrong, **read the responsible code** to confirm the root cause and cite exact lines.

### 4. Judge content and mechanics
- Is content varied enough for replay, or identical every time?
- Is content too easy, too hard, or actually engaging?
- Does the mechanic enforce the app's intended behavior, or can users shortcut it?

### 5. Report
Use the [report template](./assets/report-template.md). Rules:
- Lead with a one-line verdict and a **score out of 10**.
- Bugs first, each reproduced in-browser and linked to source lines.
- Be specific and blunt; every criticism names a concrete symptom.
- End with a prioritized fix list and offer next steps (fix bugs, or hand off to relevant design/content agents if the repo has them).

## Quality bar
- [ ] Walked entry → core loop → success → post-success
- [ ] Tested undo, repeat, navigate-away, and reload edge cases
- [ ] Every bug reproduced in the browser and traced to code
- [ ] Feedback covers fun/engagement, not just correctness
- [ ] No code changes made
