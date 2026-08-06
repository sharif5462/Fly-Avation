import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

const RESOURCE = 'purchase-orders';
const BASE = `${environment.apiUrl}/${RESOURCE}`;

/**
 * ApiService is the single place that knows how request URLs are built, so
 * these specs pin the exact wire format the .NET Web API has to accept —
 * including the query parameters that let a caller ask for a slice instead of
 * downloading a whole Oracle table to `.slice()` five rows off the front.
 */
describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('list', () => {
    it('GETs the collection with no query string when no options are given', () => {
      api.list(RESOURCE).subscribe();

      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.urlWithParams).toBe(BASE);
    });

    it('sends paging, sorting and search as query parameters', () => {
      api.list(RESOURCE, { search: 'atlas', sortField: 'orderDate', sortOrder: 'desc', page: 2, pageSize: 25 }).subscribe();

      const req = http.expectOne((r) => r.url === BASE);
      expect(req.request.params.get('search')).toBe('atlas');
      expect(req.request.params.get('sortField')).toBe('orderDate');
      expect(req.request.params.get('sortOrder')).toBe('desc');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('25');
    });

    it('omits options that were not set, rather than sending them empty', () => {
      api.list(RESOURCE, { pageSize: 5 }).subscribe();

      // `?search=` is a filter for an empty string, which is not the same as
      // "no filter" — an API is entitled to treat them differently.
      const req = http.expectOne((r) => r.url === BASE);
      expect(req.request.params.has('search')).toBe(false);
      expect(req.request.params.has('sortField')).toBe(false);
      expect(req.request.params.get('pageSize')).toBe('5');
    });

    it('sends page 0 — a falsy value that still means something', () => {
      api.list(RESOURCE, { page: 0, pageSize: 5 }).subscribe();

      const req = http.expectOne((r) => r.url === BASE);
      expect(req.request.params.get('page')).toBe('0');
    });

    it('drops an empty-string search so it is not mistaken for a filter', () => {
      api.list(RESOURCE, { search: '' }).subscribe();

      const req = http.expectOne(BASE);
      expect(req.request.urlWithParams).toBe(BASE);
    });

    it('returns the { data, total } envelope unchanged', () => {
      let result: { data: unknown[]; total: number } | undefined;
      api.list<{ id: string }>(RESOURCE).subscribe((r) => (result = r));

      http.expectOne(BASE).flush({ data: [{ id: '1' }], total: 97 });

      // `total` is the pre-paging count, which is what a paginator needs.
      expect(result).toEqual({ data: [{ id: '1' }], total: 97 });
    });
  });

  describe('single-resource operations', () => {
    it('GETs by id', () => {
      api.getById(RESOURCE, 'po-1').subscribe();
      expect(http.expectOne(`${BASE}/po-1`).request.method).toBe('GET');
    });

    it('POSTs to the collection', () => {
      api.create(RESOURCE, { poNumber: 'PO-1' }).subscribe();

      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ poNumber: 'PO-1' });
    });

    it('PUTs to the item', () => {
      api.update(RESOURCE, 'po-1', { poNumber: 'PO-2' }).subscribe();

      const req = http.expectOne(`${BASE}/po-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ poNumber: 'PO-2' });
    });

    it('DELETEs the item', () => {
      api.remove(RESOURCE, 'po-1').subscribe();
      expect(http.expectOne(`${BASE}/po-1`).request.method).toBe('DELETE');
    });

    it('encodes the resource and id into the path in that order', () => {
      api.getById('flight-scheduling', 'flt-9').subscribe();
      http.expectOne(`${environment.apiUrl}/flight-scheduling/flt-9`).flush({});
    });
  });
});
