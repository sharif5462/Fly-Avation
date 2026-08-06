import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { ModuleAccessService } from './module-access.service';

/**
 * Module-level authorization: `data: { moduleKey: 'finance-accounting' }`.
 * Applied at each module's parent route in app.routes.ts so an entire module
 * (and every generic sub-page beneath it) is gated in one place.
 *
 * The decision lives in ModuleAccessService because it combines two things:
 * the role that owns the module (module-manifest.ts) *and* any extra access
 * an admin granted that role on the Access Control screen. Passing the module
 * key rather than a role list is what lets the guard see both — with a bare
 * `roles` array it could only ever check the first.
 */
export const roleGuard: CanActivateFn = (route) => {
  const access = inject(ModuleAccessService);
  const router = inject(Router);

  const moduleKey = route.data['moduleKey'] as string | undefined;
  if (!moduleKey) return true;

  return access
    .canAccessModuleAsync(moduleKey)
    .pipe(map((allowed) => allowed || router.createUrlTree(['/403'])));
};
