# Aviation ERP — Angular Frontend

Angular 20 frontend for a full aviation ERP: 43 modules, 404 screens, JWT
authentication with role-based authorization, running today on mock data and
built to drop onto a .NET Web API + Oracle backend with no component changes.

```
Angular  →  .NET Web API  →  Business Logic Layer  →  Oracle Database
```

This repo is the Angular side only. It talks to the backend exclusively
through `ApiService` (`src/app/core/services/api.service.ts`), which builds
every request as `${environment.apiUrl}/<resource>[/<id>]`. As long as the
.NET API implements the contract below, nothing on the frontend needs to
change to go live.

## Running it

```bash
npm install
npm start        # ng serve, http://localhost:4200
```

No backend is required to run this today — every request is intercepted and
served from seeded, localStorage-backed mock data (see **Mock data layer**
below). Sign in with any of the demo accounts shown on the login screen
(click one to auto-fill its credentials), e.g. `superadmin` / `super123`.

### Builds

| Command | Backend | Demo accounts | Use it for |
| --- | --- | --- | --- |
| `npm start` | mock | shown | local development |
| `npm run build:demo` | mock | shown | stakeholder demos, UAT sandboxes |
| `npm run build` | **real API at `/api`** | **absent** | production |

`npm run build` does not merely switch the mock layer off — `angular.json`
replaces `src/app/core/mock/index.ts` with a stub, so the mock interceptor,
the seed data and the demo credentials are not in the artifact at all. See
`docs/adr/0002-demo-build-separate-from-production.md`.

Anything outside `core/mock/` must import from **`core/mock`** (the barrel),
never from a file inside it, or the replacement is bypassed. CI greps the
production bundle and fails if it finds mock artifacts.

### Checks

```bash
npm run lint           # ESLint + angular-eslint, including template a11y rules
npm run typecheck      # tsc --noEmit
npm test               # Karma/Jasmine, watch mode
npm run test:ci        # headless, single run, with coverage
npm run test:contrast  # WCAG contrast audit (see below)
npm run test:routes    # visits every route in a browser (needs a dev server)
npm run test:company   # multi-company switch/scope/persist check (needs a dev server)
npm run test:palette   # command palette keyboard/search check (needs a dev server)
```

These run on every push and pull request — see `.github/workflows/ci.yml`.

**`test:contrast`** has two halves. The static half greps the stylesheets for
the raw `--p-surface-N` scale used as a colour and needs nothing else, so it
runs in CI. The rendered half drives Chromium over a sample of routes in both
themes and measures every text node's real contrast ratio; it needs a dev
server (`npm start`) and skips itself when one is not reachable.

## Architecture

```
src/app/
  core/               # framework-agnostic app plumbing, no UI
    auth/              AuthService, ModuleAccessService, CompanyContextService,
                       authGuard, roleGuard, authInterceptor, companyInterceptor
    interceptors/      errorInterceptor (401/403/5xx handling)
    services/          ApiService (request URLs), ScreenSearchService,
                       RecentScreensService, CommandPaletteService
    models/            Role, User, Company, EntityConfig, ModuleDef — shared types
    data/              module-manifest.ts, entity-configs/ (see below)
    mock/              mock API interceptor + seed data (dev/demo only)
    utils/             date.util.ts (date-only vs. instant),
                       dashboard-loader.ts (load/error/retry state)
    theme/             PrimeNG theme preset
  layout/             Shell, Sidebar, Topbar, Breadcrumb, CommandPalette
  shared/
    components/        PageHeader, StatCard, LoadError — small reused pieces
    scaffold/           FeatureListPage — the generic CRUD engine (below)
  features/
    auth/login/
    errors/                     403, 404

    # the 21 flagship (hand-built) pages — see "Flagship vs scaffold" below.
    # Everything else in the app is the scaffold; it has no folder here.
    business-intelligence/      dashboard
    flight-operations/          flight-scheduling
    fleet-management/           aircraft-registration
    aircraft-maintenance/       mro-dashboard, work-orders, component-tracking
    crew-management/            pilot-management
    inventory-spare-parts/      spare-parts-inventory
    warehouse-management/       warehouse-dashboard, item-master
    procurement/                purchase-orders
    resource-gate-management/   resource-dashboard
    baggage-handling-system/    baggage-handling-dashboard, baggage-handling
    landside-operations/        landside-dashboard
    facilities-assets/          facility-dashboard, asset-master
    safety-management-system/   sms-dashboard, hazard-reporting
    security-management/        user-roles, access-control
```

### The 43 modules

**Flight & network** — Flight Operations · Flight Planning & Dispatch ·
Disruption Management (IROPS) · Load Control & Weight/Balance

**Fleet & engineering** — Fleet Management · Aircraft Maintenance (MRO) ·
Continuing Airworthiness (CAMO) · Aircraft Leasing & Finance

**Crew** — Crew Management · Crew Training & Licensing

**Commercial** — Passenger Reservation · Revenue Management & Pricing ·
Ancillary Revenue & Retailing · Distribution (GDS/NDC) · Special Services
(SSR/PRM) · CRM

**Airport & ground** — Airport Operations · Resource & Gate Management ·
Baggage Handling (BHS) · Landside Operations · Ground Handling Agreements ·
Cargo Management

**Supply chain** — Inventory & Spare Parts · Warehouse Management ·
Procurement · Fuel Management · Facilities & Assets

**Finance** — Finance & Accounting · Revenue Accounting & Settlement

**People & governance** — Human Resource · Compliance & Safety · Safety
Management System (SMS) · Quality Assurance · Aviation Security (AVSEC) ·
Sustainability & Emissions

**Platform** — Organization (multi-company setup) · Workflow & Approvals ·
Document Management · Business Intelligence · IT & Application Security ·
Self-Service Portals · Integration Hub · Notification System

### Flagship pages vs. the generic scaffold

Hand-building 404 unique screens up front isn't a good use of time before
there's a real backend to wire them to. Instead:

- **21 flagship pages** are fully hand-built: typed models, bespoke table
  columns, KPI cards, dedicated reactive forms. These are the reference
  implementation — copy one of these when a scaffold page needs to graduate
  to something bespoke. Eight are dashboards — the landing Dashboard plus
  MRO, Warehouse, Baggage Handling, Landside, Facility, SMS and Resource &
  Gate Management. The other thirteen are Flight Scheduling, Aircraft
  Registration, Work Orders, Component Tracking, Pilot Management, Spare
  Parts Inventory, Item Master, Purchase Orders, Bag Tracking (Res. 753),
  Asset Master, Hazard Reporting, User Roles and Access Control.
- **The other 383 screens** are all real, working CRUD screens too — search,
  sortable table, add/edit dialog with validation, delete confirmation —
  just rendered by one shared component, `FeatureListPage`, configured
  per-entity instead of hand-coded per-entity.

**How the scaffold works:** `core/data/module-manifest.ts` defines all 43
modules and their sub-items (label, icon, route key, which ones are
flagship). `core/data/entity-configs/` defines the table columns + form
fields for every non-flagship item, keyed by the same route key — split into
`core-modules.ts` (the original 25 modules) and `extended-modules.ts`
(everything added since), merged by `index.ts`. In
`app.routes.ts`, every non-flagship item routes to the same lazy-loaded
`FeatureListPage` chunk with `data: { entityKey }` — so there's exactly one
extra chunk for all 383 pages, not 383 chunks.

**Screens vs. nav entries:** the sidebar has 432 entries across the 43
modules, but only 404 distinct screens. Some sub-items are deliberately
reused across modules because they're the same real-world record viewed
from a different desk — Incident Reporting appears under Compliance &
Safety, SMS, Facilities and Landside; Vendor Management under Procurement,
Warehouse and Facilities; Purchase Orders under Procurement and Warehouse;
Gate Management and Aircraft Parking under both Airport Operations and
Resource & Gate Management; Training Records under Crew Management and Crew
Training; AD Compliance under Aircraft Maintenance and CAMO. A reused key
means one route, one entity config and one dataset, not a copy — 22 of the
432 nav entries are reuses of this kind.

One manifest item is deliberately **not** routed under its own module: BI's
Dashboard is every user's landing page at `/dashboard`, so it cannot sit
behind the BI role. `isRoutedUnderModule()` in `module-manifest.ts` is the
single source of that rule — the router, the sidebar and the route smoke test
all consult it instead of repeating the condition.

**Nullability is a schema decision, not just form validation.** `f(...)`
marks a field required and `optional(...)` does not; that flag is what the
database's NOT NULL constraints will be generated from. Use `optional` for
anything a user should be able to leave blank — notes, findings, secondary
dates — or the API ends up rejecting records that ought to be saveable while
still incomplete.

**To add a new field to an existing scaffold page:** edit its entry under
`entity-configs/`. The table column and the form field both update; no
other file changes.

**To add a brand-new sub-item to a module:** add one line to its `items`
array in `module-manifest.ts` and one `entity(...)` call in
`entity-configs/extended-modules.ts`. It gets a working route, a nav entry, and a full CRUD
screen immediately — no new component, no new route file.

**To promote a scaffold page to a flagship page:** copy the pattern from
`features/flight-operations/flight-scheduling/` (typed model, dedicated
form, KPI stat cards), add it to `FLAGSHIP_LOADERS` in `app.routes.ts`, and
set `flagship: true` on that item in `module-manifest.ts`.

## Authentication & authorization

- **AuthService** (`core/auth/auth.service.ts`) holds session state in
  signals, persisted to `localStorage`. `login()` posts to
  `POST /auth/login`; the response `{ token, expiresAt, user }` is stored
  and the token is attached to every subsequent request. `expiresAt` is
  enforced: a stored session whose token has expired is discarded on
  startup rather than let through to the guards. That is a UX guarantee, not
  a security boundary — the API remains the only thing that truly validates
  a token.
- **authGuard** blocks unauthenticated access to the whole app shell and
  remembers the target URL as `?returnUrl=` for after login.
- **ModuleAccessService** (`core/auth/module-access.service.ts`) is the one
  place that answers "may this user open this module?", combining the
  manifest's owning role with any grants made on the Access Control screen.
  Both `roleGuard` and the sidebar consult it. See
  `docs/adr/0003-module-access-service.md`.
- **roleGuard**, applied once per module (not per page) in `app.routes.ts`,
  passes `route.data['moduleKey']` to `ModuleAccessService`. `SuperAdmin` and
  `Admin` bypass every check. A module with no `role` set (Notification
  System) is open to any authenticated user.
- **authInterceptor** attaches `Authorization: Bearer <token>` to requests
  bound for `environment.apiUrl`.
- **errorInterceptor** centralizes 401 (→ logout), 403 (→ `/403`), and
  network/5xx handling (→ toast) so individual pages don't each need this
  logic. Requests to `{apiUrl}/auth/*` are exempt from the 401 branch: a
  rejected sign-in is a wrong password, not an expired session, and the login
  page owns that error state.
- Roles are enumerated in `core/models/role.model.ts` — one role per
  module, plus `SuperAdmin`/`Admin`/`ReadOnly`. `security-management` →
  **Access Control** lets an admin grant a role extra access to modules
  beyond its default one; those grants are read back by
  `ModuleAccessService` and take effect in both the router and the sidebar.

> The .NET API must enforce the same rules per endpoint. Everything above
> decides what to render and route to; a user who types a URL directly still
> gets the app shell, and only the API's 403 stops the data coming back.
> The API also needs to read the same `role-permissions` table, or the two
> sides will disagree about who can see what.

## Dashboards

The eight dashboards are read-only pages that fan out to several resources and
render the combined result. They all go through
`core/utils/dashboard-loader.ts`, which owns three things a bare
`forkJoin(...).subscribe(next)` does not:

- **Failure.** `forkJoin` errors if *any* source errors. Without an error
  handler the page kept its spinner running forever with nothing on screen to
  say it had failed. The loader clears `loading`, sets `failed`, and the page
  renders `<app-load-error>` with a working **Try Again**.
- **Teardown.** `takeUntilDestroyed`, so a response arriving after the user
  navigates away doesn't write to a destroyed component.
- **Retry.** `reload()`, ignored while a request is already in flight so a
  double-click can't fan out duplicates.

Adding a dashboard means calling `createDashboardLoader(() => forkJoin({...}),
(result) => {...})` and rendering the banner on `loadFailed()` — copy any
existing one.

## Styling and colour

The app has a light and a dark theme. **Use the semantic theme tokens, never
the raw `--p-surface-N` scale:**

| For | Use |
| --- | --- |
| text | `var(--p-text-color)` |
| secondary text | `var(--p-text-muted-color)` |
| card background | `var(--p-content-background)` |
| hover surface | `var(--p-content-hover-background)` |
| borders | `var(--p-content-border-color)` |
| page background | `var(--app-page-background)` |

The semantic tokens are defined with CSS `light-dark()` and invert with the
theme. The surface scale does not — `surface-900` is a near-black navy in dark
mode too — so `color: var(--p-surface-900)` on a card rendered dark-on-dark at
a 1.00:1 ratio and made the dashboard KPI numbers invisible. `npm run
test:contrast` fails the build if the raw scale reappears. Reasoning in
`docs/adr/0004-semantic-colour-tokens.md`.

## Getting around 431 screens

The sidebar lists 432 entries across 43 collapsible groups. That is fine for
browsing and hopeless for arriving, so **Ctrl/Cmd+K** opens a command palette
that searches every screen the signed-in user can reach.

- Results are **ranked**, not just filtered: an exact label match beats a
  prefix, which beats a word-start, which beats a substring; the module name
  is the weakest signal. Typing `bag` surfaces *Bag Tracking* above
  *Mishandled Baggage*.
- Each result carries its **module name**, because labels repeat — *Incident
  Reporting* exists under four modules and is otherwise indistinguishable.
- Only screens the user can open are offered, so the palette never leads to
  a `/403`.
- With no query it shows **recently visited** screens, kept per user; ERP work
  returns to the same handful of screens all day.
- The topbar carries a visible search button — a shortcut nobody knows about
  is a shortcut nobody uses.

Keyboard: `↑`/`↓` move (wrapping), `Home`/`End` jump, `↵` opens, `Esc` closes.
Focus stays in the search box and the active option is announced via
`aria-activedescendant`, which is the WAI-ARIA combobox pattern.

## Multi-company

The app serves several legal entities from one deployment — an airline, its
ground handling arm, its maintenance organisation — keeping their records
apart. Almost every table is partitioned by company.

- **`CompanyContextService`** holds the active company, resolved as last-used
  → the user's default → first available, each re-checked against the
  companies the login response returned. A company the user has lost access to
  is discarded, not restored.
- **`companyInterceptor`** sends it as `X-Company-Id` on every API request
  except `/auth/*`. A header rather than a URL segment, so none of the ~400
  resource paths change.
- **Switching reloads the current route** and resets per-company caches —
  access can legitimately differ between entities, and every row on screen
  belongs to the company being left.
- The switcher hides itself for users who belong to one company.

**Not partitioned:** `companies` (the list of partitions itself), `users` and
`role-permissions` — a person exists once across the group and is granted
access per company.

> **The header is client-controlled.** The API must validate it against the
> companies the *token's* user belongs to and reject anything else with 403 —
> never fall back to a default. An API that trusts the header lets anyone read
> another company's data by editing one value. The mock backend models the
> correct behaviour: another company's row 404s on read, update and delete;
> `POST` takes ownership from the request context, not the payload; and `PUT`
> cannot move a record between companies.

Full reasoning and the schema consequences in
`docs/adr/0005-multi-company.md`.

## Dates

Two shapes travel over the wire and they are **not** interchangeable:

- **date-only** (`YYYY-MM-DD`) — a calendar day: licence expiry, due date,
  warranty end.
- **instant** (full ISO 8601) — a moment: departure time, bag scan.

`core/utils/date.util.ts` owns the conversion. Use `toDateOnly` /
`fromDateOnly` (or `toRequiredDateOnly` for a `Validators.required` field) for
the first, and `toInstant` for the second.

**`toISOString()` on a date-only value is a bug**, and so is
`new Date('2026-08-06')` — the first shifts the day back for users east of
UTC, the second forward for users west of it. Both look correct in UTC, which
is how the original code passed review. Full reasoning in
`docs/adr/0001-date-only-vs-instant.md`.

Demo accounts (see the login screen for the full set with job titles):
`superadmin` / `super123` has every role; the other eight are scoped to
1–2 modules each so role-gating is actually visible when testing.

## Mock data layer (dev and demo builds only — absent from production)

No .NET/Oracle backend exists yet, so `core/mock/mock-api.interceptor.ts`
intercepts every request under `environment.apiUrl` and serves it from an
in-memory store backed by `localStorage`, when `environment.useMockApi` is
`true`. It implements the same REST contract documented below, so this is a
drop-in stand-in, not a parallel code path components need to know about.

- `core/mock/index.ts` — **the only module the rest of the app imports
  from.** Production builds replace it with `index.prod.ts`, a stub with the
  same exported surface that pulls in none of the files below. Deep-importing
  any of them bypasses that replacement and puts the demo credentials back in
  the production bundle, which is what the CI grep exists to catch.
- `core/mock/mock-users.ts` — the 9 demo accounts and `/auth/login` logic.
- `core/mock/flagship-seeds.ts` — hand-written realistic seed data for the
  11 flagship resources that own a dataset. (The eight dashboards don't —
  they read the other resources; User Roles and Access Control are backed
  by the `users` and `role-permissions` resources in the same file's map.)
- `core/mock/fake-data.ts` — generates plausible seed rows for the 383
  generic scaffold resources from their `entity-configs.ts` field
  definitions (heuristic — a field named/labeled with "cost" gets a
  dollar-ish number, "airport"/"origin" gets an IATA-style code, etc.). Not
  perfect for every field name, but good enough to make every one of the
  240 pages demoable with realistic-looking data on first load.
- `core/mock/mock-db.ts` — thin `localStorage` persistence so anything
  created/edited/deleted while clicking around survives a refresh. A
  "Reset Demo Data" option lives in the user menu (top-right avatar).

**To go live against the real API:** `npm run build`. It already points at
`/api` with the mock layer stripped out; only `environment.prod.ts` needs
touching if the API lives somewhere other than the SPA's own origin. No
component or service code changes — everything already goes through
`ApiService`.

## API contract for the .NET Web API

Every resource below is a route segment from `module-manifest.ts` /
`entity-configs.ts` (e.g. `flight-scheduling`, `route-planning`,
`purchase-orders`, `users`). The frontend expects the same shape for all of
them:

```
POST   {apiUrl}/auth/login          { username, password }
                                     → 200 { token, expiresAt, user } | 401

GET    {apiUrl}/<resource>          → 200 { data: T[], total: number }
                                       optional query: search, sortField,
                                       sortOrder, page, pageSize — see below
GET    {apiUrl}/<resource>/{id}     → 200 T | 404
POST   {apiUrl}/<resource>          → 201 T           (body: Partial<T>)
PUT    {apiUrl}/<resource>/{id}     → 200 T           (body: Partial<T>)
DELETE {apiUrl}/<resource>/{id}     → 200 { success: true } | 404
```

`User` shape (`core/models/user.model.ts`):

```ts
{ id, username, fullName, email, jobTitle, roles: Role[], avatarColor, initials }
```

`Role` is one string per module (`FlightOps`, `Maintenance`, `Fleet`, …,
plus `SuperAdmin`/`Admin`/`ReadOnly`) — see `core/models/role.model.ts` for
the full list. The JWT `role` claim should be multi-valued to match.

`role-permissions` is a real resource, not a mock-only one: one row per
`Role`, shaped `{ id: Role, role: Role, extraModules: string[] }`, where
`extraModules` holds module keys from `module-manifest.ts`. The frontend reads
it once per session to decide which modules to route to and render in the nav.
**The API must apply the same table server-side** — the frontend check is UX,
not enforcement.

### Company scoping

Every request except `/auth/*` carries `X-Company-Id`. The API must:

1. read the company from the header;
2. **validate it against the companies the token's user belongs to** — 403 if
   not, never a silent fallback;
3. filter every query by it;
4. take ownership on `POST` from the request context, ignoring any `companyId`
   in the payload;
5. reject a `PUT` that would move a record to another company.

Reads of another company's row must 404, not 403 — a 403 confirms the row
exists, which is itself a leak.

`companies`, `users` and `role-permissions` are group-wide and are not
filtered by company.

### List query parameters

`ApiService.list(resource, query?)` sends `search`, `sortField`, `sortOrder`,
`page` and `pageSize`. The API applies filter → sort → page, and `total` is
the count **before** paging so a paginator can size itself. Only options the
caller set are sent: `?search=` (empty) means "match the empty string", which
is not the same as no filter.

Callers that need a slice pass a query rather than fetching everything and
calling `.slice()` — the landing dashboard's "recent purchase orders" panel
asks for five rows sorted by date. Against the seeded mock the difference is
invisible; against Oracle it is one page versus a full table scan.

**Still outstanding on the frontend:** the 383 scaffold CRUD screens page,
sort and filter *client-side* over a full unfiltered fetch. That is fine at
the current seed sizes and will not survive real data. The fix is one
component (`shared/scaffold/feature-list-page`) switching `p-table` to lazy
mode and forwarding its events into the query above — the API side is already
specified here.

**Also outstanding:** the dashboards compute their KPIs by fetching whole
tables and counting in the browser — the baggage dashboard alone issues 12
such requests. Counting rows by status is an aggregate the database should do.
The API should grow per-dashboard summary endpoints returning the counts
directly; that is a backend contract addition, not a frontend change.

Field-level notes the backend needs to match:

- **Date-only fields** are sent and expected as `YYYY-MM-DD` with no time and
  no zone — Oracle `DATE`, not `TIMESTAMP WITH TIME ZONE`. Do not normalize
  them to UTC on the way in or out; see the **Dates** section above.
- **Instants** are sent as full ISO 8601 with an offset.
- **`id` and `createdAt` are server-owned.** The frontend never sends a
  meaningful `id` on `POST`, and the API should ignore one if present.

HTTP status codes the frontend already handles via `errorInterceptor`:
`401` → signs the user out and redirects to `/login` (except on
`{apiUrl}/auth/*`, where the calling page handles it); `403` → redirects to
`/403`; `5xx`/network failure → toast notification. Everything else is
surfaced to the calling page as a normal error.

## Tech stack

Angular 20 (standalone components, signals, new control-flow syntax,
zoneful change detection) · PrimeNG 20 (Aura theme, custom preset in
`core/theme/`) · PrimeFlex · Chart.js via `p-chart` · reactive forms
throughout, with `NgModel` used only where a control lives outside any
form (Access Control's per-row inline multiselects) · ESLint with
`angular-eslint` including the template accessibility rules · Karma/Jasmine.

## Architecture decisions

- [ADR 0001 — Date-only values never travel through UTC](docs/adr/0001-date-only-vs-instant.md)
- [ADR 0002 — The demo backend is removed at build time, not switched off at runtime](docs/adr/0002-demo-build-separate-from-production.md)
- [ADR 0003 — Authorization resolves a module key, not a role list](docs/adr/0003-module-access-service.md)
- [ADR 0004 — Styling uses semantic theme tokens, never the raw surface scale](docs/adr/0004-semantic-colour-tokens.md)
- [ADR 0005 — Multi-company: one deployment, several legal entities](docs/adr/0005-multi-company.md)
