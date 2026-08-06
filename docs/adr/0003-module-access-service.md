# ADR 0003 — Authorization resolves a module key, not a role list

- **Status:** Accepted
- **Date:** 2026-08-06

## Context

Two things were meant to decide what a user can open:

1. `module-manifest.ts` gives each module one owning `role`.
2. Security Management → **Access Control** lets an admin grant a role access
   to *additional* modules, saved per role on the `role-permissions` resource.

Only (1) was ever read. `roleGuard` took `data: { roles: [...] }` from the
route and checked it against `AuthService.hasRole()`; the sidebar did the
same. Nothing anywhere loaded `role-permissions`.

So the Access Control screen saved grants, showed a success toast, and had no
effect at all. That is worse than a missing feature: an administrator could
believe they had given Finance access to Procurement and be told it worked.

The route data shape was the reason the fix was not trivial. A `roles` array
can only express "which roles may enter", which is exactly the half of the
rule the manifest already covers — there is nowhere for a per-role grant to
enter the decision.

## Decision

Guards pass a **module key**, and `ModuleAccessService` resolves it against
both sources:

```ts
{ path: mod.key, canActivate: [roleGuard], data: { moduleKey: mod.key } }
```

- `canAccessModule(key)` — synchronous, for the sidebar and other reactive
  reads. Grants not yet loaded are simply not applied, so it can
  under-report, never over-report.
- `canAccessModuleAsync(key)` — for the guard. Baseline access short-circuits
  without a request; only a user who needs a grant waits for one, so a
  legitimately granted user is never bounced to `/403` by a race.
- Grants load once per session (`shareReplay`) and are dropped whenever the
  signed-in identity changes, so the next person on the browser cannot
  inherit them.
- A failed permissions request falls back to baseline access rather than
  propagating an error into a guard, where it would read as a denial.

The Access Control page pushes a saved grant straight into the service cache,
so it applies without a reload.

## Consequences

- The Access Control screen does what it says.
- Authorization has one entry point instead of the same rule expressed
  separately in the guard and the sidebar.
- `roleGuard` is now sometimes asynchronous. Angular handles an
  `Observable<boolean | UrlTree>` from `CanActivateFn` natively, but it does
  mean a module the user does not own has a request between click and render.
- **This is client-side only.** It decides what to render and route to. A
  user who types a URL still gets the shell; only the API's 403 stops the data
  coming back. The .NET API must enforce the same rules per endpoint, and it
  needs to read the same `role-permissions` table — otherwise the two will
  disagree.
