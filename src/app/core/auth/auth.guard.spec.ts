import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';

function runGuard(guard: typeof authGuard, url: string): boolean | UrlTree {
  const state = { url } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() => guard(route, state)) as boolean | UrlTree;
}

describe('authGuard / guestGuard', () => {
  const authenticated = signal(false);

  beforeEach(() => {
    authenticated.set(false);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isAuthenticated: authenticated } }]
    });
  });

  describe('authGuard', () => {
    it('lets a signed-in user through', () => {
      authenticated.set(true);
      expect(runGuard(authGuard, '/dashboard')).toBe(true);
    });

    it('redirects an anonymous user to the login screen', () => {
      const result = runGuard(authGuard, '/dashboard');
      expect(result instanceof UrlTree).toBe(true);
      expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toContain('/login');
    });

    it('remembers where the user was headed so login can return them', () => {
      const result = runGuard(authGuard, '/aircraft-maintenance/work-orders') as UrlTree;
      expect(result.queryParams['returnUrl']).toBe('/aircraft-maintenance/work-orders');
    });

    it('preserves query strings in the remembered URL', () => {
      const result = runGuard(authGuard, '/procurement/purchase-orders?status=Draft') as UrlTree;
      expect(result.queryParams['returnUrl']).toBe('/procurement/purchase-orders?status=Draft');
    });
  });

  describe('guestGuard', () => {
    it('lets an anonymous user reach the login screen', () => {
      expect(runGuard(guestGuard, '/login')).toBe(true);
    });

    it('sends an already signed-in user to the dashboard', () => {
      authenticated.set(true);
      const result = runGuard(guestGuard, '/login');
      expect(result instanceof UrlTree).toBe(true);
      expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toContain('/dashboard');
    });
  });
});
