import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { AuthService } from './auth.service';
import { Company } from '../models/company.model';

const ACTIVE_COMPANY_KEY = 'aviation_erp_active_company';

/**
 * Which company the signed-in user is currently working in.
 *
 * Every record in this ERP belongs to exactly one legal entity, so almost
 * nothing can be read or written without knowing which. That choice lives
 * here, is persisted so a reload does not silently move the user to a
 * different company's books, and is attached to outgoing requests by
 * companyInterceptor.
 *
 * **This is a UX mechanism, not an isolation boundary.** The header it feeds
 * is a *request*, and the API must check it against the companies the token's
 * user actually belongs to. An API that trusts the header lets anyone read
 * another company's data by editing one value — the classic multi-tenant
 * data leak.
 */
@Injectable({ providedIn: 'root' })
export class CompanyContextService {
  private readonly auth = inject(AuthService);

  private readonly _activeCompanyId = signal<string | null>(null);

  /** Companies the signed-in user may work in; empty when signed out. */
  readonly companies = computed<Company[]>(() => this.auth.user()?.companies ?? []);

  /** True when a switcher is worth showing at all. */
  readonly hasMultipleCompanies = computed(() => this.companies().length > 1);

  readonly activeCompanyId = this._activeCompanyId.asReadonly();

  readonly activeCompany = computed<Company | null>(() => {
    const id = this._activeCompanyId();
    return this.companies().find((c) => c.id === id) ?? null;
  });

  constructor() {
    // Resolve on every identity change: sign-in, sign-out, and the case where
    // one user signs out and another signs in on the same browser. Without
    // re-resolving, the second user would inherit the first user's company —
    // which they may not even have access to.
    effect(() => {
      const companies = this.companies();
      if (companies.length === 0) {
        this._activeCompanyId.set(null);
        return;
      }
      this._activeCompanyId.set(this.resolveInitialCompany(companies));
    });

    // Persist separately from the resolution effect so a switch is saved too.
    effect(() => {
      const id = this._activeCompanyId();
      if (id) localStorage.setItem(ACTIVE_COMPANY_KEY, id);
    });
  }

  /**
   * Switches company. Returns false — and changes nothing — when the id is
   * not one of the user's, so a stale link or a hand-edited value cannot move
   * someone into a company they have no access to.
   */
  setActiveCompany(companyId: string): boolean {
    if (!this.companies().some((c) => c.id === companyId)) return false;
    if (companyId === this._activeCompanyId()) return false;
    this._activeCompanyId.set(companyId);
    return true;
  }

  /** Clears the persisted choice. Called on sign-out. */
  clearStoredCompany(): void {
    localStorage.removeItem(ACTIVE_COMPANY_KEY);
  }

  /**
   * Last used, if the user still has access to it; otherwise their default;
   * otherwise the first company they can see. The access re-check matters:
   * a user's company list can shrink between sessions.
   */
  private resolveInitialCompany(companies: Company[]): string {
    const stored = localStorage.getItem(ACTIVE_COMPANY_KEY);
    if (stored && companies.some((c) => c.id === stored)) return stored;

    const preferred = this.auth.user()?.defaultCompanyId;
    if (preferred && companies.some((c) => c.id === preferred)) return preferred;

    return companies.find((c) => c.isDefault)?.id ?? companies[0].id;
  }
}
