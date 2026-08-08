# Aviation ERP — Angular Frontend

Angular 20 frontend for a full aviation ERP: 42 modules, 552 screens, JWT
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
npm test          # karma/jasmine unit tests, watches by default — `ng test --watch=false` for a single run
```

Headless/CI environments that run as root (Chrome refuses `--sandbox` as
root) can use the `ChromeHeadlessCI` launcher already defined in
`karma.conf.js`: `CHROME_BIN=<path> ng test --watch=false --browsers=ChromeHeadlessCI`.
Local dev keeps the default `Chrome` launcher unchanged.

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

Ten modules cover the commercial and passenger-care side of the business and
are 100% scaffold (no flagship pages of their own): Supplier & Vendor
Management, Sales & Buyer Management, Catering & Food Services, IRROPS &
Passenger Care (delay/cancellation hotel, transport and duty-of-care
handling), Crew & Staff Travel (HOTAC — crew layover hotels, staff travel
tickets, per diem), Ground Handling Services, Training & Simulator
Management, Charter & Aircraft Leasing, Revenue Accounting & Billing, and
Environment & Sustainability.

Seven more are the platform/infrastructure layer the rest of the app leans
on rather than another operational desk, also 100% scaffold: **Master Data
Management** (Airport, Aircraft Type, Carrier, Country, Currency, UOM — the
shared masters `lookup` fields elsewhere resolve against, see below),
**Workflow & Approval Engine**, **Revenue Management & Pricing** (pricing/
forecasting — commercially distinct from Revenue Accounting's billing/
settlement), **Operations Control Center (AOCC)**, **Crew Pairing &
Rostering Optimization**, **Airport Slot & ATFM Coordination**, and
**Integration Hub** (management screens for external system connections —
GDS/NDC, SITA/ARINC Type B, weather/NOTAM feeds — readiness for the
API-binding phase, not a live integration itself).

### Flagship pages vs. the generic scaffold

Hand-building 552 unique screens up front isn't a good use of time before
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
- **The other 531 screens** are all real, working CRUD screens too — search,
  sortable table, add/edit dialog with validation, delete confirmation —
  just rendered by one shared component, `FeatureListPage`, configured
  per-entity instead of hand-coded per-entity.

**How the scaffold works:** `core/data/module-manifest.ts` defines all 42
modules and their sub-items (label, icon, route key, which ones are
flagship). Their entity configs — table columns + form fields for every
non-flagship item, keyed by the same route key — are split across three
files: `core/data/entity-configs.ts` holds the original 25 modules,
`core/data/entity-configs-extended.ts` holds the ten commercial/
passenger-care modules, `core/data/entity-configs-platform.ts` holds the
seven platform modules above plus deepening batches for five modules that
started out thin (Notification System, Document Management, Passenger
Reservation, Compliance & Safety, Security Management — each originally
5-8 flat items, since fleshed out with the templates/approval-workflow/
retention/inventory machinery a module with that name would actually need).
All three files share the same field-builder helpers
(`core/data/entity-field-helpers.ts`) and are concatenated into one
`ENTITY_CONFIGS` lookup at the bottom of `entity-configs.ts` — nothing
downstream (routes, sidebar, mock API) knows there are three files. In
`app.routes.ts`, every non-flagship item routes to the same lazy-loaded
`FeatureListPage` chunk with `data: { entityKey }` — so there's exactly one
extra chunk for all 531 pages, not 531 chunks.

**Screens vs. nav entries:** the sidebar has 578 entries across the 42
modules, but only 552 distinct screens. Some sub-items are deliberately
reused across modules because they're the same real-world record viewed
from a different desk — Incident Reporting appears under Compliance &
Safety, SMS, Facilities and Landside; Vendor Management under Procurement,
Warehouse and Facilities; Purchase Orders under Procurement and Warehouse;
Gate Management and Aircraft Parking under both Airport Operations and
Resource & Gate Management; RFQ under Procurement and Supplier & Vendor
Management; GSE Fleet Registry under Facilities & Assets and Ground
Handling Services; Training Records under Crew Management and Training &
Simulator Management; Delay Management under Flight Operations and IRROPS
& Passenger Care; IRROPS Decision Log under IRROPS & Passenger Care and
Operations Control Center. A reused key means one route, one entity config
and one dataset, not a copy.

**To add a new field to an existing scaffold page:** edit its entry in
whichever of the three `entity-configs*.ts` files that key lives in. The
table column and the form field both update; no other file changes.

**To add a brand-new sub-item to a module:** add one line to its `items`
array in `module-manifest.ts` and one `entity(...)` call in the relevant
`entity-configs*.ts` file. It gets a working route, a nav entry, and a full
CRUD screen immediately — no new component, no new route file.

### Field/entity relationships: the `lookup` field type

Every field used to be either free text or a static `select` — nothing
modeled an actual foreign-key relationship to another entity's rows, and
nothing enforced that e.g. every "Station" field on 28 different entities
used the same set of airport codes. `EntityField.type: 'lookup'` fixes
this: `lookup('origin', 'Origin Airport', 'airport-master', 'iataCode')`
renders a searchable dropdown populated at runtime from `airport-master`'s
live rows (`FeatureListPage.loadLookups()` calls `api.list(lookupEntity)`),
storing the referenced row's `id` — a real foreign key, not a copy of its
label — and displaying `lookupLabelField` (`iataCode`) wherever the raw
value would otherwise show. The mock seed generator (`fake-data.ts`)
resolves lookups the same way: seeding a Route Planning row picks a real
`airport-master` row id, recursively seeding Airport Master first if
nothing has touched it yet this session (`mock-api.interceptor.ts`'s
`getCollection` closure, threaded into `generateSeedRows`).

Only a representative set of high-traffic fields have been converted so far
(Route Planning's origin/destination, Supplier/Buyer Registry's country,
Supplier Price List's currency, and the `station` field on Ground Handler
Registry and Hotel Partner Registry) — proving the mechanism end-to-end
rather than mechanically rewriting all ~530 entities' reference-shaped
fields. The remaining ones are still free text deliberately: converting a
field to `lookup` before the entities on both ends have stable, real
primary keys (i.e. before the .NET/Oracle backend exists) just produces
brittle mappings that get redone anyway once real IDs exist — this is
exactly the kind of thing to finish once the API-binding phase starts, not
before.

### Row-level access: `scopeField` / `User.stationScope`

Role-based access here has always been module-level (a user with the
`Catering` role sees every Catering screen, at every station). Real
airline ops usually also need row-level scoping — a station manager should
only see their own station's records, not every station's. `EntityConfig`
now supports an optional `scopeField` naming which field on that entity
holds a station/airport code; `User.stationScope` is the signed-in user's
allowed list. `core/mock/mock-api.interceptor.ts` filters every list
response through `applyScopeFilter()`, resolving lookup-typed scope fields
back to their code first (`resolveScopeValue()` — a Ground Handler
Registry row stores an `airport-master` id, not a bare "JFK") so the
comparison always happens against the same human-readable codes regardless
of whether the underlying field is free text or a normalized foreign key.
SuperAdmin/Admin bypass it, same convention as module-role checks; a user
with no `stationScope` set (the default) is unrestricted, so nothing about
existing accounts changes. It's applied today to the 28 entities across
Ground Handling, Catering, IRROPS (hotel) and Crew & Staff Travel that
carry a real `station` field — see the `STATION_SCOPED_ENTITIES`/
`FILE_ATTACHMENT_ENTITIES` lists at the bottom of
`entity-configs-extended.ts`, which apply `scopeField`/an attachment field
by key rather than threading extra parameters through ~1000 lines of
`entity(...)` calls. The demo account `pax.services.mgr` (password
`ops2-123`) is scoped to `['JFK', 'LHR']`; every other demo account is
unrestricted, for contrast. This is a mock-layer stand-in only — the real
.NET API must enforce the equivalent server-side, the same way it must
re-derive module-role checks rather than trust the JWT alone.

### File attachments: the `file` field type

`EntityField.type: 'file'` renders a real file input
(`FeatureListPage.onFileSelected()`); since the mock layer has no object
storage, only metadata (name, size, upload timestamp) is kept in
`localStorage`, not the file's bytes — a deliberate simplification, not an
oversight. Applied to ten document-centric entities today (Supplier
Document Vault, Supplier Certifications, Supplier Audit, Kitchen Hygiene
Audit, Visa & Passport Tracking, Crew Visa & GENDEC, Training Certificate
Issuance, Lease Technical Records, Insurance Certificates, Environmental
Permits) plus the new Document Management and Master Data Change Request
screens. When the real API lands, swap the metadata-only upload handler for
one that actually uploads to blob storage (S3/Azure Blob/Oracle BLOB) and
stores the resulting URL — the field type and form rendering don't change.

**To add a brand-new module:** add a `ModuleDef` to `module-manifest.ts`
with a unique `key`, a role (add it to `Role` in `core/models/role.model.ts`
first if it's new), and its `items`; add matching `entity(...)` configs for
every item; nothing else needs to change — routing, the sidebar and
breadcrumbs all derive from `MODULES`.

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
`superadmin` / `super123` has every role; the other ten are scoped to
1–7 modules each so role-gating is actually visible when testing —
including `commercial.mgr` / `comm123` (Supplier, Sales, Charter, Revenue
Accounting, **Revenue Management**) and `pax.services.mgr` / `ops2-123`
(IRROPS, Catering, Ground Handling, Crew & Staff Travel, Training,
Sustainability — and **`stationScope: ['JFK', 'LHR']`**, the row-level
scoping demo, see above) for the ten commercial/passenger-care modules, plus
`admin` / `admin123` additionally carrying **Master Data**, **Workflow** and
**Integration** (governance/IT-adjacent roles that cluster naturally under
the ERP admin) for the platform layer.

## Mock data layer (dev only — this is what to remove/bypass for production)

No .NET/Oracle backend exists yet, so `core/mock/mock-api.interceptor.ts`
intercepts every request under `environment.apiUrl` and serves it from an
in-memory store backed by `localStorage`, when `environment.useMockApi` is
`true`. It implements the same REST contract documented below, so this is a
drop-in stand-in, not a parallel code path components need to know about.

- `core/mock/mock-users.ts` — the 11 demo accounts and `/auth/login` logic.
- `core/mock/flagship-seeds.ts` — hand-written realistic seed data for the
  11 flagship resources that own a dataset. (The eight dashboards don't —
  they read the other resources; User Roles and Access Control are backed
  by the `users` and `role-permissions` resources in the same file's map.)
- `core/mock/fake-data.ts` — generates plausible seed rows for the 531
  generic scaffold resources from their `entity-configs*.ts` field
  definitions (heuristic — a field named/labeled with "cost" gets a
  dollar-ish number, "airport"/"origin"/"iata" gets an IATA-style code, a
  Master Data "Country Name"/"Currency Name"/"Carrier Name" field gets a
  real-looking one instead of colliding with the generic person-name
  heuristic, etc.). A `'lookup'` field resolves against its referenced
  entity's actual seeded rows rather than generating a value in isolation
  (see `generateSeedRows`'s `resolveLookupRows` parameter), and a `'file'`
  field seeds as unattached (`null`) since most demo records wouldn't have
  one uploaded yet. Not perfect for every field name, but good enough to
  make every one of the 552 pages demoable with realistic-looking data on
  first load.
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
