import { Company } from '../models/company.model';

/**
 * DEMO DATA ONLY — the real company list comes from the API.
 *
 * Three entities modelling the shape a real aviation group takes: the AOC
 * holder, the ground handling arm and the maintenance organisation. They are
 * separate legal entities with their own books, which is exactly why records
 * cannot be shared between them and every table carries a company.
 */
export const MOCK_COMPANIES: Company[] = [
  {
    id: 'cmp-001',
    code: 'AVE',
    name: 'Aviation ERP Airlines Ltd.',
    airlineDesignator: 'AV',
    baseCurrency: 'USD',
    country: 'Bangladesh',
    isDefault: true
  },
  {
    id: 'cmp-002',
    code: 'AGS',
    name: 'Aviation ERP Ground Services Ltd.',
    baseCurrency: 'BDT',
    country: 'Bangladesh'
  },
  {
    id: 'cmp-003',
    code: 'ATL',
    name: 'Aviation ERP Technic Ltd.',
    baseCurrency: 'USD',
    country: 'Singapore'
  }
];

export const DEFAULT_COMPANY_ID = MOCK_COMPANIES.find((c) => c.isDefault)?.id ?? MOCK_COMPANIES[0].id;

export function findCompany(id: string): Company | undefined {
  return MOCK_COMPANIES.find((c) => c.id === id);
}
