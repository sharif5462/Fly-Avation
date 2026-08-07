# ADR 0005 — Multi-company: one deployment, several legal entities

- **Status:** Accepted
- **Date:** 2026-08-07

## Context

An aviation group is rarely one company. The AOC holder, the ground handling
arm and the maintenance organisation are usually separate legal entities with
their own books, their own regulator and their own balance sheet. This ERP has
to serve all of them from one deployment while keeping their records apart.

The decision could not wait for the backend. Adding a company partition to a
schema that already exists means altering ~400 tables, migrating every row,
and revisiting every query, stored procedure and endpoint. Adding it before
the DDL is written costs one column per `CREATE TABLE`.

An important distinction, because the codebase already contained the confusing
case: four tables carry a field called something like `company` —
`staff-id-cards.company`, `rental-car-facility.rentalCompany`. Those are data
*about somebody else's* business. `company_id` is *which of our entities owns
this row*. They are unrelated, and the second one is the partition key.

## Decision

**One deployment, one database, a `company_id` discriminator.** Not a database
per company and not a schema per company: the group wants consolidated
reporting, and 400 tables × N companies is an operational burden with no
matching benefit at this scale.

**The active company travels as a request header,** `X-Company-Id`, added by
`companyInterceptor`. A header rather than a path segment (`/{companyId}/...`)
or a query parameter, because the value is ambient to the whole session —
putting it in the URL would have meant rewriting all ~400 resource paths and
every call site for something no caller varies per request.

**`CompanyContextService` owns the choice.** It resolves last-used → the
user's default → the first available, re-checking each against the companies
the login response actually returned; a company the user has lost access to
between sessions is discarded rather than restored. Switching validates
membership and returns `false` for anything else, so a hand-edited value
cannot move someone into another entity's books.

**Switching reloads.** Every page on screen is showing the previous company's
records, so `Topbar` re-navigates the current route, and `ModuleAccessService`
keys its cache on `user + company` — access can legitimately differ between
entities.

**Three resources are not partitioned:** `companies` is the list of partitions
itself, and `users` / `role-permissions` are group-wide identity — a person
exists once and is granted access per company. These get no `company_id`.

## The API side — this is the part that matters

**The header is a client-controlled value. Treating it as authorization is a
data leak.** Any browser can send any company id. The API must, on every
request:

1. Read the company from the header.
2. Check it against the companies the **token's** user belongs to.
3. Reject with 403 if not — never fall back to a default.
4. Apply it to every query, and take ownership on writes from the request
   context rather than the payload.

The mock backend models exactly this: reads, updates and deletes all work from
a company-filtered view, so another company's row 404s rather than merely
being absent from a list; `POST` stamps ownership from the header; and `PUT`
refuses to move a record between companies. Those behaviours are pinned by
specs precisely because they are the ones an implementation gets wrong.

## Consequences

- Nearly every table needs `company_id NOT NULL` plus a foreign key, and it
  belongs in the **leading position of most indexes** — every query filters on
  it first.
- Unique constraints become composite. An invoice number is unique *per
  company*, not globally; `UNIQUE(company_id, invoice_no)`.
- Cross-company reporting needs a deliberate, separately authorized path.
  Consolidation is a real requirement (see the Organization module's
  inter-company transactions) and must not be achieved by letting ordinary
  queries skip the filter.
- One deployment means one release for every entity — an upgrade cannot be
  staged per company.
- A user in one company sees a switcher with no choice in it; the control
  hides itself rather than showing a menu of one.
