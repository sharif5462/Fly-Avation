import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../models/user.model';

const USER_STORAGE_KEY = 'aviation_erp_user';
const EXPIRY_STORAGE_KEY = 'aviation_erp_token_expiry';

const testUser: User = {
  id: 'usr-test',
  username: 'test.user',
  fullName: 'Test User',
  email: 'test.user@aviation-erp.test',
  jobTitle: 'Tester',
  roles: ['Finance'],
  avatarColor: '#000000',
  initials: 'TU'
};

function loginResponse(overrides: Partial<LoginResponse> = {}): LoginResponse {
  return {
    token: 'header.payload.signature',
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    user: testUser,
    ...overrides
  };
}

function storeSession(token: string, user: User, expiresAt: number | null): void {
  localStorage.setItem(environment.tokenStorageKey, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  if (expiresAt !== null) localStorage.setItem(EXPIRY_STORAGE_KEY, String(expiresAt));
}

describe('AuthService', () => {
  let routerNavigate: jasmine.Spy;

  /**
   * The service reads localStorage in its constructor, so each spec seeds
   * storage first and only then asks for the instance.
   */
  function createService(): AuthService {
    const service = TestBed.inject(AuthService);
    routerNavigate = spyOn(TestBed.inject(Router), 'navigate');
    return service;
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('posts to the documented endpoint and stores the session', () => {
      const service = createService();
      const http = TestBed.inject(HttpTestingController);
      const response = loginResponse();

      service.login({ username: 'test.user', password: 'secret' }).subscribe();

      const req = http.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'test.user', password: 'secret' });
      req.flush(response);

      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()).toEqual(testUser);
      expect(localStorage.getItem(environment.tokenStorageKey)).toBe(response.token);
      http.verify();
    });

    it('persists expiresAt so a reload can tell a live session from a dead one', () => {
      const service = createService();
      const http = TestBed.inject(HttpTestingController);
      const expiresAt = new Date(Date.now() + 3_600_000).toISOString();

      service.login({ username: 'test.user', password: 'secret' }).subscribe();
      http.expectOne(`${environment.apiUrl}/auth/login`).flush(loginResponse({ expiresAt }));

      expect(localStorage.getItem(EXPIRY_STORAGE_KEY)).toBe(String(Date.parse(expiresAt)));
      http.verify();
    });

    it('leaves the session untouched when the credentials are rejected', () => {
      const service = createService();
      const http = TestBed.inject(HttpTestingController);

      service.login({ username: 'test.user', password: 'wrong' }).subscribe({ error: () => undefined });
      http
        .expectOne(`${environment.apiUrl}/auth/login`)
        .flush({ message: 'Invalid username or password.' }, { status: 401, statusText: 'Unauthorized' });

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(environment.tokenStorageKey)).toBeNull();
      http.verify();
    });
  });

  describe('session restore', () => {
    it('restores a session that has not expired', () => {
      storeSession('stored.token', testUser, Date.now() + 3_600_000);
      const service = createService();

      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()?.username).toBe('test.user');
    });

    it('discards an expired session instead of letting guards pass on it', () => {
      storeSession('stale.token', testUser, Date.now() - 1_000);
      const service = createService();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.token()).toBeNull();
      expect(localStorage.getItem(environment.tokenStorageKey)).toBeNull();
      expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    });

    it('accepts a session with no expiry claim, leaving the API as the authority', () => {
      storeSession('stored.token', testUser, null);
      const service = createService();

      expect(service.isAuthenticated()).toBe(true);
      expect(service.isExpired()).toBe(false);
    });

    it('discards a token with no matching user record', () => {
      localStorage.setItem(environment.tokenStorageKey, 'orphan.token');
      const service = createService();

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(environment.tokenStorageKey)).toBeNull();
    });

    it('discards a corrupt stored user rather than throwing on startup', () => {
      localStorage.setItem(environment.tokenStorageKey, 'stored.token');
      localStorage.setItem(USER_STORAGE_KEY, '{not json');

      expect(() => createService()).not.toThrow();
      expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
    });

    it('discards a stored user whose shape does not match the contract', () => {
      localStorage.setItem(environment.tokenStorageKey, 'stored.token');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ id: 'x', username: 'x' }));
      const service = createService();

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears every persisted key and returns to the login screen', () => {
      storeSession('stored.token', testUser, Date.now() + 3_600_000);
      const service = createService();

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
      expect(localStorage.getItem(environment.tokenStorageKey)).toBeNull();
      expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem(EXPIRY_STORAGE_KEY)).toBeNull();
      expect(routerNavigate).toHaveBeenCalledWith(['/login']);
    });

    it('can clear the session without navigating', () => {
      storeSession('stored.token', testUser, Date.now() + 3_600_000);
      const service = createService();

      service.logout(false);

      expect(service.isAuthenticated()).toBe(false);
      expect(routerNavigate).not.toHaveBeenCalled();
    });
  });

  describe('hasRole', () => {
    function serviceWithRoles(roles: User['roles']): AuthService {
      storeSession('stored.token', { ...testUser, roles }, Date.now() + 3_600_000);
      return createService();
    }

    it('grants a role the user holds', () => {
      expect(serviceWithRoles(['Finance']).hasRole('Finance')).toBe(true);
    });

    it('denies a role the user does not hold', () => {
      expect(serviceWithRoles(['Finance']).hasRole('Maintenance')).toBe(false);
    });

    it('grants when the user holds any one of several accepted roles', () => {
      expect(serviceWithRoles(['Finance']).hasRole('Maintenance', 'Finance')).toBe(true);
    });

    it('lets SuperAdmin and Admin through every check', () => {
      expect(serviceWithRoles(['SuperAdmin']).hasRole('Maintenance')).toBe(true);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
      expect(serviceWithRoles(['Admin']).hasRole('Maintenance')).toBe(true);
    });

    it('treats an empty requirement as "any authenticated user"', () => {
      expect(serviceWithRoles(['Finance']).hasRole()).toBe(true);
    });

    it('denies everything when there is no session', () => {
      expect(createService().hasRole('Finance')).toBe(false);
    });
  });
});
