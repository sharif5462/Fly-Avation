import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { ModuleAccessService, ROLE_PERMISSIONS_RESOURCE } from './module-access.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';

const PERMISSIONS_URL = `${environment.apiUrl}/${ROLE_PERMISSIONS_RESOURCE}`;

function userWith(roles: Role[]): User {
  return {
    id: 'usr-test',
    username: 'test.user',
    fullName: 'Test User',
    email: 'test.user@aviation-erp.test',
    jobTitle: 'Tester',
    roles,
    avatarColor: '#000000',
    initials: 'TU'
  };
}

describe('ModuleAccessService', () => {
  const user = signal<User | null>(userWith(['Finance']));
  const roles = signal<Role[]>(['Finance']);

  function setUser(nextRoles: Role[]): void {
    roles.set(nextRoles);
    user.set(userWith(nextRoles));
  }

  function createService(): { service: ModuleAccessService; http: HttpTestingController } {
    return { service: TestBed.inject(ModuleAccessService), http: TestBed.inject(HttpTestingController) };
  }

  beforeEach(() => {
    setUser(['Finance']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            user,
            roles,
            hasRole: (...required: Role[]) => {
              const mine = roles();
              if (mine.includes('SuperAdmin') || mine.includes('Admin')) return true;
              return required.length === 0 || required.some((r) => mine.includes(r));
            }
          }
        }
      ]
    });
  });

  describe('baseline access from the manifest', () => {
    it('allows the module the user\'s role owns', () => {
      const { service } = createService();
      expect(service.canAccessModule('finance-accounting')).toBe(true);
    });

    it('denies a module owned by another role', () => {
      const { service } = createService();
      expect(service.canAccessModule('aircraft-maintenance')).toBe(false);
    });

    it('allows a module that declares no owning role', () => {
      const { service } = createService();
      // Notification System is deliberately open to any authenticated user.
      expect(service.canAccessModule('notification-system')).toBe(true);
    });

    it('lets SuperAdmin into everything', () => {
      setUser(['SuperAdmin']);
      const { service } = createService();
      expect(service.canAccessModule('aircraft-maintenance')).toBe(true);
      expect(service.canAccessModule('finance-accounting')).toBe(true);
    });

    it('does not manufacture a denial for an unknown module key', () => {
      const { service } = createService();
      expect(service.canAccessModule('no-such-module')).toBe(true);
    });
  });

  describe('grants from the Access Control screen', () => {
    it('grants a module the admin added for the user\'s role', () => {
      const { service, http } = createService();

      service.load().subscribe();
      http.expectOne(PERMISSIONS_URL).flush({
        data: [{ id: 'Finance', role: 'Finance', extraModules: ['procurement'] }],
        total: 1
      });

      expect(service.canAccessModule('procurement')).toBe(true);
      http.verify();
    });

    it('still denies modules that were not granted', () => {
      const { service, http } = createService();

      service.load().subscribe();
      http.expectOne(PERMISSIONS_URL).flush({
        data: [{ id: 'Finance', role: 'Finance', extraModules: ['procurement'] }],
        total: 1
      });

      expect(service.canAccessModule('aircraft-maintenance')).toBe(false);
      http.verify();
    });

    it('ignores grants made to a role the user does not hold', () => {
      const { service, http } = createService();

      service.load().subscribe();
      http.expectOne(PERMISSIONS_URL).flush({
        data: [{ id: 'Crew', role: 'Crew', extraModules: ['procurement'] }],
        total: 1
      });

      expect(service.canAccessModule('procurement')).toBe(false);
      http.verify();
    });

    it('unions grants across every role the user holds', () => {
      setUser(['Finance', 'Crew']);
      const { service, http } = createService();

      service.load().subscribe();
      http.expectOne(PERMISSIONS_URL).flush({
        data: [
          { id: 'Finance', role: 'Finance', extraModules: ['procurement'] },
          { id: 'Crew', role: 'Crew', extraModules: ['cargo-management'] }
        ],
        total: 2
      });

      expect(service.canAccessModule('procurement')).toBe(true);
      expect(service.canAccessModule('cargo-management')).toBe(true);
      http.verify();
    });

    it('applies a grant saved on the Access Control page without re-fetching', () => {
      const { service, http } = createService();

      service.load().subscribe();
      http.expectOne(PERMISSIONS_URL).flush({ data: [], total: 0 });
      expect(service.canAccessModule('procurement')).toBe(false);

      service.setGrant('Finance', ['procurement']);

      expect(service.canAccessModule('procurement')).toBe(true);
      http.verify();
    });
  });

  describe('load', () => {
    it('issues a single request however many callers ask', () => {
      const { service, http } = createService();

      service.load().subscribe();
      service.load().subscribe();
      service.canAccessModuleAsync('procurement').subscribe();

      http.expectOne(PERMISSIONS_URL).flush({ data: [], total: 0 });
      http.verify();
    });

    it('falls back to baseline access when the permissions request fails', () => {
      const { service, http } = createService();
      let completed = false;

      service.load().subscribe(() => (completed = true));
      http.expectOne(PERMISSIONS_URL).flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

      // A failure must not read as a denial — the user keeps the module their
      // own role owns.
      expect(completed).toBe(true);
      expect(service.canAccessModule('finance-accounting')).toBe(true);
      expect(service.canAccessModule('procurement')).toBe(false);
      http.verify();
    });

    it('drops cached grants when the signed-in identity changes', () => {
      const { service, http } = createService();

      service.load().subscribe();
      http.expectOne(PERMISSIONS_URL).flush({
        data: [{ id: 'Finance', role: 'Finance', extraModules: ['procurement'] }],
        total: 1
      });
      expect(service.canAccessModule('procurement')).toBe(true);

      user.set({ ...userWith(['Finance']), id: 'usr-other' });
      TestBed.tick();

      expect(service.canAccessModule('procurement')).toBe(false);
      http.verify();
    });
  });

  describe('canAccessModuleAsync', () => {
    it('resolves immediately for baseline access, without waiting on grants', () => {
      const { service, http } = createService();
      let allowed: boolean | undefined;

      service.canAccessModuleAsync('finance-accounting').subscribe((v) => (allowed = v));

      expect(allowed).toBe(true);
      http.expectNone(PERMISSIONS_URL);
      http.verify();
    });

    it('waits for grants before denying, so a granted user is never bounced', () => {
      const { service, http } = createService();
      let allowed: boolean | undefined;

      service.canAccessModuleAsync('procurement').subscribe((v) => (allowed = v));
      expect(allowed).toBeUndefined();

      http.expectOne(PERMISSIONS_URL).flush({
        data: [{ id: 'Finance', role: 'Finance', extraModules: ['procurement'] }],
        total: 1
      });

      expect(allowed).toBe(true);
      http.verify();
    });

    it('denies once grants have loaded and do not cover the module', () => {
      const { service, http } = createService();
      let allowed: boolean | undefined;

      service.canAccessModuleAsync('aircraft-maintenance').subscribe((v) => (allowed = v));
      http.expectOne(PERMISSIONS_URL).flush({ data: [], total: 0 });

      expect(allowed).toBe(false);
      http.verify();
    });
  });
});
