/**
 * Demo: an optimized, deployable build that still runs entirely on the seeded
 * mock data in `core/mock/*` — no backend required. Used for stakeholder
 * demos and UAT sandboxes while the .NET/Oracle API is being built.
 *
 * Built with `npm run build:demo`. Anyone who can reach a deployment of this
 * artifact can sign in with the published demo credentials, so host it behind
 * whatever access control the environment already has and never point a real
 * DNS name for the production app at it.
 */
export const environment = {
  production: true,
  appName: 'Aviation ERP (Demo)',
  apiUrl: '/api',
  useMockApi: true,
  tokenStorageKey: 'aviation_erp_token',
  // No artificial latency in a deployed demo — the 250 ms in dev exists to
  // make loading states visible while building them.
  mockLatencyMs: 0
};
