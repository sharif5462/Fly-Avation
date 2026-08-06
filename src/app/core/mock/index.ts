import { DemoAccount } from './demo-account.model';
import { MOCK_CREDENTIALS } from './mock-users';

/**
 * The **only** module outside `core/mock/` that anything else may import from.
 *
 * Production builds swap this file for `index.prod.ts` via `fileReplacements`
 * in angular.json, which is what actually keeps the mock backend — the fake
 * data generator, the seed data, and the demo credentials — out of the
 * production bundle. Turning `environment.useMockApi` off only makes the mock
 * layer *dormant*; every byte of it still ships, and `super123` is still
 * sitting in the JavaScript for anyone who looks.
 *
 * So: import from `core/mock`, never from `core/mock/mock-users` or
 * `core/mock/mock-api.interceptor` directly, or the replacement is bypassed
 * and the seam stops working.
 */
export { mockApiInterceptor } from './mock-api.interceptor';
export { resetMockDatabase } from './mock-db';
export type { DemoAccount } from './demo-account.model';

/** Shown on the login screen so a reviewer can sign in without a backend. */
export const DEMO_ACCOUNTS: DemoAccount[] = MOCK_CREDENTIALS.map((credential) => ({
  username: credential.user.username,
  password: credential.password,
  fullName: credential.user.fullName,
  jobTitle: credential.user.jobTitle,
  initials: credential.user.initials,
  avatarColor: credential.user.avatarColor
}));

/** True when this build carries a working mock backend. */
export const MOCK_BACKEND_AVAILABLE = true;
