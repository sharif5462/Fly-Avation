import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../models/user.model';
import { Role } from '../models/role.model';

const USER_STORAGE_KEY = 'aviation_erp_user';
const EXPIRY_STORAGE_KEY = 'aviation_erp_token_expiry';

/** Roles that pass every authorization check without being granted explicitly. */
const SUPER_ROLES: Role[] = ['SuperAdmin', 'Admin'];

interface StoredSession {
  token: string;
  user: User;
  expiresAt: number | null;
}

/**
 * Session state lives in signals (not a BehaviorSubject) so templates and
 * guards can read it synchronously without an async pipe. Persisted to
 * localStorage so a page refresh doesn't bounce the user back to /login.
 *
 * Talks to POST {apiUrl}/auth/login — see README.md for the exact contract
 * the real .NET Web API needs to implement. In dev it's served by
 * core/mock/mock-api.interceptor.ts.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(null);
  private readonly _user = signal<User | null>(null);
  private readonly _expiresAt = signal<number | null>(null);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly expiresAt = this._expiresAt.asReadonly();
  readonly roles = computed<Role[]>(() => this._user()?.roles ?? []);

  constructor() {
    this.restoreSession();
  }

  /**
   * A stored token whose `exp` has passed is not a session. Without this
   * check the guards let the user into the shell on a dead token, every
   * request 401s, and they get bounced back out — so the expiry is enforced
   * here, up front, instead of being discovered one failed request at a time.
   *
   * This is a UX guarantee, not a security boundary: the API is still the
   * only thing that actually validates the token, and it must reject an
   * expired one regardless of what the client believes.
   */
  readonly isAuthenticated = computed(() => !!this._token() && !this.isExpired());

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap((res) => this.setSession(res)));
  }

  /**
   * Always resolves with { success: true } from the real API too — whether
   * or not the email matches an account — so the frontend can't be used to
   * enumerate registered users. The UI should show the same generic
   * "check your email" message regardless.
   */
  forgotPassword(email: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  logout(navigateToLogin = true): void {
    this._token.set(null);
    this._user.set(null);
    this._expiresAt.set(null);
    this.clearStorage();
    if (navigateToLogin) {
      this.router.navigate(['/login']);
    }
  }

  /** SuperAdmin and Admin implicitly pass every role check. */
  hasRole(...roles: Role[]): boolean {
    const mine = this.roles();
    if (SUPER_ROLES.some((role) => mine.includes(role))) return true;
    if (roles.length === 0) return true;
    return roles.some((r) => mine.includes(r));
  }

  /** True once the current session's token has passed its expiry. */
  isExpired(): boolean {
    const expiry = this._expiresAt();
    // A session with no expiry claim can't be proven stale client-side; the
    // API stays the authority on it.
    return expiry !== null && expiry <= Date.now();
  }

  private setSession(res: LoginResponse): void {
    const expiresAt = this.parseExpiry(res.expiresAt);
    this._token.set(res.token);
    this._user.set(res.user);
    this._expiresAt.set(expiresAt);

    localStorage.setItem(environment.tokenStorageKey, res.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    if (expiresAt !== null) {
      localStorage.setItem(EXPIRY_STORAGE_KEY, String(expiresAt));
    } else {
      localStorage.removeItem(EXPIRY_STORAGE_KEY);
    }
  }

  /**
   * Reads the persisted session on startup, discarding it outright if it is
   * incomplete or already expired so no stale token ever reaches the guards.
   */
  private restoreSession(): void {
    const stored = this.readStoredSession();
    if (!stored) {
      this.clearStorage();
      return;
    }
    if (stored.expiresAt !== null && stored.expiresAt <= Date.now()) {
      this.clearStorage();
      return;
    }
    this._token.set(stored.token);
    this._user.set(stored.user);
    this._expiresAt.set(stored.expiresAt);
  }

  private readStoredSession(): StoredSession | null {
    const token = localStorage.getItem(environment.tokenStorageKey);
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    // Token and user are written together; either one alone is a torn write
    // (or hand-edited storage) and can't produce a usable session.
    if (!token || !rawUser) return null;

    let user: User;
    try {
      user = JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
    if (!user || typeof user !== 'object' || !Array.isArray(user.roles)) return null;

    const rawExpiry = localStorage.getItem(EXPIRY_STORAGE_KEY);
    const expiresAt = rawExpiry === null ? null : Number(rawExpiry);
    return { token, user, expiresAt: Number.isFinite(expiresAt) ? expiresAt : null };
  }

  private parseExpiry(value: string | null | undefined): number | null {
    if (!value) return null;
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : ms;
  }

  private clearStorage(): void {
    localStorage.removeItem(environment.tokenStorageKey);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(EXPIRY_STORAGE_KEY);
  }
}
