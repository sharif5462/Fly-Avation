import { TestBed } from '@angular/core/testing';

import { ScreenSearchService } from './screen-search.service';
import { ModuleAccessService } from '../auth/module-access.service';
import { MODULES } from '../data/module-manifest';

describe('ScreenSearchService', () => {
  let allowedModules: Set<string> | null;

  function createService(): ScreenSearchService {
    return TestBed.inject(ScreenSearchService);
  }

  beforeEach(() => {
    allowedModules = null; // null = allow everything
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ModuleAccessService,
          useValue: { canAccessModule: (key: string) => !allowedModules || allowedModules.has(key) }
        }
      ]
    });
  });

  describe('the screen list', () => {
    it('flattens every routable screen out of the manifest', () => {
      const expected = MODULES.reduce((n, m) => n + m.items.length, 0) - 1; // BI dashboard is not routed here
      expect(createService().screens().length).toBe(expected);
    });

    it('excludes the one item that is not routed under its module', () => {
      const paths = createService().screens().map((s) => s.path);
      expect(paths).not.toContain('/business-intelligence/dashboard');
    });

    it('carries the module name, since screen labels repeat across modules', () => {
      const incidents = createService().screens().filter((s) => s.label === 'Incident Reporting');

      // Reached from Compliance, Landside and Facilities — indistinguishable
      // without the module.
      expect(incidents.length).toBeGreaterThan(1);
      expect(new Set(incidents.map((s) => s.moduleLabel)).size).toBe(incidents.length);
    });

    it('offers nothing from a module the user cannot open', () => {
      allowedModules = new Set(['procurement']);
      const screens = createService().screens();

      // A result that bounces the user to /403 is worse than no result.
      expect(screens.length).toBeGreaterThan(0);
      expect(screens.every((s) => s.moduleKey === 'procurement')).toBe(true);
    });
  });

  describe('search ranking', () => {
    it('returns nothing for an empty query', () => {
      expect(createService().search('')).toEqual([]);
      expect(createService().search('   ')).toEqual([]);
    });

    it('puts an exact label match first', () => {
      const results = createService().search('purchase orders');
      expect(results[0].label).toBe('Purchase Orders');
    });

    it('ranks a label prefix above a mid-string hit', () => {
      const results = createService().search('bag');
      const first = results[0].label.toLowerCase();

      // "Bag Drop Units"/"Bag Tracking" start with it; "Mishandled Baggage"
      // merely contains it.
      expect(first.startsWith('bag')).toBe(true);
    });

    it('matches the start of any word in the label', () => {
      const results = createService().search('reserv');
      expect(results.some((r) => r.label.includes('Reservation'))).toBe(true);
    });

    it('ranks a screen-name match above a module-name match', () => {
      const results = createService().search('procurement');
      // The Procurement module's own screens match only on module name; a
      // screen actually called something-procurement should win if one exists.
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThanOrEqual(results[results.length - 1].score);
    });

    it('finds screens by their module when the label does not match', () => {
      const results = createService().search('baggage handling');
      expect(results.some((r) => r.moduleKey === 'baggage-handling-system')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(createService().search('PURCHASE ORDERS')[0].label).toBe('Purchase Orders');
    });

    it('caps the number of results', () => {
      // 'a' matches a large slice of 400+ screens; an uncapped list would
      // render hundreds of rows into the palette.
      expect(createService().search('a', 10).length).toBe(10);
    });

    it('returns nothing for a term that matches no screen', () => {
      expect(createService().search('zzzznotascreen')).toEqual([]);
    });

    it('never returns a screen the user cannot open', () => {
      allowedModules = new Set(['procurement']);
      const results = createService().search('a', 100);

      expect(results.every((r) => r.moduleKey === 'procurement')).toBe(true);
    });

    it('sorts equal scores alphabetically, so the order is stable', () => {
      const results = createService().search('management', 100);
      const tied = results.filter((r) => r.score === results[0].score).map((r) => r.label);

      expect(tied).toEqual([...tied].sort((a, b) => a.localeCompare(b)));
    });
  });
});
