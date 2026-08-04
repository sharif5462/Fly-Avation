import { TagSeverity } from './entity-config.model';

export const MANUFACTURERS = ['Boeing', 'Airbus', 'ATR', 'Bombardier'] as const;
export type Manufacturer = (typeof MANUFACTURERS)[number];

export const MODELS_BY_MANUFACTURER: Record<Manufacturer, string[]> = {
  Boeing: ['B737-800', 'B737 MAX 8', 'B777-300ER', 'B787-9'],
  Airbus: ['A320-200', 'A321neo', 'A330-300', 'A350-900'],
  ATR: ['ATR 72-600', 'ATR 42-600'],
  Bombardier: ['CRJ900', 'Dash 8 Q400']
};

export const AIRCRAFT_TYPES = ['Narrow-body', 'Wide-body', 'Regional Jet', 'Turboprop', 'Freighter'];

export const LEASE_TYPES = ['Owned', 'Dry Lease', 'Wet Lease'] as const;
export type LeaseType = (typeof LEASE_TYPES)[number];

export const CURRENT_STATUSES = ['Active', 'Maintenance', 'Grounded', 'Retired', 'Parked'] as const;
export type CurrentStatus = (typeof CURRENT_STATUSES)[number];
export const CURRENT_STATUS_SEVERITY: Record<CurrentStatus, TagSeverity> = {
  Active: 'success',
  Maintenance: 'warn',
  Grounded: 'danger',
  Retired: 'secondary',
  Parked: 'info'
};

export const FLIGHT_CATEGORIES = ['Domestic', 'International', 'Cargo', 'Charter'] as const;
export type FlightCategory = (typeof FLIGHT_CATEGORIES)[number];

export const ERP_STATUSES = ['Active', 'Inactive', 'Under Maintenance', 'Retired', 'Scrapped'] as const;
export type ErpStatus = (typeof ERP_STATUSES)[number];
export const ERP_STATUS_SEVERITY: Record<ErpStatus, TagSeverity> = {
  Active: 'success',
  Inactive: 'secondary',
  'Under Maintenance': 'warn',
  Retired: 'contrast',
  Scrapped: 'danger'
};

/** Date-typed fields, kept as ISO ('yyyy-MM-dd') strings on the wire and `Date | null` in the form. */
export const AIRCRAFT_DATE_FIELDS = [
  'leaseStartDate',
  'leaseEndDate',
  'registrationDate',
  'registrationExpiry',
  'airworthinessExpiry',
  'insuranceExpiry',
  'lastMaintenanceDate',
  'nextMaintenanceDate',
  'lastACheck',
  'nextACheck',
  'lastCCheck',
  'nextCCheck'
] as const;
export type AircraftDateField = (typeof AIRCRAFT_DATE_FIELDS)[number];

export interface AircraftRegistration {
  id: string;

  // 1. Basic Information
  registrationNumber: string;
  serialNumber: string;
  manufacturer: Manufacturer | string;
  model: string;
  aircraftType: string;
  icaoCode: string;
  iataCode: string;

  // 2. Ownership Information
  ownerName: string;
  operatorName: string;
  leaseType: LeaseType;
  leaseStartDate: string | null;
  leaseEndDate: string | null;
  lessorName: string;

  // 3. Technical Information
  engineManufacturer: string;
  engineModel: string;
  engineCount: number;
  engineSerialNumbers: string;
  mtow: number;
  mlw: number;
  mzfw: number;
  fuelCapacity: number;
  cruiseSpeed: number;
  maxRange: number;
  wingspan: number;
  aircraftLength: number;
  aircraftHeight: number;

  // 4. Capacity
  totalSeats: number;
  businessSeats: number;
  economySeats: number;
  firstClassSeats: number;
  cargoCapacity: number;
  maxPassengers: number;

  // 5. Operational Information
  homeBaseAirport: string;
  currentAirport: string;
  currentStatus: CurrentStatus;
  flightCategory: FlightCategory;

  // 6. Certification
  registrationDate: string | null;
  registrationExpiry: string | null;
  airworthinessCertNo: string;
  airworthinessExpiry: string | null;
  insurancePolicyNo: string;
  insuranceExpiry: string | null;
  noiseCertificate: string;
  radioLicense: string;
  certificateOfRegistration: string;

  // 7. Maintenance Information
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  lastACheck: string | null;
  nextACheck: string | null;
  lastCCheck: string | null;
  nextCCheck: string | null;
  totalFlightHours: number;
  totalFlightCycles: number;
  remainingHours: number;
  remainingCycles: number;

  // 8. Communication Equipment
  transponderCode: string;
  eltNumber: string;
  satcomInstalled: boolean;
  adsbInstalled: boolean;
  tcasInstalled: boolean;
  weatherRadarInstalled: boolean;

  // 9. Documents (filenames — mock upload only, no real storage backend yet)
  registrationCertificateFile: string;
  airworthinessCertificateFile: string;
  insuranceCopyFile: string;
  leaseAgreementFile: string;
  maintenanceCertificateFile: string;
  aircraftPhotoFile: string;

  // 10. Financial Information
  purchasePrice: number;
  currentValue: number;
  monthlyLeaseCost: number;
  depreciation: number;
  insuranceCost: number;

  // 11. ERP Status
  erpStatus: ErpStatus;
}
