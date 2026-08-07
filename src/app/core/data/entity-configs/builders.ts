import { EntityConfig, EntityField, FieldType, TagSeverity } from '../../models/entity-config.model';

/**
 * Terse builders for the entity configs that drive the generic CRUD scaffold.
 *
 * Extracted so the config lists can be split across files by domain without
 * each one re-declaring them — `core-modules.ts` holds the original 25
 * modules' entities, `extended-modules.ts` the ones added later.
 */

/**
 * A field. **Required by default** — override with `{ required: false }` for
 * anything a user should be able to leave blank (notes, remarks, secondary
 * dates). That flag is not just form validation: it is the specification the
 * database's NOT NULL constraints are generated from, so a field marked
 * required here becomes a column a record cannot be saved without.
 */
export function f(key: string, label: string, type: FieldType = 'text', extra: Partial<EntityField> = {}): EntityField {
  return { key, label, type, required: true, ...extra };
}

/** Free-text that should not block saving a record — notes, findings, remarks. */
export function optional(key: string, label: string, type: FieldType = 'text', extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, type, { required: false, ...extra });
}

export function num(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'number', extra);
}

export function money(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'number', { prefix: '$', min: 0, ...extra });
}

/** A calendar day — becomes a DATE column, never a timestamp. See ADR 0001. */
export function date(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'date', extra);
}

/** A moment in time — becomes TIMESTAMP WITH TIME ZONE. See ADR 0001. */
export function datetime(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'datetime', extra);
}

export function textarea(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'textarea', extra);
}

export function statusField(pairs: [string, TagSeverity][], key = 'status', label = 'Status'): EntityField {
  return {
    key,
    label,
    type: 'select',
    required: true,
    badge: true,
    options: pairs.map(([value, severity]) => ({ label: value, value, severity }))
  };
}

/** A plain single-select with no badge colouring. */
export function choice(key: string, label: string, values: string[], extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'select', {
    options: values.map((value) => ({ label: value, value })),
    ...extra
  });
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
