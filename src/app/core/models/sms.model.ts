import { TagSeverity } from './entity-config.model';

export const HAZARD_SOURCES = ['Line Operations', 'Maintenance', 'Flight Data Monitoring', 'Audit', 'Voluntary Report', 'Other'];
export const HAZARD_CATEGORIES = ['Operational', 'Technical', 'Organizational', 'Environmental', 'Human Factors'];
export const AFFECTED_AREAS = ['Flight Ops', 'Ground Ops', 'Maintenance', 'Cabin', 'ATC', 'Other'];
export const FLIGHT_PHASES = ['N/A', 'Pre-Flight', 'Taxi', 'Takeoff', 'Climb', 'Cruise', 'Descent', 'Approach', 'Landing', 'Post-Flight'];

export const LIKELIHOOD_LEVELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'] as const;
export type LikelihoodLevel = (typeof LIKELIHOOD_LEVELS)[number];

export const SEVERITY_LEVELS = ['Negligible', 'Minor', 'Major', 'Hazardous', 'Catastrophic'] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

export const RISK_TOLERABILITY = ['Acceptable', 'Tolerable', 'Unacceptable'] as const;
export type RiskTolerability = (typeof RISK_TOLERABILITY)[number];
export const RISK_TOLERABILITY_SEVERITY: Record<RiskTolerability, TagSeverity> = {
  Acceptable: 'success',
  Tolerable: 'warn',
  Unacceptable: 'danger'
};

export const HAZARD_STATUSES = ['Open', 'Under Investigation', 'Mitigation In Progress', 'Closed'] as const;
export type HazardStatus = (typeof HAZARD_STATUSES)[number];
export const HAZARD_STATUS_SEVERITY: Record<HazardStatus, TagSeverity> = {
  Open: 'danger',
  'Under Investigation': 'warn',
  'Mitigation In Progress': 'info',
  Closed: 'success'
};

export interface HazardReport {
  id: string;

  // Hazard Details
  hazardNo: string;
  hazardTitle: string;
  dateIdentified: string | null;
  reportedBy: string;
  department: string;
  source: string;
  description: string;
  location: string;

  // Classification
  hazardCategory: string;
  affectedArea: string;
  aircraftReg: string;
  flightPhase: string;

  // Risk Assessment
  initialLikelihood: LikelihoodLevel;
  initialSeverity: SeverityLevel;
  initialRiskScore: number;
  riskTolerability: RiskTolerability;

  // Mitigation
  mitigationActions: string;
  responsiblePerson: string;
  targetCompletionDate: string | null;
  residualLikelihood: LikelihoodLevel;
  residualSeverity: SeverityLevel;
  residualRiskScore: number;

  // Status & Closure
  status: HazardStatus;
  closedDate: string | null;
  closedBy: string;
  verifiedEffective: boolean;
}

export const HAZARD_DATE_FIELDS = ['dateIdentified', 'targetCompletionDate', 'closedDate'] as const;
export type HazardDateField = (typeof HAZARD_DATE_FIELDS)[number];
