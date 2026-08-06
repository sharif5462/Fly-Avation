# ADR 0004 — Styling uses semantic theme tokens, never the raw surface scale

- **Status:** Accepted
- **Date:** 2026-08-06

## Context

The app ships a light and a dark theme, switched by an `.app-dark` class on
`<html>` (`darkModeSelector` in `app.config.ts`).

PrimeNG exposes two kinds of colour token, and they behave very differently:

- **Semantic** — `--p-text-color`, `--p-text-muted-color`,
  `--p-content-background`, `--p-content-hover-background`,
  `--p-content-border-color`. Each is defined with CSS `light-dark(a, b)` and
  therefore resolves to a *different* value per colour scheme.
- **Raw scale** — `--p-surface-0` … `--p-surface-950`. These are a plain
  light→dark ramp, and Aura does **not** invert them for dark mode. On this
  preset `--p-surface-900` is `#1d2534` in light and `#161d29` in dark: dark
  navy in both.

The stylesheets used the raw scale for text and hover surfaces in 28 places.
In dark mode `--p-content-background` correctly flipped to `#161d29` while
`color: var(--p-surface-900)` stayed `#161d29` — identical to the background.
Measured in a browser, the dashboard KPI values came out at a **1.00:1**
contrast ratio: the numbers were not dim, they were invisible. Panel titles
(1:1), quick links (1.1:1) and the sidebar brand (1:1) were the same bug;
`background: var(--p-surface-100)` was the mirror image, flashing a near-white
hover behind white text.

A separate, subtler instance: Aura maps muted text and several component
tokens to `{surface.500}`, which on this palette scores 3.49:1 in light mode —
under the 4.5:1 WCAG AA minimum for normal text. That one was legible but
non-conformant, and it covered page descriptions, KPI labels, record counts,
select placeholders and secondary button labels.

None of this was caught by review, by `strictTemplates`, or by the existing
tests, because CSS custom properties resolve at paint time. Nothing short of
rendering the page can see it.

## Decision

1. **Only semantic tokens may be used for colour.** The mapping is documented
   at the top of `src/styles.scss`, next to the code it governs.
2. Where PrimeNG has no semantic token — the page "ground" behind the cards —
   the app defines its own with `light-dark()`:
   `--app-page-background: light-dark(var(--p-surface-50), var(--p-surface-950))`.
3. Tokens that were merely *too pale* rather than wrong are corrected once, in
   the preset, rather than per call site: `text.mutedColor`,
   `formField.placeholderColor`, `button.outlined.secondary.color` and
   `badge.danger.background`.
4. `npm run test:contrast` enforces both halves:
   - a **static** pass that greps for the raw scale used as a colour, which
     runs anywhere and needs no browser;
   - a **rendered** pass that drives Chromium over representative routes in
     both themes, resolves every text node's computed colour against its
     composited background, and fails anything under AA.

The rendered pass composites translucent ancestors rather than taking the
first non-transparent background at face value — without that it scored a
12%-opacity brand tint as solid brand colour and reported active nav links as
unreadable when they were fine.

## Consequences

- Both themes are AA-clean on the audited routes, verified by measurement
  rather than by eye.
- Adding a raw-scale colour now fails CI with a file and line number.
- The rendered pass needs a dev server; it skips (rather than fails) when one
  is not reachable, so the static pass still guards ordinary CI runs. Wiring
  the rendered pass into CI means starting the demo build first — worth doing,
  and not yet done.
- Route coverage is a sample, not exhaustive: four routes covering a
  dashboard, a flagship CRUD page and a scaffold page. A component style that
  only appears elsewhere can still regress. Extending `routes` in
  `tools/check-contrast.mjs` is a one-line change per route.
