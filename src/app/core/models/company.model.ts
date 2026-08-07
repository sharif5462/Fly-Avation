/**
 * A legal entity whose data this ERP keeps separate from every other.
 *
 * "Company" here means *ownership of records*, not a company named in a
 * record. `staff-id-cards.company` and `rental-car-facility.rentalCompany`
 * are data about somebody else's business; `Company.id` is which of *our*
 * entities a row belongs to, and it is the key every table is partitioned on.
 */
export interface Company {
  id: string;
  /** Short code used in documents and report headers, e.g. 'AVE'. */
  code: string;
  name: string;
  /** ICAO/IATA designator where the entity is an operator; blank for non-flying entities. */
  airlineDesignator?: string;
  /** ISO 4217 code this entity keeps its books in. */
  baseCurrency: string;
  country: string;
  /** Set on exactly one company — where a user lands before choosing another. */
  isDefault?: boolean;
}

/** Header the frontend sends to tell the API which company a request is for. */
export const COMPANY_HEADER = 'X-Company-Id';
