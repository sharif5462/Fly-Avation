import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { ScreenEntry, ScreenSearchService } from './screen-search.service';

const STORAGE_PREFIX = 'aviation_erp_recent_screens:';
const MAX_RECENT = 8;

/**
 * The screens this user last opened, most recent first.
 *
 * ERP work is repetitive — a stores clerk lives in four screens out of 404 —
 * so the palette opens on these rather than on nothing. Kept per user, since
 * several people may share a browser and one person's working set is no use
 * to another.
 */
@Injectable({ providedIn: 'root' })
export class RecentScreensService {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly screens = inject(ScreenSearchService);

  private readonly _paths = signal<string[]>([]);

  /**
   * Resolved against the current screen list, so an entry the user has lost
   * access to — or one removed from the manifest — simply drops out instead
   * of offering a dead link.
   */
  readonly recent = computed<ScreenEntry[]>(() => {
    const byPath = new Map(this.screens.screens().map((s) => [s.path, s]));
    return this._paths()
      .map((path) => byPath.get(path))
      .filter((screen): screen is ScreenEntry => !!screen);
  });

  constructor() {
    // Reload the list whenever the identity changes, so signing in as someone
    // else does not surface the previous user's working set.
    let currentUserId: string | null = null;
    effect(() => {
      const userId = this.auth.user()?.id ?? null;
      if (userId === currentUserId) return;
      currentUserId = userId;
      this._paths.set(this.read());
    });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((e) => e.urlAfterRedirects.split('?')[0]),
        takeUntilDestroyed()
      )
      .subscribe((path) => this.record(path));
  }

  /** Moves `path` to the front, keeping the list capped and duplicate-free. */
  record(path: string): void {
    // Only real module screens; /dashboard, /403 and the like are reachable
    // without help and would crowd out the useful entries.
    if (path.split('/').filter(Boolean).length !== 2) return;

    this._paths.update((paths) => {
      const next = [path, ...paths.filter((p) => p !== path)].slice(0, MAX_RECENT);
      this.write(next);
      return next;
    });
  }

  clear(): void {
    this._paths.set([]);
    this.write([]);
  }

  private storageKey(): string {
    return STORAGE_PREFIX + (this.auth.user()?.id ?? 'anonymous');
  }

  private read(): string[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.storageKey()) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
    } catch {
      return [];
    }
  }

  private write(paths: string[]): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(paths));
    } catch {
      // A full or disabled localStorage must not break navigation.
    }
  }
}
