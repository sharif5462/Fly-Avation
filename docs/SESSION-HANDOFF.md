# Session handoff

This project is being built across many sessions. A session's context window
fills up long before the project is finished, so the thread gets handed to a
fresh one. A fresh session starts **cold** — it has the code but none of the
decisions, none of the scope constraints, and no idea what was about to
happen next.

This file is the warm start.

**To open a new session:** start it with

> Read `docs/SESSION-HANDOFF.md` and continue from there.

**Before ending a session:** update sections 3 and 7 — repository state and
where to pick up. Everything else changes rarely. A handoff file that is one
session stale is worse than none, because it is believed.

---

## 1. The standing role

The user's directive, which does not expire between sessions:

> You are my dedicated Senior Software Architect, Staff Software Engineer, QA
> Lead, SQA Engineer, Security Auditor, Performance Engineer, Product Analyst,
> and Technical Consultant.
>
> Your responsibility is NOT just to write code. Your responsibility is to
> continuously improve my entire software project from every possible
> perspective. Treat this project like a production-grade enterprise
> application.

Lenses to work through, as relevant to the task: Understand → Product Analysis
→ Market Analysis → Architecture Review → Code Review → Static Analysis →
Security Audit → Performance Review → Database Review → API Review → Frontend
Review → QA Review → SQA Review → Test Automation → Bug Hunting →
Documentation → Refactoring → Release Readiness.

Standards: Clean Code, SOLID, DRY, KISS, YAGNI, Clean Architecture, DDD where
appropriate, Secure by Default, Test-Driven mindset.

The hard constraints, verbatim:

> Never generate quick hacks. Never ignore warnings. Never ignore TODOs. Never
> leave broken code.
>
> Act like you are responsible for maintaining this codebase for the next five
> years.

The user writes mostly in Bengali. Match their language in conversation;
code, commits, comments and documentation stay in English.

---

## 2. Current scope constraint

**Frontend UI only.** The user's binding decision, verbatim:

> আমি এখনই ডাটাবেজে কুয়েরী বা ম্যানুপুলেশন বা আর্কিটেকচার এর কাজ করব না। আমি
> আগে ফ্রন্টএন্ড ইউয়াই বানাবো তারপর আমি বাকী কাজ করব

*(No database, query or architecture work right now — the frontend UI comes
first, the rest afterwards.)*

So: no DDL, no schema design, no stored procedures, no migration plans, no
backend or API architecture proposals, unless the user reopens that door.

Deferred **by the user's own decision**, not forgotten — do not re-raise these
unprompted:

- `tenant_id` / partitioning design for the multi-company schema
- Oracle VPD (`DBMS_RLS`) row-level security as tenant-isolation defence in depth
- The column nullability audit — 0 of 1,223 columns are currently marked
  optional, because the `f()` config builder defaults to `required: true` and
  nothing overrode it. An `optional()` builder now exists; the flag is the
  `NOT NULL` specification the schema will be generated from.

The build order the user chose, and is following: **frontend → database and its
queries/procedures → API repository.**

---

## 3. Repository state

> Update this section at the end of every session.

| | |
|---|---|
| Repo | `sharif5462/Fly-Avation` |
| Branch | `claude/architecture-mastery-program-2jr6yc` |

**Develop and push only on that branch.** Never push elsewhere. Never open a
pull request unless the user explicitly asks for one.

Start by running `git log --oneline -8` and `git status`. A commit hash written
into this file could never describe the commit that contains it, so it is not
recorded here — git is the authority on where the branch stands.

The arc so far, oldest first, so you can see what has already been settled:

1. Correctness and security pass — timezone-corrupted dates, the mock backend
   shipping to production, token expiry, `Access Control` that granted nothing.
2. Accessibility and resilience — dark-mode text at 1.00:1 contrast, dashboards
   that spun forever on a failed request.
3. Scope — 17 modules added, closing the gaps against aviation ERP norms.
4. Multi-company, built before the schema so the schema inherits it.
5. A Ctrl/Cmd+K command palette, because a 432-entry sidebar cannot be browsed.
6. Repairs to the test tooling itself (see section 6).

Measured scale — counted from the manifest and the route sweep, not remembered:

| | | |
|---|---|---|
| Modules | 43 | |
| Nav entries | 432 | what the sidebar lists |
| Routes | 431 | one manifest item is deliberately not routed |
| Distinct screens | 404 | = 383 entity configs + 21 flagship pages |

Those three numbers differ on purpose and are routinely confused. Nav entries
exceed routes because BI's *Dashboard* lives at the top-level `/dashboard`
rather than under its module — the single rule is `isRoutedUnderModule()` in
the manifest, consulted by the router, the sidebar and the route sweep. Routes
exceed screens because several entries share one screen.

---

## 4. What the app is

An aviation ERP frontend. Angular 20 — standalone components, signals, the new
`@if`/`@for` control flow — on PrimeNG 20 with a custom Aura preset. There is
no real backend yet: a mock HTTP interceptor serves everything and is stripped
from production builds by `angular.json` `fileReplacements`.

**Most screens are not hand-written.** A manifest
(`src/app/core/data/module-manifest.ts`) plus per-entity configs
(`src/app/core/data/entity-configs/`) drive one generic `FeatureListPage` that
renders every CRUD screen. Adding a screen means adding a manifest entry and a
config — not a component. This is why the project carries 404 screens and stays
maintainable. Preserve it. Manifest invariants are covered by specs: every item
has a config, no orphan configs, no duplicate keys within a module, keys are
route-safe, selects have options.

The user's long-term vision, stated explicitly: this ERP should eventually
manage **all the world's airlines, their subsidiaries, suppliers and buyers** —
not one airline or one airport. Multi-company was built early with that in mind.

`README.md` is the reference for how it all fits together. Read it before
changing anything structural.

---

## 5. Decisions already made

Full reasoning in `docs/adr/`. The short version, because these are the ones
easy to break by accident:

- **0001 — Date-only vs. instant.** A `YYYY-MM-DD` calendar day must never pass
  through UTC conversion. All conversion goes through
  `src/app/core/utils/date.util.ts`. **Never** use `toISOString().slice(0, 10)`
  for a calendar date — it silently shifts the day in any non-UTC timezone.
  This was a real, reproduced bug, not a theoretical one.
- **0002 — Demo build separate from production.** The mock backend lives behind
  the barrel `src/app/core/mock/index.ts`, replaced at build time by
  `index.prod.ts`. Anything outside `core/mock/` must import from the barrel,
  never from a file inside it, or the mock leaks into production.
- **0003 — Module-key authorization.** Manifest role ownership plus
  admin-granted extras, enforced by `core/auth/module-access.service.ts`, whose
  cache is keyed on user *and* company.
- **0004 — Semantic colour tokens.** Use PrimeNG semantic tokens, never the raw
  `--p-surface-N` scale — the raw scale does not invert between light and dark.
  It once produced a 1.00:1 contrast ratio, i.e. literally invisible dashboard
  numbers. `src/styles.scss` carries the rule; `npm run test:contrast` enforces
  it.
- **0005 — Multi-company.** `X-Company-Id` on every non-auth request,
  `company_id` as the future partition key, `CompanyContextService` holding the
  active company. Cross-company reads must 404, not 403 — a 403 confirms the
  row exists.

---

## 6. Verification discipline

**Verify in a real browser. Do not verify by reasoning.** That habit is what
caught the invisible dark-mode text and the dashboards that spun forever on a
failed request; reasoning had already pronounced both fine.

The corollary matters just as much: **the verification tools have themselves
been wrong** more than once — a contrast checker that treated translucent
backgrounds as opaque, a route sweeper that flagged a route deliberately never
generated. A green tool you have not sanity-checked proves nothing. Check the
tool before you trust its verdict.

Gates — all must pass before any commit:

```
npm run lint
npm run typecheck
npm run test:ci        # unit tests + coverage
npm run build          # production
npm run build:demo
npm run test:contrast  # static grep + rendered Chromium audit, both themes
npm run test:routes    # visits every generated route
npm run test:company   # multi-company scoping, in a browser
npm run test:palette   # command palette, in a browser
```

The last four need a dev server at `http://127.0.0.1:4200`. Start it with
**`npm run serve`**, not `npm start` — `start` passes `--open`, which throws
`spawn xdg-open ENOENT` in a container.

Environment notes that will otherwise cost an hour:

- **Never** run `playwright install` — it is disabled in this image, and
  Chromium is already at `/opt/pw-browsers`. Every browser-backed check
  resolves it through `tools/chrome.mjs`; set `CHROME_BIN` to override. Do not
  reintroduce `process.env.CHROME_BIN || undefined`, which silently hands
  Playwright a path that does not exist on this image.
- There is deliberately **no** `karma.conf.js`. The Angular builder supplies
  `ChromeHeadlessNoSandbox`. The old one referenced two uninstalled packages
  and silently never loaded. Do not recreate it.
- Browser-level failure injection via `page.route()` does **not** work against
  the mock backend — `mockApiInterceptor` short-circuits before the network
  ever sees the request. Use `HttpTestingController` in a unit test instead.
- Do not judge a gate through a pipe. `npm run test:ci | tail` reports
  `tail`'s exit status, so a run that never launched a browser still looks
  like a pass. Redirect to a file and check `$?`.

---

## 7. Where to pick up

> Update this section at the end of every session.

Frontend work offered to the user, awaiting their choice. **Do not start until
they pick one.**

| | | |
|---|---|---|
| **A** | Excel/CSV export from scaffold tables | *Recommended first* — every ERP user expects it, and it lands once for all 383 screens |
| **B** | Column chooser and reorder, persisted per user | *Recommended second* — 383 tables, and no two roles want the same columns |
| **C** | Per-column filters | |
| **D** | Bulk actions — multi-select and batch operations | |
| **E** | Row detail drawer | |

Known frontend debt. Stated plainly rather than hidden, and none of it is
currently blocking:

- Prettier: 110 files unformatted. Prettier is *configured* in `package.json`
  but is not a declared devDependency and has no npm script — config for a tool
  the project does not actually depend on. Left alone deliberately: adopting it
  reformats 110 files, and that diff would bury whatever it is committed
  alongside. Worth doing as a commit of its own, on the user's say-so.
- Coverage: statements 82.96%, **branches 59.19%**. Branches are the weak
  number, and dashboards are where they are weakest.
- 7 of the 8 dashboards have no component specs.
- The 383 scaffold pages page, sort and filter **client-side**. Fine against the
  mock; will not survive a real backend against real row counts. The typed
  `ListQuery` on `ApiService` already exists to carry this server-side when the
  API is built.
- The rendered-contrast pass is not wired into CI — it runs locally only.
