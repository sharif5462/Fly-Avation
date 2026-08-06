import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface ListResult<T> {
  data: T[];
  total: number;
}

/**
 * Server-side query options for a list request. Every field is optional; the
 * API applies filtering, then sorting, then paging, and reports `total` as the
 * count *before* paging.
 *
 * These map 1:1 to the query parameters documented in README.md and already
 * implemented by the mock interceptor.
 */
export interface ListQuery {
  /** Free-text match across the resource's fields. */
  search?: string;
  /** Field key to order by. */
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  /** Zero-based page index. Only applied when `pageSize` is set. */
  page?: number;
  pageSize?: number;
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

  /**
   * Lists a resource, optionally filtered/sorted/paged **server-side**.
   *
   * Callers that only need a slice — a dashboard's "5 most recent purchase
   * orders", say — must pass a query rather than fetching everything and
   * calling `.slice()`. Against the seeded mock the difference is invisible;
   * against an Oracle table with millions of rows it is the difference
   * between one page of results and a full table scan sent over the wire.
   */
  list<T>(resource: string, query?: ListQuery): Observable<ListResult<T>> {
    return this.http.get<ListResult<T>>(this.url(resource), { params: this.toParams(query) });
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

  /**
   * Only defined keys are sent, so an absent option never becomes `?search=`
   * or `?page=undefined` — an empty string is a meaningful filter to a
   * backend, and "no filter" must not be encoded as one.
   */
  private toParams(query?: ListQuery): HttpParams | undefined {
    if (!query) return undefined;

    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }
    return params.keys().length ? params : undefined;
  }

  private url(resource: string, id?: string): string {
    return id ? `${environment.apiUrl}/${resource}/${id}` : `${environment.apiUrl}/${resource}`;
  }
}
