export const environment = {
  production: false,
  appName: 'Aviation ERP',
  // .NET Web API base URL. Every core service builds its requests as
  // `${apiUrl}/<resource>` (e.g. GetString /flight-scheduling`), matching the
  // REST contract documented in README.md so the backend team has a fixed target.
  apiUrl: 'https://localhost:7001/api',
  // No .NET/Oracle backend exists yet, so requests are served by
  // core/mock/mock-api.interceptor.ts against seeded, localStorage-backed
  // in-memory data. Flip to false the day a real API is reachable at apiUrl —
  // no component or service code needs to change, only this flag.
  useMockApi: true,
  tokenStorageKey: 'aviation_erp_token',
  mockLatencyMs: 250
};
