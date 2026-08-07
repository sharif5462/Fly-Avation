import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';

import { RecentScreensService } from './recent-screens.service';
import { ScreenEntry, ScreenSearchService } from './screen-search.service';
import { AuthService } from '../auth/auth.service';

const SCREENS: ScreenEntry[] = [
  { path: '/procurement/purchase-orders', label: 'Purchase Orders', moduleLabel: 'Procurement', moduleKey: 'procurement', icon: 'pi-cart' },
  { path: '/procurement/rfq', label: 'RFQ', moduleLabel: 'Procurement', moduleKey: 'procurement', icon: 'pi-file' },
  { path: '/crm/call-center', label: 'Call Center', moduleLabel: 'CRM', moduleKey: 'crm', icon: 'pi-phone' }
];

describe('RecentScreensService', () => {
  const user = signal<{ id: string } | null>({ id: 'usr-1' });
  const screens = signal<ScreenEntry[]>(SCREENS);

  function createService(): RecentScreensService {
    const service = TestBed.inject(RecentScreensService);
    TestBed.tick();
    return service;
  }

  beforeEach(() => {
    localStorage.clear();
    user.set({ id: 'usr-1' });
    screens.set(SCREENS);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user } },
        { provide: ScreenSearchService, useValue: { screens } }
      ]
    });
  });

  afterEach(() => localStorage.clear());

  it('starts empty', () => {
    expect(createService().recent()).toEqual([]);
  });

  it('records a visited screen', () => {
    const service = createService();
    service.record('/procurement/purchase-orders');

    expect(service.recent().map((s) => s.label)).toEqual(['Purchase Orders']);
  });

  it('puts the most recent first', () => {
    const service = createService();
    service.record('/procurement/purchase-orders');
    service.record('/crm/call-center');

    expect(service.recent().map((s) => s.label)).toEqual(['Call Center', 'Purchase Orders']);
  });

  it('moves a revisited screen back to the front without duplicating it', () => {
    const service = createService();
    service.record('/procurement/purchase-orders');
    service.record('/crm/call-center');
    service.record('/procurement/purchase-orders');

    expect(service.recent().map((s) => s.label)).toEqual(['Purchase Orders', 'Call Center']);
  });

  it('ignores paths that are not module screens', () => {
    const service = createService();
    // /dashboard, /403 and /login are reachable without help and would crowd
    // out the entries that are actually worth re-opening.
    service.record('/dashboard');
    service.record('/403');
    service.record('/procurement/rfq/extra/segment');

    expect(service.recent()).toEqual([]);
  });

  it('drops a screen the user can no longer reach', () => {
    const service = createService();
    service.record('/crm/call-center');
    expect(service.recent().length).toBe(1);

    // Access revoked, or the item removed from the manifest.
    screens.set(SCREENS.filter((s) => s.moduleKey !== 'crm'));

    expect(service.recent()).toEqual([]);
  });

  it('survives a reload', () => {
    createService().record('/procurement/purchase-orders');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user } },
        { provide: ScreenSearchService, useValue: { screens } }
      ]
    });

    expect(createService().recent().map((s) => s.label)).toEqual(['Purchase Orders']);
  });

  it('keeps each user’s list separate', () => {
    const service = createService();
    service.record('/procurement/purchase-orders');

    // Someone else signs in on the same browser; the previous user's working
    // set is no use to them and should not be visible.
    user.set({ id: 'usr-2' });
    TestBed.tick();

    expect(service.recent()).toEqual([]);
  });

  it('clears on request', () => {
    const service = createService();
    service.record('/procurement/purchase-orders');
    service.clear();

    expect(service.recent()).toEqual([]);
  });

  it('survives corrupt storage rather than throwing', () => {
    localStorage.setItem('aviation_erp_recent_screens:usr-1', '{not json');

    expect(() => createService()).not.toThrow();
    expect(TestBed.inject(RecentScreensService).recent()).toEqual([]);
  });
});
