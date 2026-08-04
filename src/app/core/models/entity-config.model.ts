export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'boolean'
  | 'textarea'
  | 'email';

export type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
  severity?: TagSeverity;
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
}
