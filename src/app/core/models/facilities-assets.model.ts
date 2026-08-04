import { TagSeverity } from './entity-config.model';

export const ASSET_CATEGORIES = [
  'Building Infrastructure', 'HVAC', 'Fire & Safety', 'Electrical', 'Elevator/Lift', 'Crane/Hoist', 'Generator', 'Hangar Door', 'Furniture & Fixtures', 'IT Equipment', 'GSE', 'Other'
];

export const DEPRECIATION_METHODS = ['Straight Line', 'Declining Balance', 'None'] as const;
export type DepreciationMethod = (typeof DEPRECIATION_METHODS)[number];

export const ASSET_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Out of Service'] as const;
export type AssetCondition = (typeof ASSET_CONDITIONS)[number];
export const ASSET_CONDITION_SEVERITY: Record<AssetCondition, TagSeverity> = {
  Excellent: 'success',
  Good: 'success',
  Fair: 'warn',
  Poor: 'danger',
  'Out of Service': 'danger'
};

export const ASSET_STATUSES = ['Active', 'Under Maintenance', 'Out of Service', 'Reserved', 'Disposed'] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];
export const ASSET_STATUS_SEVERITY: Record<AssetStatus, TagSeverity> = {
  Active: 'success',
  'Under Maintenance': 'warn',
  'Out of Service': 'danger',
  Reserved: 'info',
  Disposed: 'secondary'
};

export interface AssetMaster {
  id: string;

  // Basic Info
  assetCode: string;
  assetName: string;
  assetCategory: string;
  assetType: string;
  description: string;
  serialNumber: string;
  assetTag: string;

  // Location
  facility: string;
  building: string;
  floorZone: string;
  roomLocation: string;

  // Acquisition & Financial
  manufacturer: string;
  model: string;
  purchaseDate: string | null;
  purchasePrice: number;
  currentValue: number;
  depreciationMethod: DepreciationMethod;
  usefulLifeYears: number;
  vendor: string;
  warrantyExpiry: string | null;
  insurancePolicyNo: string;

  // Maintenance & Condition
  condition: AssetCondition;
  lastInspectionDate: string | null;
  nextInspectionDate: string | null;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  maintenanceFrequencyMonths: number;
  assignedTechnician: string;

  // Compliance & Status
  certificationRequired: boolean;
  certificationExpiry: string | null;
  criticalAsset: boolean;
  status: AssetStatus;
}

export const ASSET_DATE_FIELDS = [
  'purchaseDate',
  'warrantyExpiry',
  'lastInspectionDate',
  'nextInspectionDate',
  'lastMaintenanceDate',
  'nextMaintenanceDate',
  'certificationExpiry'
] as const;
export type AssetDateField = (typeof ASSET_DATE_FIELDS)[number];
