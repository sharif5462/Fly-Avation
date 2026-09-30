import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';

import { USER_STORAGE_KEY } from '../auth/storage-keys';
import { environment } from '../../../environments/environment';
import { ENTITY_CONFIGS } from '../data/entity-configs';
import { ALL_ROLES } from '../models/role.model';
import { SignupRequest, User, UserStatus } from '../models/user.model';
import { generateSeedRows } from './fake-data';
import {
  seedAircraftAssignments,
  seedAircraftRegistrations,
  seedAssetMaster,
  seedBaggageHandling,
  seedComponentTracking,
  seedCrewAssignments,
  seedFlightDispatch,
  seedFlights,
  seedHazardReports,
  seedItemMaster,
  seedPilots,
  seedPurchaseOrders,
  seedRoutePlanning,
  seedSpareParts,
  seedWorkOrders
} from './flagship-seeds';
import { loadCollection, saveCollection } from './mock-db';
import { createMockJwt } from './mock-jwt';
import { MOCK_CREDENTIALS, findCredential } from './mock-users';

type Row = Record<string, unknown> & { id: string };

const FLAGSHIP_SEEDS: Record<string, () => Row[]> = {
  'flight-scheduling': seedFlights as () => Row[],
  'route-planning': seedRoutePlanning as () => Row[],
  'flight-dispatch': seedFlightDispatch as () => Row[],
  'aircraft-assignment': seedAircraftAssignments as () => Row[],
  'crew-assignment': seedCrewAssignments as () => Row[],
  'aircraft-registration': seedAircraftRegistrations as () => Row[],
  'work-orders': seedWorkOrders as () => Row[],
  'component-tracking': seedComponentTracking as () => Row[],
  'baggage-handling': seedBaggageHandling as () => Row[],
  'pilot-management': seedPilots as () => Row[],
  'spare-parts-inventory': seedSpareParts as () => Row[],
  'purchase-orders': seedPurchaseOrders as () => Row[],
  'item-master': seedItemMaster as () => Row[],
  'asset-master': seedAssetMaster as () => Row[],
  'hazard-reporting': seedHazardReports as () => Row[],
  users: () => MOCK_CREDENTIALS.map((c) => ({ ...c.user }) as unknown as Row),
  'role-permissions': () => ALL_ROLES.map((role) => ({ id: role, role, extraModules: [] as string[] }) as unknown as Row)
};

function seedResource(resource: string): Row[] {
  if (FLAGSHIP_SEEDS[resource]) return FLAGSHIP_SEEDS[resource]();
  const config = ENTITY_CONFIGS[resource];
  if (config) return generateSeedRows(config, (lookupKey) => getCollection(lookupKey)) as Row[];
  return [];
}

function getCollection(resource: string): Row[] {
  return loadCollection<Row>(resource, () => seedResource(resource));
}

function currentUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function resolveScopeValue(resource: string, scopeField: string, row: Row): string | undefined {
  const field = ENTITY_CONFIGS[resource]?.fields.find((fld) => fld.key === scopeField);
  const raw = row[scopeField];
  if (field?.type === 'lookup' && field.lookupEntity && raw != null) {
    const refRow = getCollection(field.lookupEntity).find((r) => r['id'] === raw);
    const labelField = field.lookupLabelField;
    return refRow && labelField ? (refRow[labelField] as string) : undefined;
  }
  return raw as string | undefined;
}

export function applyScopeFilter(resource: string, rows: Row[]): Row[] {
  const scopeField = ENTITY_CONFIGS[resource]?.scopeField;
  if (!scopeField) return rows;

  const user = currentUser();
  const scope = user?.stationScope;
  if (!scope || scope.length === 0) return rows;
  if (user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Admin')) return rows;

  return rows.filter((r) => {
    const value = resolveScopeValue(resource, scopeField, r);
    return value != null && scope.includes(value);
  });
}

function jsonResponse(req: HttpRequest<unknown>, body: unknown, status = 200): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status, body, url: req.url })).pipe(delay(environment.mockLatencyMs));
}

function errorResponse(req: HttpRequest<unknown>, status: number, message: string): Observable<HttpEvent<unknown>> {
  return throwError(() => new HttpErrorResponse({ status, error: { message }, url: req.url, statusText: message })).pipe(
    delay(environment.mockLatencyMs)
  );
}

function buildListResult(rows: Row[], params: HttpParams): { data: Row[]; total: number } {
  let result = [...rows];

  const search = params.get('search')?.trim().toLowerCase();
  if (search) {
    result = result.filter((row) =>
      Object.values(row).some((v) => v !== null && v !== undefined && String(v).toLowerCase().includes(search))
    );
  }

  const sortField = params.get('sortField');
  if (sortField) {
    const dir = params.get('sortOrder') === 'desc' ? -1 : 1;
    result = [...result].sort((a, b) => {
      const av = a[sortField] as string | number | undefined;
      const bv = b[sortField] as string | number | undefined;
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * dir;
      if (bv == null) return 1 * dir;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  const total = result.length;
  const pageSize = Number(params.get('pageSize') ?? 0);
  if (pageSize > 0) {
    const page = Number(params.get('page') ?? 0);
    const start = page * pageSize;
    result = result.slice(start, start + pageSize);
  }

  return { data: result, total };
}

const CREDENTIALS_RESOURCE = 'auth-credentials';
const SIGNUP_AVATAR_COLORS = ['#134bd1', '#7c3aed', '#0891b2', '#c2410c', '#be185d', '#15803d', '#a16207', '#4338ca', '#334155', '#0d9488'];

function initialsOf(fullName: string): string {
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
  return initials || '?';
}

function findUserRowByUsername(username: string): Row | undefined {
  return getCollection('users').find((r) => String(r['username']).toLowerCase() === username.trim().toLowerCase());
}

function findCredentialRow(username: string): Row | undefined {
  return getCollection(CREDENTIALS_RESOURCE).find(
    (r) => String(r['username']).toLowerCase() === username.trim().toLowerCase()
  );
}

function handleLogin(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
  if (!username || !password) {
    return errorResponse(req, 400, 'Username and password are required.');
  }

  const demoCredential = findCredential(username, password);
  if (demoCredential) {
    const { token, expiresAt } = createMockJwt(demoCredential.user);
    return jsonResponse(req, { token, expiresAt, user: demoCredential.user });
  }

  const userRow = findUserRowByUsername(username);
  const credentialRow = findCredentialRow(username);
  if (!userRow || !credentialRow || credentialRow['password'] !== password) {
    return errorResponse(req, 401, 'Invalid username or password.');
  }

  const status = userRow['status'] as UserStatus;
  if (status === 'Pending') {
    return errorResponse(
      req,
      401,
      'Your account is awaiting admin approval. You will be able to sign in once an administrator approves your request.'
    );
  }
  if (status === 'Rejected') {
    return errorResponse(req, 401, 'Your sign-up request was not approved. Please contact your administrator.');
  }

  const user = userRow as unknown as User;
  const { token, expiresAt } = createMockJwt(user);
  return jsonResponse(req, { token, expiresAt, user });
}

function handleRegister(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const body = (req.body ?? {}) as Partial<SignupRequest>;
  const fullName = body.fullName?.trim();
  const username = body.username?.trim();
  const email = body.email?.trim();
  const jobTitle = body.jobTitle?.trim();
  const password = body.password;

  if (!fullName || !username || !email || !jobTitle || !password) {
    return errorResponse(req, 400, 'Full name, username, email, job title and password are all required.');
  }

  const usernameTaken =
    MOCK_CREDENTIALS.some((c) => c.user.username.toLowerCase() === username.toLowerCase()) || !!findUserRowByUsername(username);
  if (usernameTaken) {
    return errorResponse(req, 409, 'That username is already taken.');
  }

  const emailLower = email.toLowerCase();
  const emailTaken =
    MOCK_CREDENTIALS.some((c) => c.user.email.toLowerCase() === emailLower) ||
    getCollection('users').some((r) => String(r['email']).toLowerCase() === emailLower);
  if (emailTaken) {
    return errorResponse(req, 409, 'An account with that email already exists.');
  }

  const newUser: Row = {
    id: `usr-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    username,
    fullName,
    email,
    jobTitle,
    roles: [],
    status: 'Pending' satisfies UserStatus,
    avatarColor: SIGNUP_AVATAR_COLORS[Math.floor(Math.random() * SIGNUP_AVATAR_COLORS.length)],
    initials: initialsOf(fullName),
    createdAt: new Date().toISOString()
  };
  saveCollection('users', [newUser, ...getCollection('users')]);
  saveCollection(CREDENTIALS_RESOURCE, [{ id: username, username, password }, ...getCollection(CREDENTIALS_RESOURCE)]);

  return jsonResponse(req, { success: true }, 201);
}

function handleForgotPassword(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const { email } = (req.body ?? {}) as { email?: string };
  if (!email) {
    return errorResponse(req, 400, 'Email is required.');
  }

  return jsonResponse(req, { success: true });
}

function handleResourceRequest(req: HttpRequest<unknown>, resource: string, id?: string): Observable<HttpEvent<unknown>> {
  const rows = getCollection(resource);

  switch (req.method) {
    case 'GET': {
      if (id) {
        const row = rows.find((r) => r['id'] === id);
        return row ? jsonResponse(req, row) : errorResponse(req, 404, `${resource} '${id}' not found.`);
      }
      return jsonResponse(req, buildListResult(applyScopeFilter(resource, rows), req.params));
    }
    case 'POST': {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const newRow: Row = {
        id: `${resource}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        ...body
      };
      saveCollection(resource, [newRow, ...rows]);
      return jsonResponse(req, newRow, 201);
    }
    case 'PUT':
    case 'PATCH': {
      if (!id) return errorResponse(req, 400, 'Missing id for update.');
      const idx = rows.findIndex((r) => r['id'] === id);
      if (idx === -1) return errorResponse(req, 404, `${resource} '${id}' not found.`);
      const body = (req.body ?? {}) as Record<string, unknown>;
      const updated: Row = { ...rows[idx], ...body, id };
      const next = [...rows];
      next[idx] = updated;
      saveCollection(resource, next);
      return jsonResponse(req, updated);
    }
    case 'DELETE': {
      if (!id) return errorResponse(req, 400, 'Missing id for delete.');
      if (!rows.some((r) => r['id'] === id)) {
        return errorResponse(req, 404, `${resource} '${id}' not found.`);
      }
      saveCollection(resource, rows.filter((r) => r['id'] !== id));
      return jsonResponse(req, { success: true });
    }
    default:
      return errorResponse(req, 405, `Method ${req.method} not supported by the mock API.`);
  }
}

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMockApi || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const path = req.url.slice(environment.apiUrl.length).replace(/^\/+/, '');
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'auth' && segments[1] === 'login' && req.method === 'POST') {
    return handleLogin(req);
  }

  if (segments[0] === 'auth' && segments[1] === 'register' && req.method === 'POST') {
    return handleRegister(req);
  }

  if (segments[0] === 'auth' && segments[1] === 'forgot-password' && req.method === 'POST') {
    return handleForgotPassword(req);
  }

  if (segments.length === 1 || segments.length === 2) {
    return handleResourceRequest(req, segments[0], segments[1]);
  }

  return errorResponse(req, 404, `No mock handler for ${req.method} ${req.url}`);
};
