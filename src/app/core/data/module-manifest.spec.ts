import { MODULES, findModuleByItemKey, isRoutedUnderModule } from './module-manifest';
import { ENTITY_CONFIGS, getEntityConfig } from './entity-configs';
import { ALL_ROLES } from '../models/role.model';

/**
 * The manifest and the entity configs are two hand-maintained lists joined on
 * a string key, driving 424 routes between them. Nothing in the type system
 * connects them, so a typo in either file produces a nav entry that routes to
 * a blank page — and, because the scaffold renders "No entity configuration
 * found", it fails quietly rather than crashing.
 *
 * These specs are the join constraint. They are cheap and they run on every
 * change to either file.
 */
describe('module manifest ↔ entity configs', () => {
  const allItems = MODULES.flatMap((mod) => mod.items.map((item) => ({ mod, item })));
  const scaffoldItems = allItems.filter(({ item }) => !item.flagship);

  it('gives every non-flagship item an entity config to render', () => {
    const missing = scaffoldItems
      .filter(({ item }) => !ENTITY_CONFIGS[item.key])
      .map(({ mod, item }) => `${mod.key}/${item.key}`);

    expect(missing).toEqual([]);
  });

  it('has no entity config that nothing routes to', () => {
    const referenced = new Set(allItems.map(({ item }) => item.key));
    const orphans = Object.keys(ENTITY_CONFIGS).filter((key) => !referenced.has(key));

    expect(orphans).toEqual([]);
  });

  it('keys every entity config by its own key', () => {
    const mismatched = Object.entries(ENTITY_CONFIGS)
      .filter(([key, config]) => config.key !== key)
      .map(([key, config]) => `${key} → ${config.key}`);

    expect(mismatched).toEqual([]);
  });

  it('never repeats an item key inside one module', () => {
    // Repeats across modules are intentional — the same record seen from a
    // different desk. A repeat *within* a module would produce two routes on
    // the same path, and the second would be unreachable.
    const duplicates: string[] = [];
    for (const mod of MODULES) {
      const seen = new Set<string>();
      for (const item of mod.items) {
        if (seen.has(item.key)) duplicates.push(`${mod.key}/${item.key}`);
        seen.add(item.key);
      }
    }

    expect(duplicates).toEqual([]);
  });

  it('gives every module a key, label and icon', () => {
    const incomplete = MODULES.filter((mod) => !mod.key || !mod.label || !mod.icon).map((mod) => mod.key);
    expect(incomplete).toEqual([]);
  });

  it('gives every item a key, label and icon', () => {
    const incomplete = allItems
      .filter(({ item }) => !item.key || !item.label || !item.icon)
      .map(({ mod, item }) => `${mod.key}/${item.key}`);

    expect(incomplete).toEqual([]);
  });

  it('uses route-safe keys throughout', () => {
    const invalid = [...MODULES.map((m) => m.key), ...allItems.map(({ item }) => item.key)].filter(
      (key) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key)
    );

    expect(invalid).toEqual([]);
  });

  it('routes every manifest item under its module, bar the documented exception', () => {
    // BI's Dashboard is the only item deliberately not routed under its own
    // module — it lives at the top-level /dashboard so it is not gated by the
    // BI role. If a second exception is ever added, this spec should be the
    // thing that forces a decision about it rather than a page 404ing.
    const notRouted = allItems
      .filter(({ mod, item }) => !isRoutedUnderModule(mod.key, item.key))
      .map(({ mod, item }) => `${mod.key}/${item.key}`);

    expect(notRouted).toEqual(['business-intelligence/dashboard']);
  });

  it('keeps every module inside the role vocabulary', () => {
    const declared = new Set(ALL_ROLES);
    const unknown = MODULES.filter((mod) => mod.role && !declared.has(mod.role)).map((mod) => `${mod.key} -> ${mod.role}`);

    expect(unknown).toEqual([]);
  });

  it('finds the owning module for any item key', () => {
    expect(findModuleByItemKey('work-orders')?.key).toBe('aircraft-maintenance');
    expect(findModuleByItemKey('no-such-item')).toBeUndefined();
  });

  it('resolves a known entity config and returns undefined for an unknown one', () => {
    expect(getEntityConfig('route-planning')).toBeDefined();
    expect(getEntityConfig('no-such-entity')).toBeUndefined();
  });
});

describe('entity configs', () => {
  const configs = Object.entries(ENTITY_CONFIGS);

  it('gives every config at least one field', () => {
    expect(configs.filter(([, config]) => config.fields.length === 0).map(([key]) => key)).toEqual([]);
  });

  it('never repeats a field key within a config', () => {
    const duplicates: string[] = [];
    for (const [key, config] of configs) {
      const seen = new Set<string>();
      for (const field of config.fields) {
        if (seen.has(field.key)) duplicates.push(`${key}.${field.key}`);
        seen.add(field.key);
      }
    }

    expect(duplicates).toEqual([]);
  });

  it('never declares a field required and then hides it from the form', () => {
    // The form would be permanently invalid with no control to fix it, so
    // Save would silently do nothing.
    const unsatisfiable = configs.flatMap(([key, config]) =>
      config.fields.filter((f) => f.required && f.hideInForm).map((f) => `${key}.${f.key}`)
    );

    expect(unsatisfiable).toEqual([]);
  });

  it('leaves at least one visible table column per config', () => {
    const headless = configs
      .filter(([, config]) => config.fields.every((f) => f.hideInTable))
      .map(([key]) => key);

    expect(headless).toEqual([]);
  });

  it('gives every select field options to choose from', () => {
    const empty = configs.flatMap(([key, config]) =>
      config.fields.filter((f) => f.type === 'select' && !f.options?.length).map((f) => `${key}.${f.key}`)
    );

    expect(empty).toEqual([]);
  });

  it('gives every badge column options to derive its severity from', () => {
    const empty = configs.flatMap(([key, config]) =>
      config.fields.filter((f) => f.badge && !f.options?.length).map((f) => `${key}.${f.key}`)
    );

    expect(empty).toEqual([]);
  });

  it('does not declare an "id" field, which the API owns', () => {
    const shadowed = configs
      .filter(([, config]) => config.fields.some((f) => f.key === 'id'))
      .map(([key]) => key);

    expect(shadowed).toEqual([]);
  });

  it('keeps min below max wherever both are set', () => {
    const inverted = configs.flatMap(([key, config]) =>
      config.fields
        .filter((f) => f.min != null && f.max != null && f.min > f.max)
        .map((f) => `${key}.${f.key}`)
    );

    expect(inverted).toEqual([]);
  });

  it('gives every config the labels the page header renders', () => {
    const incomplete = configs
      .filter(([, config]) => !config.label || !config.pluralLabel || !config.icon)
      .map(([key]) => key);

    expect(incomplete).toEqual([]);
  });
});
