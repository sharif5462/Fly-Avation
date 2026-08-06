/**
 * Production: talks to the real .NET Web API. The mock layer is off, so
 * `core/mock/*` never answers a request and the demo accounts are not offered
 * on the login screen.
 *
 * If you want a deployable build that still runs on seeded mock data — for a
 * stakeholder demo, a UAT sandbox, a screenshot — use `npm run build:demo`,
 * which is optimized exactly like this one but keeps `useMockApi` on. Do not
 * flip the flag below to get that; a production artifact that authenticates
 * against `core/mock/mock-users.ts` accepts `superadmin` / `super123` from
 * anyone who loads the page.
 */
export const environment = {
  production: true,
  appName: 'Aviation ERP',
  // Served from the same origin as the SPA (reverse proxy in front of the
  // .NET API), so no CORS and no absolute host baked into the bundle.
  apiUrl: '/api',
  useMockApi: false,
  tokenStorageKey: 'aviation_erp_token',
  mockLatencyMs: 0
};
