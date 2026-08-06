# ADR 0002 — The demo backend is removed at build time, not switched off at runtime

- **Status:** Accepted
- **Date:** 2026-08-06

## Context

There is no .NET/Oracle backend yet, so `core/mock/` implements the whole REST
contract client-side and `environment.useMockApi` decides whether it answers.

`environment.prod.ts` shipped with `useMockApi: true` and a `TODO` to change
it. That meant `npm run build` — the default configuration, the one a deploy
pipeline runs — produced an artifact where:

- authentication was performed by `core/mock/mock-users.ts` against plaintext
  passwords, so anyone loading the page could sign in as `superadmin` /
  `super123` with every role in the system;
- the login screen advertised nine real usernames and job titles;
- all data came from the seeded localStorage store.

Simply setting `useMockApi: false` fixes the authentication hole but not the
rest. `environment` is a plain exported object, so the bundler cannot prove
the flag is never true; the mock interceptor, the seed data, the fake-data
generator and the credential list all still shipped — roughly 27 kB of
transfer, and `super123` still sitting in the JavaScript for anyone who looks.

The demo build is genuinely useful though: it is how stakeholders see the 240
screens before the backend exists. Deleting the mock layer was not an option.

## Decision

Three build configurations, and a single import seam.

| Configuration | Command | `useMockApi` | `core/mock` |
| --- | --- | --- | --- |
| `production` | `npm run build` | `false` | replaced with a stub |
| `demo` | `npm run build:demo` | `true` | real |
| `development` | `npm start` | `true` | real |

`src/app/core/mock/index.ts` is the only module the rest of the app may import
from. `angular.json`'s production configuration `fileReplacements` swaps it
for `index.prod.ts`, which exports the same surface — a pass-through
interceptor, a no-op `resetMockDatabase`, an empty `DEMO_ACCOUNTS`,
`MOCK_BACKEND_AVAILABLE = false` — and imports nothing else from `core/mock/`.
The bundler then drops the rest of the directory.

Deep imports (`core/mock/mock-users`) bypass the replacement, so CI greps the
production bundle for `super123`, `mockdb:` and `No mock handler for` and
fails if any appear.

## Consequences

- A production deploy cannot authenticate against demo credentials, whatever
  anyone does to the environment flag.
- Initial transfer drops from ~264 kB to ~236 kB.
- The demo path is still a first-class, optimized build and is exercised on
  every CI run, so it cannot rot while only production is tested.
- New code must import from `core/mock`, not from files inside it. The CI
  grep is what enforces this; the barrel's doc comment explains why.
- `index.ts` and `index.prod.ts` must be kept in sync by hand. The exported
  surface is five symbols, and the production build fails loudly on a missing
  one, so this is a cheap constraint — but it is a real one.
