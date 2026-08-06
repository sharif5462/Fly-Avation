import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ENTITY_CONFIGS } from '../data/entity-configs';
import { ALL_ROLES } from '../models/role.model';
import { generateSeedRows } from './fake-data';
import {
  seedAircraftRegistrations,
  seedAssetMaster,
  seedBaggageHandling,
  seedComponentTracking,
  seedFlights,
  seedHazardReports,
  seedItemMaster,
  seedPilots,
  seedPurchaseOrders,
  seedSpareParts,
  seedWorkOrders
} from './flagship-seeds';
import { loadCollection, saveCollection } from './mock-db';
import { createMockJwt } from './mock-jwt';
import { MOCK_CREDENTIALS, findCredential } from './mock-users';

type Row = Record<string, unknown> & { id: string };

/** Seed functions for resources that back a hand-built (flagship) page. */
const FLAGSHIP_SEEDS: Record<string, () => Row[]> = {
  'flight-scheduling': seedFlights as () => Row[],
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
  if (config) return generateSeedRows(config) as Row[];
  return [];
}

function getCollection(resource: string): Row[] {
  return loadCollection<Row>(resource, () => seedResource(resource));
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

function handleLogin(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
  if (!username || !password) {
    return errorResponse(req, 400, 'Username and password are required.');
  }
  const credential = findCredential(username, password);
  if (!credential) {
    return errorResponse(req, 401, 'Invalid username or password.');
  }
  const { token, expiresAt } = createMockJwt(credential.user);
  return jsonResponse(req, { token, expiresAt, user: credential.user });
}

function handleForgotPassword(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const { email } = (req.body ?? {}) as { email?: string };
  if (!email) {
    return errorResponse(req, 400, 'Email is required.');
  }
  // Deliberately always succeeds, whether or not the email matches an
  // account on file — a real API should do the same to avoid leaking which
  // emails are registered. See AuthService.forgotPassword() / README.md.
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
      return jsonResponse(req, buildListResult(rows, req.params));
    }
    case 'POST': {
      const body = (req.body ?? {}) as Record<string, unknown>;
      // Server-assigned fields go *after* the body spread. With the spread
      // last, a client that posted its own `id` overwrote the generated one
      // and could collide with — then, via PUT, overwrite — an existing row.
      // Identity and creation time belong to the server, as they will in the
      // real API.
      const newRow: Row = {
        ...body,
        id: `${resource}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString()
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

/**
 * Stands in for the .NET Web API while it doesn't exist yet. Every request
 * under environment.apiUrl is served here instead of hitting the network —
 * see README.md for the exact REST contract this mirrors, so swapping to
 * the real Oracle-backed API later is a one-line flag flip
 * (environment.useMockApi = false), not a rewrite.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMockApi || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const path = req.url.slice(environment.apiUrl.length).replace(/^\/+/, '');
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'auth' && segments[1] === 'login' && req.method === 'POST') {
    return handleLogin(req);
  }

  if (segments[0] === 'auth' && segments[1] === 'forgot-password' && req.method === 'POST') {
    return handleForgotPassword(req);
  }

  if (segments.length === 1 || segments.length === 2) {
    return handleResourceRequest(req, segments[0], segments[1]);
  }

  return errorResponse(req, 404, `No mock handler for ${req.method} ${req.url}`);
};
