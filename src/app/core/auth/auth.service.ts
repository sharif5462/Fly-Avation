import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse, User } from '../models/user.model';
import { Role } from '../models/role.model';
import { USER_STORAGE_KEY } from './storage-keys';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(localStorage.getItem(environment.tokenStorageKey));
  private readonly _user = signal<User | null>(this.readStoredUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly roles = computed<Role[]>(() => this._user()?.roles ?? []);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap((res) => this.setSession(res)));
  }

  signup(request: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${environment.apiUrl}/auth/register`, request);
  }

  forgotPassword(email: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  logout(navigateToLogin = true): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(environment.tokenStorageKey);
    localStorage.removeItem(USER_STORAGE_KEY);
    if (navigateToLogin) {
      this.router.navigate(['/login']);
    }
  }

  hasRole(...roles: Role[]): boolean {
    const mine = this.roles();
    if (mine.includes('SuperAdmin') || mine.includes('Admin')) return true;
    if (roles.length === 0) return true;
    return roles.some((r) => mine.includes(r));
  }

  private setSession(res: LoginResponse): void {
    this._token.set(res.token);
    this._user.set(res.user);
    localStorage.setItem(environment.tokenStorageKey, res.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
