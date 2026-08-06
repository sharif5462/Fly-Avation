# Aviation ERP — Angular Frontend

Angular 20 frontend for a full aviation ERP: 24 modules, 223 screens, JWT
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

```bash
npm run build     # production build → dist/aviation-erp
```

## Architecture

```
src/app/
  core/               # framework-agnostic app plumbing, no UI
    auth/              AuthService, authGuard, roleGuard, authInterceptor
    interceptors/      errorInterceptor (401/403/5xx handling)
    services/          ApiService — the one place that knows request URLs
    models/            Role, User, EntityConfig, ModuleDef — shared types
    data/              module-manifest.ts, entity-configs.ts (see below)
    mock/              mock API interceptor + seed data (dev-only)
    theme/             PrimeNG theme preset
  layout/             Shell, Sidebar, Topbar, Breadcrumb — the authenticated app frame
  shared/
    components/        PageHeader, StatCard — small reused pieces
    scaffold/           FeatureListPage — the generic CRUD engine (below)
  features/
    auth/login/
    errors/                     403, 404

    # the 20 flagship (hand-built) pages — see "Flagship vs scaffold" below.
    # Everything else in the app is the scaffold; it has no folder here.
    business-intelligence/      dashboard
    flight-operations/          flight-scheduling
    fleet-management/           aircraft-registration
    aircraft-maintenance/       mro-dashboard, work-orders, component-tracking
    crew-management/            pilot-management
    inventory-spare-parts/      spare-parts-inventory
    warehouse-management/       warehouse-dashboard, item-master
    procurement/                purchase-orders
    baggage-handling-system/    baggage-handling-dashboard, baggage-handling
    landside-operations/        landside-dashboard
    facilities-assets/          facility-dashboard, asset-master
    safety-management-system/   sms-dashboard, hazard-reporting
    security-management/        user-roles, access-control
```

### Flagship pages vs. the generic scaffold

Hand-building 223 unique screens up front isn't a good use of time before
there's a real backend to wire them to. Instead:

- **20 flagship pages** are fully hand-built: typed models, bespoke table
  columns, KPI cards, dedicated reactive forms. These are the reference
  implementation — copy one of these when a scaffold page needs to graduate
  to something bespoke. Seven are dashboards — the landing Dashboard plus
  MRO, Warehouse, Baggage Handling, Landside, Facility and SMS. The other
  thirteen are Flight Scheduling, Aircraft Registration, Work Orders,
  Component Tracking, Pilot Management, Spare Parts Inventory, Item Master,
  Purchase Orders, Bag Tracking (Res. 753), Asset Master, Hazard Reporting,
  User Roles and Access Control.
- **The other 203 screens** are all real, working CRUD screens too — search,
  sortable table, add/edit dialog with validation, delete confirmation —
  just rendered by one shared component, `FeatureListPage`, configured
  per-entity instead of hand-coded per-entity.

**How the scaffold works:** `core/data/module-manifest.ts` defines all 24
modules and their sub-items (label, icon, route key, which ones are
flagship). `core/data/entity-configs.ts` defines the table columns + form
fields for every non-flagship item, keyed by the same route key. In
`app.routes.ts`, every non-flagship item routes to the same lazy-loaded
`FeatureListPage` chunk with `data: { entityKey }` — so there's exactly one
extra chunk for all 203 pages, not 203 chunks.

**Screens vs. nav entries:** the sidebar has 240 entries across the 24
modules, but only 223 distinct screens. Some sub-items are deliberately
reused across modules because they're the same real-world record viewed
from a different desk — Incident Reporting appears under Compliance &
Safety, SMS, Facilities and Landside; Vendor Management under Procurement,
Warehouse and Facilities; Purchase Orders under Procurement and Warehouse.
A reused key means one route, one entity config and one dataset, not a copy.

**To add a new field to an existing scaffold page:** edit its entry in
`entity-configs.ts`. The table column and the form field both update; no
other file changes.

**To add a brand-new sub-item to a module:** add one line to its `items`
array in `module-manifest.ts` and one `entity(...)` call in
`entity-configs.ts`. It gets a working route, a nav entry, and a full CRUD
screen immediately — no new component, no new route file.

**To promote a scaffold page to a flagship page:** copy the pattern from
`features/flight-operations/flight-scheduling/` (typed model, dedicated
form, KPI stat cards), add it to `FLAGSHIP_LOADERS` in `app.routes.ts`, and
set `flagship: true` on that item in `module-manifest.ts`.

## Authentication & authorization

- **AuthService** (`core/auth/auth.service.ts`) holds session state in
  signals, persisted to `localStorage`. `login()` posts to
  `POST /auth/login`; the response `{ token, expiresAt, user }` is stored
  and the token is attached to every subsequent request.
- **authGuard** blocks unauthenticated access to the whole app shell and
  remembers the target URL as `?returnUrl=` for after login.
- **roleGuard**, applied once per module (not per page) in `app.routes.ts`,
  reads `route.data['roles']` and checks it against the signed-in user's
  roles. `SuperAdmin` and `Admin` bypass every check. A module with no
  `role` set (Notification System) is open to any authenticated user.
- **authInterceptor** attaches `Authorization: Bearer <token>` to requests
  bound for `environment.apiUrl`.
- **errorInterceptor** centralizes 401 (→ logout), 403 (→ `/403`), and
  network/5xx handling (→ toast) so individual pages don't each need this
  logic.
- Roles are enumerated in `core/models/role.model.ts` — one role per
  module, plus `SuperAdmin`/`Admin`/`ReadOnly`. `security-management` →
  **Access Control** lets an admin grant a role extra access to modules
  beyond its default one.

Demo accounts (see the login screen for the full set with job titles):
`superadmin` / `super123` has every role; the other eight are scoped to
1–2 modules each so role-gating is actually visible when testing.

## Mock data layer (dev only — this is what to remove/bypass for production)

No .NET/Oracle backend exists yet, so `core/mock/mock-api.interceptor.ts`
intercepts every request under `environment.apiUrl` and serves it from an
in-memory store backed by `localStorage`, when `environment.useMockApi` is
`true`. It implements the same REST contract documented below, so this is a
drop-in stand-in, not a parallel code path components need to know about.

- `core/mock/mock-users.ts` — the 9 demo accounts and `/auth/login` logic.
- `core/mock/flagship-seeds.ts` — hand-written realistic seed data for the
  11 flagship resources that own a dataset. (The seven dashboards don't —
  they read the other resources; User Roles and Access Control are backed
  by the `users` and `role-permissions` resources in the same file's map.)
- `core/mock/fake-data.ts` — generates plausible seed rows for the 203
  generic scaffold resources from their `entity-configs.ts` field
  definitions (heuristic — a field named/labeled with "cost" gets a
  dollar-ish number, "airport"/"origin" gets an IATA-style code, etc.). Not
  perfect for every field name, but good enough to make every one of the
  223 pages demoable with realistic-looking data on first load.
- `core/mock/mock-db.ts` — thin `localStorage` persistence so anything
  created/edited/deleted while clicking around survives a refresh. A
  "Reset Demo Data" option lives in the user menu (top-right avatar).

**To go live against the real API:** set `environment.useMockApi = false`
(and point `environment.apiUrl` at the deployed API). No component or
service code changes — everything already goes through `ApiService`.

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
                                       sortOrder, page, pageSize (the mock
                                       implements these; nothing in the UI
                                       sends them yet — datasets are small
                                       enough for client-side table paging/
                                       sorting/filtering today)
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

HTTP status codes the frontend already handles via `errorInterceptor`:
`401` → signs the user out and redirects to `/login`; `403` → redirects to
`/403`; `5xx`/network failure → toast notification. Everything else is
surfaced to the calling page as a normal error.

## Tech stack

Angular 20 (standalone components, signals, new control-flow syntax,
zoneful change detection) · PrimeNG 20 (Aura theme, custom preset in
`core/theme/`) · PrimeFlex · Chart.js via `p-chart` · reactive forms
throughout, with `NgModel` used only where a control lives outside any
form (Access Control's per-row inline multiselects).
