import { EntityConfig } from '../models/entity-config.model';
import { entity, f, file, lookup, statusField } from '../data/entity-field-helpers';
import { generateSeedRows } from './fake-data';

describe('generateSeedRows', () => {
  it('generates config.seedCount rows, each with a unique id and a createdAt', () => {
    const config: EntityConfig = entity('widget', 'Widget', 'Widgets', 'pi-box', 'desc', [f('code', 'Code')], 5);
    const rows = generateSeedRows(config);

    expect(rows.length).toBe(5);
    const ids = new Set(rows.map((r) => r['id']));
    expect(ids.size).toBe(5);
    rows.forEach((r) => expect(typeof r['createdAt']).toBe('string'));
  });

  it('defaults to 12 rows when seedCount is not set', () => {
    const config: EntityConfig = entity('widget', 'Widget', 'Widgets', 'pi-box', 'desc', [f('code', 'Code')]);
    delete (config as { seedCount?: number }).seedCount;
    expect(generateSeedRows(config).length).toBe(12);
  });

  it('leaves a "file" field unset — most demo records start with nothing attached', () => {
    const config: EntityConfig = entity('doc', 'Doc', 'Docs', 'pi-file', 'desc', [file('attachment', 'Attachment')], 3);
    const rows = generateSeedRows(config);
    rows.forEach((r) => expect(r['attachment']).toBeNull());
  });

  it('resolves a "lookup" field to a real id from the referenced entity via the resolver callback', () => {
    const config: EntityConfig = entity(
      'route',
      'Route',
      'Routes',
      'pi-map',
      'desc',
      [lookup('origin', 'Origin', 'airport-master', 'iataCode'), statusField([['Active', 'success']])],
      8
    );
    const fakeAirportRows = [
      { id: 'airport-master-0001', iataCode: 'JFK' },
      { id: 'airport-master-0002', iataCode: 'LHR' }
    ];
    const resolver = jasmine.createSpy('resolveLookupRows').and.callFake((key: string) => (key === 'airport-master' ? fakeAirportRows : []));

    const rows = generateSeedRows(config, resolver);

    expect(resolver).toHaveBeenCalledWith('airport-master');
    const validIds = new Set(fakeAirportRows.map((r) => r.id));
    rows.forEach((r) => expect(validIds.has(r['origin'] as string)).toBe(true));
  });

  it('leaves a "lookup" field null when the referenced entity has no rows yet (no resolver wired)', () => {
    const config: EntityConfig = entity('route', 'Route', 'Routes', 'pi-map', 'desc', [lookup('origin', 'Origin', 'airport-master', 'iataCode')], 3);
    const rows = generateSeedRows(config);
    rows.forEach((r) => expect(r['origin']).toBeNull());
  });

  it('picks a value from static options instead of generating one, for any field type', () => {
    const config: EntityConfig = entity('widget', 'Widget', 'Widgets', 'pi-box', 'desc', [statusField([['Open', 'danger'], ['Closed', 'success']])], 20);
    const rows = generateSeedRows(config);
    const allowed = new Set(['Open', 'Closed']);
    rows.forEach((r) => expect(allowed.has(r['status'] as string)).toBe(true));
  });
});
