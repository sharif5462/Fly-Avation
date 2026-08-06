import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { DashboardPage } from './dashboard';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

const SOURCES = [
  'flight-scheduling',
  'aircraft-registration',
  'work-orders',
  'spare-parts-inventory',
  'purchase-orders'
];

/**
 * The landing dashboard stands in for all eight: they share
 * createDashboardLoader, so the failure/retry contract verified here is the
 * same one the other seven get.
 */
describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let page: DashboardPage;
  let http: HttpTestingController;

  /**
   * Matched on the path only. The purchase-orders source carries paging and
   * sorting query parameters (it renders five rows, so it asks for five), and
   * a plain string matcher compares against the full URL including those.
   */
  function url(resource: string): string {
    return `${environment.apiUrl}/${resource}`;
  }

  /**
   * Answers every outstanding source request; `failing` gets a 500 instead.
   *
   * Successes are flushed first and failures last, because forkJoin
   * unsubscribes from its remaining sources the moment one errors — flushing
   * in declaration order would hit an already-cancelled request. Cancelled
   * requests are skipped for the same reason.
   */
  function flushSources(rows: Record<string, unknown[]> = {}, failing: string[] = []): void {
    const ordered = [...SOURCES.filter((r) => !failing.includes(r)), ...SOURCES.filter((r) => failing.includes(r))];

    for (const resource of ordered) {
      for (const req of http.match((r) => r.url === url(resource))) {
        if (req.cancelled) continue;
        if (failing.includes(resource)) {
          req.flush({ message: 'ORA-00942' }, { status: 500, statusText: 'Server Error' });
        } else {
          const data = rows[resource] ?? [];
          req.flush({ data, total: data.length });
        }
      }
    }
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: signal({ fullName: 'Alex Morgan', initials: 'AM', roles: [] }) }
        }
      ]
    });

    fixture = TestBed.createComponent(DashboardPage);
    page = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify({ ignoreCancelled: true }));

  it('requests every resource it renders', () => {
    for (const resource of SOURCES) {
      expect(http.match((r) => r.url === url(resource)).length).withContext(resource).toBe(1);
    }
    flushSources();
  });

  it('asks the API for only the purchase orders it displays', () => {
    // Regression guard: this panel used to fetch the entire purchase-order
    // table and slice five rows off the front.
    const req = http.expectOne((r) => r.url === url('purchase-orders'));
    expect(req.request.params.get('pageSize')).toBe('5');
    expect(req.request.params.get('sortField')).toBe('orderDate');
    expect(req.request.params.get('sortOrder')).toBe('desc');

    flushSources();
  });

  it('computes its KPIs once every source resolves', () => {
    flushSources({
      'flight-scheduling': [{ id: '1', status: 'In Air' }, { id: '2', status: 'Landed' }],
      'aircraft-registration': [{ id: 'a', currentStatus: 'Active' }, { id: 'b', currentStatus: 'Grounded' }],
      'work-orders': [{ id: 'w', status: 'Open', priority: 'Low' }],
      'spare-parts-inventory': [{ id: 's', status: 'Low Stock' }],
      'purchase-orders': []
    });

    expect(page.loading()).toBe(false);
    expect(page.loadFailed()).toBe(false);
    expect(page.stats().activeFlights).toBe(1);
    expect(page.stats().fleetAvailability).toBe(50);
    expect(page.stats().openWorkOrders).toBe(1);
    expect(page.stats().attentionParts).toBe(1);
  });

  describe('when a source fails', () => {
    it('stops loading instead of spinning forever', () => {
      flushSources({}, ['work-orders']);

      expect(page.loading()).toBe(false);
      expect(page.loadFailed()).toBe(true);
    });

    it('tells the user, with a way to retry', () => {
      flushSources({}, ['work-orders']);

      const banner: HTMLElement | null = fixture.nativeElement.querySelector('app-load-error');
      expect(banner).withContext('error banner should render').not.toBeNull();
      expect(banner!.getAttribute('role') ?? banner!.querySelector('[role="alert"]')).toBeTruthy();
      expect(banner!.textContent).toContain('Could not load');
      expect(banner!.querySelector('button')).not.toBeNull();
    });

    it('does not render a half-populated dashboard', () => {
      flushSources(
        { 'flight-scheduling': [{ id: '1', status: 'In Air' }] },
        ['work-orders']
      );

      // forkJoin gives all-or-nothing; showing the flights KPI while the work
      // order KPI silently reads zero would be worse than showing the error.
      expect(page.stats().activeFlights).toBe(0);
    });

    it('re-requests every source on retry and recovers', () => {
      flushSources({}, ['work-orders']);
      expect(page.loadFailed()).toBe(true);

      page.reload();
      fixture.detectChanges();
      expect(page.loading()).toBe(true);

      flushSources({ 'work-orders': [{ id: 'w', status: 'Open', priority: 'Critical' }] });

      expect(page.loadFailed()).toBe(false);
      expect(page.loading()).toBe(false);
      expect(page.stats().openWorkOrders).toBe(1);
      expect(fixture.nativeElement.querySelector('app-load-error')).toBeNull();
    });
  });

  it('abandons an in-flight load when the page is destroyed', () => {
    fixture.destroy();

    for (const resource of SOURCES) {
      for (const req of http.match((r) => r.url === url(resource))) {
        expect(req.cancelled).withContext(`${resource} should be cancelled`).toBe(true);
      }
    }
  });
});
