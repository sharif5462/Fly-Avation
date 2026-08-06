import { EntityConfig, EntityField } from '../models/entity-config.model';

const FIRST_NAMES = [
  'James', 'Maria', 'Liam', 'Fatima', 'Noah', 'Aisha', 'Oliver', 'Sofia', 'Elijah', 'Amara',
  'Lucas', 'Priya', 'Mason', 'Chen', 'Ethan', 'Yuki', 'Daniel', 'Elena', 'Henry', 'Layla'
];
const LAST_NAMES = [
  'Carter', 'Nguyen', 'Okafor', 'Rossi', 'Kowalski', 'Hussain', 'Silva', 'Tanaka', 'Novak', 'Reyes',
  'Whitfield', 'Salas', 'Cross', 'Blake', 'Morgan', 'Lindqvist', 'Haddad', 'Ferreira', 'Kim', 'Osei'
];
const AIRPORTS = ['JFK', 'LHR', 'DXB', 'SIN', 'CDG', 'FRA', 'HND', 'ORD', 'DFW', 'AMS', 'HKG', 'SYD', 'DEL', 'GRU', 'IST'];
const COMPANY_WORDS = ['Global', 'Sky', 'Atlas', 'Pacific', 'Meridian', 'Horizon', 'Summit', 'Vertex', 'Nordic', 'Continental'];
const COMPANY_SUFFIX = ['Aviation', 'Logistics', 'Aerospace', 'Supply Co.', 'Industries', 'Parts Ltd.', 'Systems', 'Group'];
const PLATE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
const AIRLINE_CODES = ['AV', 'BA', 'EK', 'LH', 'QR', 'SQ', 'AF', 'KL', 'TK', 'DL', 'UA', 'AA', 'CX', 'QF', 'EY'];
const EQUIPMENT_PREFIX = ['CNV', 'SRT', 'ATR', 'EDS', 'CAR', 'CHT', 'DCV', 'VLF'];
const ADJECTIVES = ['Primary', 'Standard', 'Express', 'Priority', 'Scheduled', 'Routine', 'Advanced', 'Regional'];
const NOUNS = ['Operation', 'Assignment', 'Record', 'Task', 'Order', 'Request', 'Entry', 'Case'];

let seedCounter = 1;
function rng(): number {
  // Deterministic-enough PRNG so a given app session feels stable while still varying per call.
  seedCounter += 1;
  const x = Math.sin(seedCounter * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function randomInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomDateIso(daysBack: number, daysForward: number): string {
  const now = Date.now();
  const offsetDays = randomInt(-daysBack, daysForward);
  return new Date(now + offsetDays * 86400000).toISOString();
}

function codePrefix(entityKey: string): string {
  return entityKey
    .split('-')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 3) || 'GEN';
}

function looksLike(field: EntityField, ...needles: string[]): boolean {
  const haystack = `${field.key} ${field.label}`.toLowerCase();
  return needles.some((n) => haystack.includes(n));
}

function generateFieldValue(field: EntityField, entityKey: string, rowIndex: number): unknown {
  if (field.options && field.options.length > 0) {
    return pick(field.options).value;
  }

  switch (field.type) {
    case 'boolean':
      return rng() > 0.5;
    case 'number': {
      const min = field.min ?? (looksLike(field, 'cost', 'amount', 'price', 'value') ? 100 : 1);
      const max = field.max ?? (looksLike(field, 'cost', 'amount', 'price', 'value') ? 50000 : 500);
      const val = randomInt(min, max);
      return looksLike(field, 'cost', 'amount', 'price') ? Number(val.toFixed(2)) : val;
    }
    case 'date':
      return randomDateIso(120, 60).slice(0, 10);
    case 'datetime':
      return randomDateIso(60, 30);
    case 'email': {
      const first = pick(FIRST_NAMES).toLowerCase();
      const last = pick(LAST_NAMES).toLowerCase();
      return `${first}.${last}@aviation-erp.test`;
    }
    case 'textarea':
      return `${pick(ADJECTIVES)} ${pick(NOUNS).toLowerCase()} logged for review; no further action required at this time.`;
    case 'text':
    default: {
      if (looksLike(field, 'email')) {
        return `${pick(FIRST_NAMES).toLowerCase()}.${pick(LAST_NAMES).toLowerCase()}@aviation-erp.test`;
      }
      if (looksLike(field, 'company') || (looksLike(field, 'name') && looksLike(field, 'vendor', 'supplier', 'customer', 'organization'))) {
        return `${pick(COMPANY_WORDS)} ${pick(COMPANY_SUFFIX)}`;
      }
      if (looksLike(field, 'plate')) {
        return `${pick(PLATE_LETTERS)}${pick(PLATE_LETTERS)}${pick(PLATE_LETTERS)}-${randomInt(1000, 9999)}`;
      }
      if (looksLike(field, 'name') || looksLike(field, 'employee', 'pilot', 'crew', 'engineer', 'officer', 'agent', 'contact', 'person')) {
        return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      }
      if (looksLike(field, 'airport', 'origin', 'destination', 'station', 'route')) {
        return pick(AIRPORTS);
      }
      if (looksLike(field, 'phone')) {
        return `+1-${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
      }
      // These three run before the generic code rule below, which would otherwise
      // stamp every *No./*Id field in a row with the same `<PREFIX>-<index>` value.
      if (looksLike(field, 'flight')) {
        return `${pick(AIRLINE_CODES)}${randomInt(100, 998)}`;
      }
      if (looksLike(field, 'tag')) {
        // IATA 10-digit baggage licence plate: leading 0 + 3-digit carrier code + 6 serial digits.
        return `0${String(randomInt(1, 999)).padStart(3, '0')}${String(randomInt(0, 999999)).padStart(6, '0')}`;
      }
      if (looksLike(field, 'equipment', 'machine')) {
        return `${pick(EQUIPMENT_PREFIX)}-${String(randomInt(1, 299)).padStart(3, '0')}`;
      }
      if (looksLike(field, 'no.', 'no', 'number', 'code', 'id', 'ref', 'reference', 'serial', 'registration')) {
        return `${codePrefix(entityKey)}-${String(1000 + rowIndex).slice(-4)}`;
      }
      if (looksLike(field, 'description', 'remarks', 'notes', 'summary')) {
        return `${pick(ADJECTIVES)} ${pick(NOUNS).toLowerCase()} — auto-generated demo record.`;
      }
      if (looksLike(field, 'location', 'warehouse', 'address', 'base')) {
        return `${pick(AIRPORTS)} — Hangar ${randomInt(1, 12)}`;
      }
      return `${pick(ADJECTIVES)} ${pick(NOUNS)} ${rowIndex + 1}`;
    }
  }
}

export function generateSeedRows(config: EntityConfig): Record<string, unknown>[] {
  const count = config.seedCount ?? 12;
  const rows: Record<string, unknown>[] = [];

  for (let i = 0; i < count; i++) {
    const row: Record<string, unknown> = {
      id: `${config.key}-${String(i + 1).padStart(4, '0')}`
    };
    for (const field of config.fields) {
      row[field.key] = generateFieldValue(field, config.key, i);
    }
    row['createdAt'] = randomDateIso(90, 0);
    rows.push(row);
  }
  return rows;
}
