import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { CompanyContextService } from './company-context.service';
import { AuthService } from './auth.service';
import { Company } from '../models/company.model';
import { User } from '../models/user.model';

const ACTIVE_COMPANY_KEY = 'aviation_erp_active_company';

const AIRLINE: Company = { id: 'cmp-1', code: 'AVE', name: 'Airline', baseCurrency: 'USD', country: 'BD', isDefault: true };
const GROUND: Company = { id: 'cmp-2', code: 'AGS', name: 'Ground Services', baseCurrency: 'BDT', country: 'BD' };
const TECHNIC: Company = { id: 'cmp-3', code: 'ATL', name: 'Technic', baseCurrency: 'USD', country: 'SG' };

function userWith(companies: Company[], defaultCompanyId?: string): User {
  return {
    id: 'usr-1',
    username: 'test',
    fullName: 'Test User',
    email: 't@aviation-erp.test',
    jobTitle: 'Tester',
    roles: ['Finance'],
    avatarColor: '#000',
    initials: 'TU',
    companies,
    defaultCompanyId
  };
}

/**
 * The active company decides which legal entity's records the user sees, so
 * these specs care most about the cases where it must *refuse* — a stored id
 * the user no longer has access to, and a switch to a company that was never
 * theirs.
 */
describe('CompanyContextService', () => {
  const user = signal<User | null>(null);

  function createService(): CompanyContextService {
    const service = TestBed.inject(CompanyContextService);
    TestBed.tick();
    return service;
  }

  beforeEach(() => {
    localStorage.clear();
    user.set(null);
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: { user } }]
    });
  });

  afterEach(() => localStorage.clear());

  describe('resolving the initial company', () => {
    it('has no company while signed out', () => {
      const service = createService();

      expect(service.activeCompanyId()).toBeNull();
      expect(service.activeCompany()).toBeNull();
      expect(service.companies()).toEqual([]);
    });

    it('opens the company flagged as default', () => {
      user.set(userWith([GROUND, AIRLINE, TECHNIC]));
      const service = createService();

      expect(service.activeCompanyId()).toBe(AIRLINE.id);
    });

    it('prefers the user’s own default over the global one', () => {
      user.set(userWith([AIRLINE, GROUND], GROUND.id));
      const service = createService();

      expect(service.activeCompanyId()).toBe(GROUND.id);
    });

    it('falls back to the first company when nothing is flagged', () => {
      user.set(userWith([GROUND, TECHNIC]));
      const service = createService();

      expect(service.activeCompanyId()).toBe(GROUND.id);
    });

    it('restores the company last used', () => {
      localStorage.setItem(ACTIVE_COMPANY_KEY, TECHNIC.id);
      user.set(userWith([AIRLINE, GROUND, TECHNIC]));
      const service = createService();

      expect(service.activeCompanyId()).toBe(TECHNIC.id);
    });

    it('ignores a stored company the user no longer has access to', () => {
      // A user's company list can shrink between sessions. Restoring blindly
      // would leave them pointed at books they may no longer open.
      localStorage.setItem(ACTIVE_COMPANY_KEY, TECHNIC.id);
      user.set(userWith([AIRLINE, GROUND]));
      const service = createService();

      expect(service.activeCompanyId()).toBe(AIRLINE.id);
    });
  });

  describe('switching', () => {
    it('switches to a company the user belongs to', () => {
      user.set(userWith([AIRLINE, GROUND]));
      const service = createService();

      expect(service.setActiveCompany(GROUND.id)).toBe(true);
      expect(service.activeCompanyId()).toBe(GROUND.id);
      expect(service.activeCompany()?.code).toBe('AGS');
    });

    it('refuses a company the user does not belong to, changing nothing', () => {
      user.set(userWith([AIRLINE, GROUND]));
      const service = createService();

      expect(service.setActiveCompany(TECHNIC.id)).toBe(false);
      expect(service.activeCompanyId()).toBe(AIRLINE.id);
    });

    it('refuses an unknown id', () => {
      user.set(userWith([AIRLINE]));
      const service = createService();

      expect(service.setActiveCompany('cmp-nope')).toBe(false);
      expect(service.activeCompanyId()).toBe(AIRLINE.id);
    });

    it('reports no change when switching to the company already active', () => {
      user.set(userWith([AIRLINE, GROUND]));
      const service = createService();

      // Callers reload the page on a true result; returning true here would
      // reload for nothing.
      expect(service.setActiveCompany(AIRLINE.id)).toBe(false);
    });

    it('persists the switch for the next session', () => {
      user.set(userWith([AIRLINE, GROUND]));
      const service = createService();

      service.setActiveCompany(GROUND.id);
      TestBed.tick();

      expect(localStorage.getItem(ACTIVE_COMPANY_KEY)).toBe(GROUND.id);
    });
  });

  describe('identity changes', () => {
    it('re-resolves when a different user signs in on the same browser', () => {
      user.set(userWith([AIRLINE, GROUND, TECHNIC]));
      const service = createService();
      service.setActiveCompany(TECHNIC.id);
      TestBed.tick();

      // Second user has no access to Technic; they must not inherit it.
      user.set({ ...userWith([AIRLINE, GROUND]), id: 'usr-2' });
      TestBed.tick();

      expect(service.activeCompanyId()).toBe(AIRLINE.id);
    });

    it('clears the active company on sign-out', () => {
      user.set(userWith([AIRLINE, GROUND]));
      const service = createService();

      user.set(null);
      TestBed.tick();

      expect(service.activeCompanyId()).toBeNull();
    });
  });

  describe('hasMultipleCompanies', () => {
    it('is false for a single-company user, so no switcher is shown', () => {
      user.set(userWith([AIRLINE]));
      expect(createService().hasMultipleCompanies()).toBe(false);
    });

    it('is true once there is a choice to make', () => {
      user.set(userWith([AIRLINE, GROUND]));
      expect(createService().hasMultipleCompanies()).toBe(true);
    });
  });
});
