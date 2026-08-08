/**
 * localStorage key for the signed-in user's `User` object (JSON). Shared
 * between AuthService (writes it on login) and core/mock/mock-api.interceptor.ts
 * (reads it to enforce row-level `scopeField` filtering) — pulled out to its
 * own module so the two don't duplicate the literal string.
 */
export const USER_STORAGE_KEY = 'aviation_erp_user';
