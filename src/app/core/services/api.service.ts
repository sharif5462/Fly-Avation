import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface ListResult<T> {
  data: T[];
  total: number;
}

/**
 * Thin, uniform REST wrapper used by every feature — flagship pages and the
 * generic scaffold alike — so there is exactly one place that knows how
 * request URLs are built. Every method maps 1:1 to the contract documented
 * in README.md, which is what the real .NET Web API needs to implement.
 * In dev, core/mock/mock-api.interceptor.ts answers these instead.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  list<T>(resource: string): Observable<ListResult<T>> {
    return this.http.get<ListResult<T>>(this.url(resource));
  }

  getById<T>(resource: string, id: string): Observable<T> {
    return this.http.get<T>(this.url(resource, id));
  }

  create<T>(resource: string, payload: Partial<T>): Observable<T> {
    return this.http.post<T>(this.url(resource), payload);
  }

  update<T>(resource: string, id: string, payload: Partial<T>): Observable<T> {
    return this.http.put<T>(this.url(resource, id), payload);
  }

  remove(resource: string, id: string): Observable<void> {
    return this.http.delete<void>(this.url(resource, id));
  }

  private url(resource: string, id?: string): string {
    return id ? `${environment.apiUrl}/${resource}/${id}` : `${environment.apiUrl}/${resource}`;
  }
}
