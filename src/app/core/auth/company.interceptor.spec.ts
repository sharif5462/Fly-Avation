import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { companyInterceptor } from './company.interceptor';
import { CompanyContextService } from './company-context.service';
import { COMPANY_HEADER } from '../models/company.model';
import { environment } from '../../../environments/environment';

describe('companyInterceptor', () => {
  const activeCompanyId = signal<string | null>('cmp-1');
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    activeCompanyId.set('cmp-1');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([companyInterceptor])),
        provideHttpClientTesting(),
        { provide: CompanyContextService, useValue: { activeCompanyId } }
      ]
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('stamps API requests with the active company', () => {
    http.get(`${environment.apiUrl}/work-orders`).subscribe();

    const req = controller.expectOne(`${environment.apiUrl}/work-orders`);
    expect(req.request.headers.get(COMPANY_HEADER)).toBe('cmp-1');
    req.flush({ data: [], total: 0 });
  });

  it('leaves sign-in alone — no company is chosen yet', () => {
    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe();

    const req = controller.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.headers.has(COMPANY_HEADER)).toBe(false);
    req.flush({});
  });

  it('leaves forgot-password alone too', () => {
    const url = `${environment.apiUrl}/auth/forgot-password`;
    http.post(url, {}).subscribe();

    const req = controller.expectOne(url);
    expect(req.request.headers.has(COMPANY_HEADER)).toBe(false);
    req.flush({});
  });

  it('does not leak the company to non-API hosts', () => {
    http.get('/assets/config.json').subscribe();

    const req = controller.expectOne('/assets/config.json');
    expect(req.request.headers.has(COMPANY_HEADER)).toBe(false);
    req.flush({});
  });

  it('sends nothing while no company is active', () => {
    activeCompanyId.set(null);
    http.get(`${environment.apiUrl}/work-orders`).subscribe();

    const req = controller.expectOne(`${environment.apiUrl}/work-orders`);
    expect(req.request.headers.has(COMPANY_HEADER)).toBe(false);
    req.flush({ data: [], total: 0 });
  });

  it('follows a switch on the next request', () => {
    activeCompanyId.set('cmp-2');
    http.get(`${environment.apiUrl}/work-orders`).subscribe();

    const req = controller.expectOne(`${environment.apiUrl}/work-orders`);
    expect(req.request.headers.get(COMPANY_HEADER)).toBe('cmp-2');
    req.flush({ data: [], total: 0 });
  });
});
