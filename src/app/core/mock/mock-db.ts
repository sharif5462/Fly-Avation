const PREFIX = 'mockdb:';

/**
 * Minimal localStorage-backed persistence for the mock API so demo data
 * (and anything the user adds/edits while clicking around) survives a page
 * refresh. Swapped out entirely once useMockApi is false — see README.md.
 */
export function loadCollection<T>(resource: string, seed: () => T[]): T[] {
  const key = PREFIX + resource;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as T[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* fall through and reseed on corrupt data */
    }
  }
  const seeded = seed();
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

export function saveCollection<T>(resource: string, rows: T[]): void {
  localStorage.setItem(PREFIX + resource, JSON.stringify(rows));
}

export function resetMockDatabase(): void {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
