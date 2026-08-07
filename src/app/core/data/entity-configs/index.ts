import { EntityConfig } from '../../models/entity-config.model';
import { CORE_MODULE_ENTITIES } from './core-modules';
import { EXTENDED_MODULE_ENTITIES } from './extended-modules';

/**
 * Field/table/form configuration for every *generic* (non-flagship) sub-item
 * in module-manifest.ts, keyed by that item's route key. Consumed by
 * shared/scaffold/feature-list-page, which renders a complete CRUD screen —
 * table columns, add/edit dialog, validation — from the config alone.
 *
 * Split by domain rather than kept in one file: the original 25 modules'
 * entities are in `core-modules.ts`, everything added since in
 * `extended-modules.ts`. Both use the same builders, and both are merged here
 * so the rest of the app sees one flat lookup.
 *
 * A key appearing in more than one module is deliberate and means *one*
 * record type viewed from several desks — Incident Reporting is the same
 * register whether it is reached from Compliance, SMS, Facilities or
 * Security. One key, one config, one table. Define it once, in whichever
 * file owns it, and simply reference the key from the other modules'
 * manifest entries.
 */
const ALL_ENTITIES: EntityConfig[] = [...CORE_MODULE_ENTITIES, ...EXTENDED_MODULE_ENTITIES];

export const ENTITY_CONFIGS: Record<string, EntityConfig> = Object.fromEntries(
  ALL_ENTITIES.map((e) => [e.key, e])
);

export function getEntityConfig(key: string): EntityConfig | undefined {
  return ENTITY_CONFIGS[key];
}
