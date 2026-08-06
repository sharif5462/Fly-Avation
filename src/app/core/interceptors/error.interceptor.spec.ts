import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

const RESOURCE_URL = `${environment.apiUrl}/work-orders`;
const LOGIN_URL = `${environment.apiUrl}/auth/login`;

describe('errorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let logout: jasmine.Spy;
  let navigate: jasmine.Spy;
  let addMessage: jasmine.Spy;

  function request(url: string): void {
    http.get(url).subscribe({ next: () => undefined, error: () => undefined });
  }

  beforeEach(() => {
    logout = jasmine.createSpy('logout');
    navigate = jasmine.createSpy('navigate');
    addMessage = jasmine.createSpy('add');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { logout } },
        { provide: Router, useValue: { navigate } },
        { provide: MessageService, useValue: { add: addMessage } }
      ]
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  describe('401', () => {
    it('signs the user out when a session-backed request is rejected', () => {
      request(RESOURCE_URL);
      controller.expectOne(RESOURCE_URL).flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(logout).toHaveBeenCalled();
    });

    it('leaves sign-in failures to the login page', () => {
      // A 401 from /auth/login is a wrong password, not an expired session.
      // Logging out and navigating here fights the login page for the screen.
      http.post(LOGIN_URL, {}).subscribe({ error: () => undefined });
      controller.expectOne(LOGIN_URL).flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(logout).not.toHaveBeenCalled();
    });

    it('leaves forgot-password failures alone too', () => {
      const url = `${environment.apiUrl}/auth/forgot-password`;
      http.post(url, {}).subscribe({ error: () => undefined });
      controller.expectOne(url).flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(logout).not.toHaveBeenCalled();
    });
  });

  describe('403', () => {
    it('redirects to the forbidden page', () => {
      request(RESOURCE_URL);
      controller.expectOne(RESOURCE_URL).flush({}, { status: 403, statusText: 'Forbidden' });

      expect(navigate).toHaveBeenCalledWith(['/403']);
      expect(logout).not.toHaveBeenCalled();
    });
  });

  describe('network and server failures', () => {
    it('reports an unreachable API', () => {
      request(RESOURCE_URL);
      controller.expectOne(RESOURCE_URL).error(new ProgressEvent('error'));

      expect(addMessage).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', summary: 'Network error' }));
    });

    it('surfaces the server message on a 500', () => {
      request(RESOURCE_URL);
      controller.expectOne(RESOURCE_URL).flush({ message: 'ORA-00942' }, { status: 500, statusText: 'Server Error' });

      expect(addMessage).toHaveBeenCalledWith(jasmine.objectContaining({ summary: 'Server error', detail: 'ORA-00942' }));
    });

    it('falls back to a generic message when the server sends no detail', () => {
      request(RESOURCE_URL);
      controller.expectOne(RESOURCE_URL).flush(null, { status: 503, statusText: 'Service Unavailable' });

      expect(addMessage).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'Unexpected server error.' }));
    });
  });

  describe('errors the caller owns', () => {
    it('passes a 400 through untouched for the page to handle', () => {
      request(RESOURCE_URL);
      controller.expectOne(RESOURCE_URL).flush({}, { status: 400, statusText: 'Bad Request' });

      expect(logout).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
      expect(addMessage).not.toHaveBeenCalled();
    });

    it('re-throws so the calling page still sees the failure', () => {
      let seen: unknown;
      http.get(RESOURCE_URL).subscribe({ error: (err) => (seen = err) });
      controller.expectOne(RESOURCE_URL).flush({}, { status: 500, statusText: 'Server Error' });

      expect(seen).toBeTruthy();
    });
  });
});
