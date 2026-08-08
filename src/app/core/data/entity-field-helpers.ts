import { EntityConfig, EntityField, FieldType, TagSeverity } from '../models/entity-config.model';

/**
 * Shorthand builders for the entity/field configs consumed by
 * shared/scaffold/feature-list-page. Shared by entity-configs.ts and
 * entity-configs-extended.ts so both halves of the catalogue declare
 * columns the same way.
 */

export function f(key: string, label: string, type: FieldType = 'text', extra: Partial<EntityField> = {}): EntityField {
  return { key, label, type, required: true, ...extra };
}

export function num(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'number', extra);
}

export function money(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'number', { prefix: '$', min: 0, ...extra });
}

export function date(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'date', extra);
}

export function datetime(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'datetime', extra);
}

/** A select rendered as a colored p-tag in the table — the usual "Status" column. */
export function statusField(pairs: Array<[string, TagSeverity]>, key = 'status', label = 'Status'): EntityField {
  return {
    key,
    label,
    type: 'select',
    required: true,
    badge: true,
    options: pairs.map(([value, severity]) => ({ label: value, value, severity }))
  };
}

/** A plain select whose values carry no severity colour. */
export function choice(key: string, label: string, values: string[], extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'select', { options: values.map((v) => ({ label: v, value: v })), ...extra });
}

export function entity(
  key: string,
  label: string,
  pluralLabel: string,
  icon: string,
  description: string,
  fields: EntityField[],
  seedCount = 10
): EntityConfig {
  return { key, label, pluralLabel, icon, description, fields, seedCount };
}
