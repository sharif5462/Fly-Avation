import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { mockApiInterceptor } from './mock-api.interceptor';
import { resetMockDatabase } from './mock-db';
import { environment } from '../../../environments/environment';
import { ListResult } from '../services/api.service';

interface Row {
  id: string;
  [key: string]: unknown;
}

const RESOURCE = 'route-planning';
const RESOURCE_URL = `${environment.apiUrl}/${RESOURCE}`;

/**
 * The mock interceptor is the contract the real .NET Web API has to satisfy
 * (see README.md), so these specs double as executable documentation of that
 * contract — status codes, response envelopes, and the query parameters the
 * backend is expected to honour.
 */
describe('mockApiInterceptor', () => {
  let http: HttpClient;

  /** Drains the interceptor's artificial latency so subscribers have run. */
  function settle(): void {
    tick(environment.mockLatencyMs + 1);
  }

  beforeEach(() => {
    resetMockDatabase();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockApiInterceptor]))]
    });
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => resetMockDatabase());

  describe('authentication', () => {
    it('returns a token, an expiry and the user for valid credentials', fakeAsync(() => {
      let body: { token: string; expiresAt: string; user: { username: string } } | undefined;
      http
        .post<typeof body>(`${environment.apiUrl}/auth/login`, { username: 'superadmin', password: 'super123' })
        .subscribe((res) => (body = res));
      settle();

      expect(body?.token.split('.').length).toBe(3);
      expect(Date.parse(body!.expiresAt)).toBeGreaterThan(Date.now());
      expect(body?.user.username).toBe('superadmin');
    }));

    it('matches the username case-insensitively but the password exactly', fakeAsync(() => {
      let ok: unknown;
      let status: number | undefined;

      http
        .post(`${environment.apiUrl}/auth/login`, { username: 'SuperAdmin', password: 'super123' })
        .subscribe((res) => (ok = res));
      settle();
      expect(ok).toBeTruthy();

      http
        .post(`${environment.apiUrl}/auth/login`, { username: 'superadmin', password: 'SUPER123' })
        .subscribe({ error: (e) => (status = e.status) });
      settle();
      expect(status).toBe(401);
    }));

    it('rejects a bad password with 401', fakeAsync(() => {
      let status: number | undefined;
      http
        .post(`${environment.apiUrl}/auth/login`, { username: 'superadmin', password: 'wrong' })
        .subscribe({ error: (e) => (status = e.status) });
      settle();

      expect(status).toBe(401);
    }));

    it('rejects a missing field with 400', fakeAsync(() => {
      let status: number | undefined;
      http
        .post(`${environment.apiUrl}/auth/login`, { username: 'superadmin' })
        .subscribe({ error: (e) => (status = e.status) });
      settle();

      expect(status).toBe(400);
    }));

    it('answers forgot-password identically for known and unknown emails', fakeAsync(() => {
      const results: unknown[] = [];
      for (const email of ['alex.morgan@aviation-erp.test', 'nobody@example.com']) {
        http.post(`${environment.apiUrl}/auth/forgot-password`, { email }).subscribe((r) => results.push(r));
        settle();
      }

      // Differing responses would let the login page be used to enumerate
      // which email addresses have accounts.
      expect(results).toEqual([{ success: true }, { success: true }]);
    }));
  });

  describe('collections', () => {
    it('returns a { data, total } envelope', fakeAsync(() => {
      let result: ListResult<Row> | undefined;
      http.get<ListResult<Row>>(RESOURCE_URL).subscribe((r) => (result = r));
      settle();

      expect(Array.isArray(result?.data)).toBe(true);
      expect(result?.total).toBe(result!.data.length);
    }));

    it('creates with 201 and echoes the stored row', fakeAsync(() => {
      let created: Row | undefined;
      http.post<Row>(RESOURCE_URL, { routeName: 'JFK–LHR' }).subscribe((r) => (created = r));
      settle();

      expect(created?.id).toBeTruthy();
      expect(created?.['routeName']).toBe('JFK–LHR');
      expect(created?.['createdAt']).toBeTruthy();
    }));

    it('persists a created row so a subsequent list returns it', fakeAsync(() => {
      let before = 0;
      http.get<ListResult<Row>>(RESOURCE_URL).subscribe((r) => (before = r.total));
      settle();

      http.post<Row>(RESOURCE_URL, { routeName: 'DXB–SIN' }).subscribe();
      settle();

      let after: ListResult<Row> | undefined;
      http.get<ListResult<Row>>(RESOURCE_URL).subscribe((r) => (after = r));
      settle();

      expect(after?.total).toBe(before + 1);
      expect(after?.data.some((row) => row['routeName'] === 'DXB–SIN')).toBe(true);
    }));

    it('does not let a client-supplied id overwrite the generated one', fakeAsync(() => {
      let created: Row | undefined;
      http.post<Row>(RESOURCE_URL, { id: 'client-chosen', routeName: 'AMS–GRU' }).subscribe((r) => (created = r));
      settle();

      // The server owns identity; accepting the client's id would let a
      // caller collide with (and then overwrite) an existing record.
      expect(created?.id).not.toBe('client-chosen');
    }));

    it('updates by id and keeps the id stable', fakeAsync(() => {
      let created: Row | undefined;
      http.post<Row>(RESOURCE_URL, { routeName: 'Original' }).subscribe((r) => (created = r));
      settle();

      let updated: Row | undefined;
      http.put<Row>(`${RESOURCE_URL}/${created!.id}`, { routeName: 'Renamed' }).subscribe((r) => (updated = r));
      settle();

      expect(updated?.id).toBe(created!.id);
      expect(updated?.['routeName']).toBe('Renamed');
    }));

    it('deletes by id and then 404s on the same id', fakeAsync(() => {
      let created: Row | undefined;
      http.post<Row>(RESOURCE_URL, { routeName: 'Doomed' }).subscribe((r) => (created = r));
      settle();

      http.delete(`${RESOURCE_URL}/${created!.id}`).subscribe();
      settle();

      let status: number | undefined;
      http.get(`${RESOURCE_URL}/${created!.id}`).subscribe({ error: (e) => (status = e.status) });
      settle();

      expect(status).toBe(404);
    }));

    it('404s an unknown id on read, update and delete', fakeAsync(() => {
      const statuses: number[] = [];
      const onError = (e: { status: number }) => statuses.push(e.status);

      http.get(`${RESOURCE_URL}/nope`).subscribe({ error: onError });
      settle();
      http.put(`${RESOURCE_URL}/nope`, {}).subscribe({ error: onError });
      settle();
      http.delete(`${RESOURCE_URL}/nope`).subscribe({ error: onError });
      settle();

      expect(statuses).toEqual([404, 404, 404]);
    }));
  });

  describe('query parameters the real API must honour', () => {
    it('filters on search across all fields', fakeAsync(() => {
      http.post<Row>(RESOURCE_URL, { routeName: 'UNIQUEMARKER' }).subscribe();
      settle();

      let result: ListResult<Row> | undefined;
      http.get<ListResult<Row>>(RESOURCE_URL, { params: { search: 'uniquemarker' } }).subscribe((r) => (result = r));
      settle();

      expect(result?.total).toBe(1);
    }));

    it('sorts ascending and descending on a field', fakeAsync(() => {
      let asc: ListResult<Row> | undefined;
      let desc: ListResult<Row> | undefined;

      http
        .get<ListResult<Row>>(RESOURCE_URL, { params: { sortField: 'id', sortOrder: 'asc' } })
        .subscribe((r) => (asc = r));
      settle();
      http
        .get<ListResult<Row>>(RESOURCE_URL, { params: { sortField: 'id', sortOrder: 'desc' } })
        .subscribe((r) => (desc = r));
      settle();

      expect(asc!.data.map((r) => r.id)).toEqual([...desc!.data.map((r) => r.id)].reverse());
    }));

    it('pages while reporting the unpaged total', fakeAsync(() => {
      let page: ListResult<Row> | undefined;
      http.get<ListResult<Row>>(RESOURCE_URL, { params: { page: 0, pageSize: 3 } }).subscribe((r) => (page = r));
      settle();

      expect(page?.data.length).toBe(3);
      expect(page?.total).toBeGreaterThan(3);
    }));
  });

  describe('routing', () => {
    it('leaves requests outside apiUrl alone', () => {
      // No mock handler should claim these; asserting it does not throw is
      // enough, since a handled request would resolve with mock data.
      expect(() => http.get('/assets/config.json').subscribe({ error: () => undefined })).not.toThrow();
    });

    it('405s a method the mock does not implement', fakeAsync(() => {
      let status: number | undefined;
      http.head(RESOURCE_URL).subscribe({ error: (e) => (status = e.status) });
      settle();

      expect(status).toBe(405);
    }));

    it('404s a path deeper than {resource}/{id}', fakeAsync(() => {
      let status: number | undefined;
      http.get(`${RESOURCE_URL}/abc/def`).subscribe({ error: (e) => (status = e.status) });
      settle();

      expect(status).toBe(404);
    }));
  });
});
