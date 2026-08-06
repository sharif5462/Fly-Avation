import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { Observable, isObservable, of } from 'rxjs';

import { roleGuard } from './role.guard';
import { ModuleAccessService } from './module-access.service';

function runGuard(data: Record<string, unknown>): boolean | UrlTree {
  const route = { data } as unknown as ActivatedRouteSnapshot;
  const state = { url: '/whatever' } as RouterStateSnapshot;
  const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

  if (isObservable(result)) {
    let value!: boolean | UrlTree;
    (result as Observable<boolean | UrlTree>).subscribe((v) => (value = v));
    return value;
  }
  return result as boolean | UrlTree;
}

describe('roleGuard', () => {
  let allowed: boolean;

  beforeEach(() => {
    allowed = true;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ModuleAccessService,
          useValue: { canAccessModuleAsync: () => of(allowed) }
        }
      ]
    });
  });

  it('activates the route when the module is accessible', () => {
    expect(runGuard({ moduleKey: 'finance-accounting' })).toBe(true);
  });

  it('redirects to /403 when the module is not accessible', () => {
    allowed = false;
    const result = runGuard({ moduleKey: 'finance-accounting' });

    expect(result instanceof UrlTree).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/403');
  });

  it('activates a route that declares no module key', () => {
    // Not every guarded route belongs to a manifest module; an absent key is
    // "no module-level restriction", not "deny".
    allowed = false;
    expect(runGuard({})).toBe(true);
  });

  it('delegates the decision rather than reading roles itself', () => {
    const access = TestBed.inject(ModuleAccessService);
    const spy = spyOn(access, 'canAccessModuleAsync').and.returnValue(of(true));

    runGuard({ moduleKey: 'procurement' });

    expect(spy).toHaveBeenCalledWith('procurement');
  });
});
