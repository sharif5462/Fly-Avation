import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { Role } from '../models/role.model';

/**
 * Route-data-driven authorization: `data: { roles: ['Finance'] }`.
 * Applied at each module's parent route in app.routes.ts so an entire
 * module (and every generic sub-page beneath it) is gated in one place.
 * No `roles` in data means "any authenticated user".
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required = route.data['roles'] as Role[] | undefined;
  if (!required || required.length === 0 || auth.hasRole(...required)) {
    return true;
  }
  return router.createUrlTree(['/403']);
};
