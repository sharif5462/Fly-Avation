import { USER_STORAGE_KEY } from '../auth/storage-keys';
import { User } from '../models/user.model';
import { applyScopeFilter, resolveScopeValue } from './mock-api.interceptor';

type Row = Record<string, unknown> & { id: string };

function setCurrentUser(user: Partial<User> | null): void {
  if (user === null) {
    localStorage.removeItem(USER_STORAGE_KEY);
  } else {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

describe('mock-api.interceptor row-level scoping', () => {
  afterEach(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('mockdb:airport-master');
  });

  describe('applyScopeFilter — entity with no scopeField configured', () => {
    it('returns rows unchanged no matter what the signed-in user is scoped to', () => {
      setCurrentUser({ roles: ['Irrops'], stationScope: ['JFK'] });
      const rows: Row[] = [{ id: '1' }, { id: '2' }];
      // route-planning has no scopeField — scoping is opt-in per entity.
      expect(applyScopeFilter('route-planning', rows)).toEqual(rows);
    });
  });

  describe('applyScopeFilter — plain-text scopeField (catering-order.station)', () => {
    const rows: Row[] = [
      { id: '1', station: 'JFK' },
      { id: '2', station: 'LHR' },
      { id: '3', station: 'DXB' }
    ];

    it('returns every row when nobody is signed in', () => {
      setCurrentUser(null);
      expect(applyScopeFilter('catering-order', rows).length).toBe(3);
    });

    it('returns every row when the signed-in user has no stationScope set (the common case)', () => {
      setCurrentUser({ roles: ['Catering'] });
      expect(applyScopeFilter('catering-order', rows).length).toBe(3);
    });

    it("filters to only rows whose station is in the user's stationScope", () => {
      setCurrentUser({ roles: ['Catering'], stationScope: ['JFK'] });
      expect(applyScopeFilter('catering-order', rows).map((r) => r['id'])).toEqual(['1']);
    });

    it('returns nothing when none of the rows match the scope', () => {
      setCurrentUser({ roles: ['Catering'], stationScope: ['SYD'] });
      expect(applyScopeFilter('catering-order', rows)).toEqual([]);
    });

    it('lets SuperAdmin see every row even with a stationScope set', () => {
      setCurrentUser({ roles: ['SuperAdmin'], stationScope: ['JFK'] });
      expect(applyScopeFilter('catering-order', rows).length).toBe(3);
    });

    it('lets Admin see every row even with a stationScope set', () => {
      setCurrentUser({ roles: ['Admin'], stationScope: ['JFK'] });
      expect(applyScopeFilter('catering-order', rows).length).toBe(3);
    });
  });

  describe('applyScopeFilter — scopeField backed by a lookup field (gha-registry.station -> airport-master)', () => {
    beforeEach(() => {
      // Pre-seed a known Airport Master collection so resolution is deterministic
      // instead of depending on the real (randomized) mock seed generator.
      localStorage.setItem(
        'mockdb:airport-master',
        JSON.stringify([
          { id: 'airport-master-0001', iataCode: 'JFK' },
          { id: 'airport-master-0002', iataCode: 'LHR' },
          { id: 'airport-master-0003', iataCode: 'DXB' }
        ])
      );
    });

    const rows: Row[] = [
      { id: '1', station: 'airport-master-0001' }, // JFK
      { id: '2', station: 'airport-master-0002' }, // LHR
      { id: '3', station: 'airport-master-0003' } // DXB
    ];

    it("resolves the surrogate id to its IATA code before comparing against stationScope", () => {
      setCurrentUser({ roles: ['GroundHandling'], stationScope: ['JFK', 'LHR'] });
      expect(applyScopeFilter('gha-registry', rows).map((r) => r['id']).sort()).toEqual(['1', '2']);
    });

    it('resolveScopeValue returns the IATA code, not the raw airport-master row id', () => {
      expect(resolveScopeValue('gha-registry', 'station', rows[0])).toBe('JFK');
    });

    it('resolveScopeValue returns undefined for a dangling reference with no matching master row', () => {
      expect(resolveScopeValue('gha-registry', 'station', { id: '9', station: 'airport-master-9999' })).toBeUndefined();
    });
  });
});
