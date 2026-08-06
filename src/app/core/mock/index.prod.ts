import { HttpInterceptorFn } from '@angular/common/http';

import { DemoAccount } from './demo-account.model';

/**
 * Production stand-in for `core/mock/index.ts`, substituted by the
 * `fileReplacements` entry on the production build configuration.
 *
 * It deliberately imports nothing from the rest of `core/mock/`, which is what
 * lets the bundler drop the mock API interceptor, the seed data and the demo
 * credentials from the production bundle entirely instead of shipping them
 * switched off. Keep the exported surface identical to `index.ts`, or the
 * production build breaks in a way dev never shows.
 */

/** Pass-through: production requests always go to the real API. */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => next(req);

/** No mock database exists in production; the menu entry for this is hidden. */
export function resetMockDatabase(): void {
  /* intentionally empty */
}

export type { DemoAccount } from './demo-account.model';

export const DEMO_ACCOUNTS: DemoAccount[] = [];

export const MOCK_BACKEND_AVAILABLE = false;
