/**
 * Module-level roles. Each ERP module is "owned" by one of these; a user needs
 * that role (or Admin/SuperAdmin, which bypass every check) to access it.
 * Kept flat rather than hierarchical so it maps 1:1 to a claim the .NET API
 * can put straight into the JWT (`role` claim, multi-valued).
 */
export type Role =
  | 'SuperAdmin'
  | 'Admin'
  | 'FlightOps'
  | 'Maintenance'
  | 'Fleet'
  | 'Inventory'
  | 'Procurement'
  | 'Crew'
  | 'Reservations'
  | 'AirportOps'
  | 'Resources'
  | 'Baggage'
  | 'Landside'
  | 'Cargo'
  | 'Fuel'
  | 'Finance'
  | 'HR'
  | 'Compliance'
  | 'QualityAssurance'
  | 'CRM'
  | 'DocumentControl'
  | 'BI'
  | 'Security'
  | 'Facilities'
  | 'ReadOnly';

export const ALL_ROLES: Role[] = [
  'SuperAdmin',
  'Admin',
  'FlightOps',
  'Maintenance',
  'Fleet',
  'Inventory',
  'Procurement',
  'Crew',
  'Reservations',
  'AirportOps',
  'Resources',
  'Baggage',
  'Landside',
  'Cargo',
  'Fuel',
  'Finance',
  'HR',
  'Compliance',
  'QualityAssurance',
  'CRM',
  'DocumentControl',
  'BI',
  'Security',
  'Facilities',
  'ReadOnly'
];

export const ROLE_LABELS: Record<Role, string> = {
  SuperAdmin: 'Super Administrator',
  Admin: 'Administrator',
  FlightOps: 'Flight Operations',
  Maintenance: 'Aircraft Maintenance (MRO)',
  Fleet: 'Fleet Management',
  Inventory: 'Inventory & Spare Parts',
  Procurement: 'Procurement',
  Crew: 'Crew Management',
  Reservations: 'Passenger Reservations',
  AirportOps: 'Airport Operations',
  Resources: 'Resource & Gate Management',
  Baggage: 'Baggage Handling System (BHS)',
  Landside: 'Landside Operations',
  Cargo: 'Cargo Management',
  Fuel: 'Fuel Management',
  Finance: 'Finance & Accounting',
  HR: 'Human Resources',
  Compliance: 'Compliance & Safety',
  QualityAssurance: 'Quality Assurance',
  CRM: 'Customer Relationship Management',
  DocumentControl: 'Document Management',
  BI: 'Business Intelligence',
  Security: 'Security Management',
  Facilities: 'Facilities & Assets',
  ReadOnly: 'Read Only'
};
