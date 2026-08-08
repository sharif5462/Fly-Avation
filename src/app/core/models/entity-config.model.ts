export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'boolean'
  | 'textarea'
  | 'email'
  | 'lookup'
  | 'file';

export type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
  severity?: TagSeverity;
}

/** What the scaffold stores for a 'file' field — metadata only, see FeatureListPage.onFileSelected(). */
export interface FileFieldValue {
  name: string;
  sizeKb: number;
  uploadedAt: string;
}

export interface EntityField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  /** Render this column's value as a colored p-tag using `options[].severity`. */
  badge?: boolean;
  hideInTable?: boolean;
  hideInForm?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  /** Column width hint, e.g. '10rem'. */
  width?: string;
  /**
   * type: 'lookup' only — the entity/resource key this field's dropdown is
   * populated from at runtime (FeatureListPage.loadLookups() calls
   * `api.list(lookupEntity)`). Distinct from `options`, which is a static
   * list baked into the config; a lookup's choices come from another
   * entity's live rows, the same way a foreign key references another
   * table's primary key.
   */
  lookupEntity?: string;
  /** type: 'lookup' only — which field on the referenced row to show as the option label. Defaults to the row's `id`. */
  lookupLabelField?: string;
  /** type: 'file' only — HTML `accept` attribute, e.g. 'application/pdf,image/*'. */
  acceptTypes?: string;
}

export interface EntityConfig {
  /** Unique key — also the mock/API resource path segment. */
  key: string;
  label: string;
  pluralLabel: string;
  icon: string;
  description: string;
  fields: EntityField[];
  seedCount?: number;
  /**
   * Marks which field holds this entity's station/airport code for
   * row-level access scoping. When set, core/mock/mock-api.interceptor.ts
   * filters list results to rows whose value in this field is included in
   * the signed-in user's `User.stationScope` (unset scope = unrestricted,
   * same bypass convention as SuperAdmin/Admin module-level roles). Purely
   * a mock-layer stand-in for the row-level authorization the real .NET API
   * must enforce server-side — see README.md.
   */
  scopeField?: string;
}
