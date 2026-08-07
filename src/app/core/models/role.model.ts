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
  | 'LoadControl'
  | 'RevenueManagement'
  | 'AviationSecurity'
  | 'Sustainability'
  | 'Distribution'
  | 'Portals'
  | 'Integration'
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
  'LoadControl',
  'RevenueManagement',
  'AviationSecurity',
  'Sustainability',
  'Distribution',
  'Portals',
  'Integration',
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
  // Application/IT security — user accounts, roles, MFA. Physical and
  // passenger security is AviationSecurity, a separate function entirely.
  Security: 'IT & Application Security',
  Facilities: 'Facilities & Assets',
  LoadControl: 'Load Control & Weight/Balance',
  RevenueManagement: 'Revenue Management & Pricing',
  AviationSecurity: 'Aviation Security (AVSEC)',
  Sustainability: 'Sustainability & Emissions',
  Distribution: 'Distribution (GDS/NDC)',
  Portals: 'Self-Service Portals',
  Integration: 'Integration Hub',
  ReadOnly: 'Read Only'
};
