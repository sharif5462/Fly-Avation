import { TagSeverity } from './entity-config.model';

export const ITEM_CATEGORIES = [
  'Avionics', 'Airframe', 'Engine', 'Landing Gear', 'Hydraulics', 'Cabin Interior', 'Electrical', 'Consumables', 'Tools', 'Safety Equipment'
];

export const ITEM_TYPES = ['Rotable', 'Repairable', 'Consumable', 'Expendable', 'Tool', 'Raw Material'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const UNITS = ['EA', 'SET', 'BOX', 'KG', 'LTR', 'PAIR', 'ROLL', 'PKT'];

export const ITEM_STATUSES = ['Active', 'Inactive', 'Discontinued', 'Under Review'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];
export const ITEM_STATUS_SEVERITY: Record<ItemStatus, TagSeverity> = {
  Active: 'success',
  Inactive: 'secondary',
  Discontinued: 'danger',
  'Under Review': 'warn'
};

export interface ItemMaster {
  id: string;

  // Basic Info
  itemCode: string;
  itemName: string;
  itemCategory: string;
  itemGroup: string;
  itemSubGroup: string;
  description: string;

  // Classification
  itemType: ItemType;
  unit: string;
  brand: string;
  manufacturer: string;
  manufacturerPartNo: string;
  ataChapter: string;

  // Supplier & Pricing
  primarySupplier: string;
  purchasePrice: number;
  salesPrice: number;
  packSize: number;
  discountApplicable: boolean;
  taxVatPct: number;

  // Stock & Storage
  warehouse: string;
  storeLocation: string;
  rackBin: string;
  reorderLevel: number;
  reorderQty: number;
  minStock: number;
  maxStock: number;
  currentStock: number;

  // Tracking & Compliance
  serialTracked: boolean;
  batchTracked: boolean;
  shelfLifeTracked: boolean;
  shelfLifeMonths: number;
  warrantyApplicable: boolean;
  warrantyPeriodMonths: number;
  calibrationRequired: boolean;
  calibrationIntervalMonths: number;
  lifeLimited: boolean;
  assetFlag: boolean;

  // Status
  status: ItemStatus;
}
