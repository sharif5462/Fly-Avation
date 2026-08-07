import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

import { MODULES } from '../data/module-manifest';
import { Role } from '../models/role.model';
import { ApiService } from '../services/api.service';
import { AuthService } from './auth.service';
import { CompanyContextService } from './company-context.service';

/** One row per role on the `role-permissions` resource. */
export interface RolePermission {
  id: string;
  role: Role;
  extraModules: string[];
}

export const ROLE_PERMISSIONS_RESOURCE = 'role-permissions';

/**
 * Decides which modules the signed-in user may open.
 *
 * Two sources combine:
 *
 * 1. **Baseline** — `module-manifest.ts` gives each module the one role that
 *    owns it. A module with no `role` is open to any authenticated user.
 * 2. **Grants** — Security Management → Access Control lets an admin give a
 *    role access to modules beyond the one it owns, stored per role on the
 *    `role-permissions` resource.
 *
 * Before this service existed, only (1) was ever consulted: the Access
 * Control page saved `extraModules` and nothing anywhere read them back, so
 * every grant an admin made silently did nothing.
 *
 * As with every client-side check, this decides what to *render and route to*.
 * The .NET API must enforce the same rules on every endpoint — a user who
 * types a URL directly still gets the page shell, and only the API's 403 stops
 * the data coming back.
 */
@Injectable({ providedIn: 'root' })
export class ModuleAccessService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly company = inject(CompanyContextService);

  private readonly _grants = signal<Map<Role, string[]>>(new Map());
  private request$: Observable<Map<Role, string[]>> | null = null;

  constructor() {
    // Grants are per-user *and* per-company: the same person can hold
    // different access in the airline than in the ground handling entity.
    //
    // There are several ways either can change — the user menu, a 401 from
    // errorInterceptor, an expired token discarded on startup, the company
    // switcher. Watching both identities covers all of them, so neither the
    // next person to sign in on this browser nor the next company switched
    // into inherits the previous grants for the moment before the fetch
    // completes.
    let current: string | null = null;
    effect(() => {
      const key = `${this.auth.user()?.id ?? ''}:${this.company.activeCompanyId() ?? ''}`;
      if (key === current) return;
      current = key;
      this.reset();
    });
  }

  /** Modules granted to the signed-in user's roles on top of the ones they own. */
  readonly extraModuleKeys = computed<ReadonlySet<string>>(() => {
    const grants = this._grants();
    const keys = new Set<string>();
    for (const role of this.auth.roles()) {
      for (const moduleKey of grants.get(role) ?? []) keys.add(moduleKey);
    }
    return keys;
  });

  /**
   * Synchronous check, for the sidebar and anywhere else already inside a
   * reactive read. Grants that haven't loaded yet simply aren't applied, so
   * this can under-report until `load()` resolves — never over-report.
   */
  canAccessModule(moduleKey: string): boolean {
    const module = MODULES.find((m) => m.key === moduleKey);
    // An unknown module key is a routing bug, not an access decision; the
    // router's ** route handles it. Don't manufacture a 403 for it.
    if (!module) return true;
    if (!module.role) return true;
    if (this.auth.hasRole(module.role)) return true;
    return this.extraModuleKeys().has(moduleKey);
  }

  /**
   * Authoritative check for the route guard: waits for grants to load so a
   * user with a valid grant is never bounced to /403 purely because the
   * permissions request hadn't come back yet.
   */
  canAccessModuleAsync(moduleKey: string): Observable<boolean> {
    const module = MODULES.find((m) => m.key === moduleKey);
    if (!module || !module.role || this.auth.hasRole(module.role)) {
      // Baseline access — no need to wait on the grants request at all.
      return of(true);
    }
    return this.load().pipe(map(() => this.extraModuleKeys().has(moduleKey)));
  }

  /**
   * Loads the grant table once per session. `shareReplay` keeps concurrent
   * guard activations (a module route resolves several guards at once) from
   * firing duplicate requests.
   */
  load(): Observable<Map<Role, string[]>> {
    if (!this.request$) {
      this.request$ = this.api.list<RolePermission>(ROLE_PERMISSIONS_RESOURCE).pipe(
        map((res) => {
          const grants = new Map<Role, string[]>();
          for (const row of res.data ?? []) {
            if (row?.role) grants.set(row.role, row.extraModules ?? []);
          }
          return grants;
        }),
        // A failure here must not lock users out of modules they own — fall
        // back to baseline access rather than propagating the error into a
        // guard, where it would look like a denial.
        catchError(() => of(new Map<Role, string[]>())),
        tap((grants) => this._grants.set(grants)),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.request$;
  }

  /** Applies a just-saved grant without re-fetching the whole table. */
  setGrant(role: Role, moduleKeys: string[]): void {
    this._grants.update((grants) => new Map(grants).set(role, [...moduleKeys]));
  }

  /** Drops cached grants so the next check re-reads them. Runs on every identity change. */
  reset(): void {
    this.request$ = null;
    this._grants.set(new Map());
  }
}
