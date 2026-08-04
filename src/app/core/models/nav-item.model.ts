import { Role } from './role.model';

export interface ModuleItemDef {
  /** Route segment + mock/API resource key for generic (scaffold) items. */
  key: string;
  label: string;
  icon: string;
  /** True when this item has a hand-built component instead of the generic scaffold page. */
  flagship?: boolean;
}

export interface ModuleDef {
  key: string;
  label: string;
  icon: string;
  /** Role that owns this module (Admin/SuperAdmin always pass too). Omit for "any authenticated user". */
  role?: Role;
  items: ModuleItemDef[];
}
