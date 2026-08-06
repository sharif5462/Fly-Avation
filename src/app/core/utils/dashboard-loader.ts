import { DestroyRef, Signal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

/** Read-only load state for a dashboard, plus the ability to try again. */
export interface DashboardLoader {
  /** True while a request is in flight. Drives the skeletons and table spinners. */
  readonly loading: Signal<boolean>;
  /** True when the last attempt failed. Mutually exclusive with `loading`. */
  readonly failed: Signal<boolean>;
  /** Re-runs the load. Safe to call while one is already running (it is ignored). */
  reload(): void;
}

/**
 * Load-once-with-retry for the read-only dashboards.
 *
 * Every dashboard fans out to several resources with `forkJoin` and renders
 * the combined result. They all previously subscribed with a bare next
 * handler, which had two consequences:
 *
 * - **`forkJoin` errors if any one source errors.** A single failing request
 *   killed the whole subscription, `loading` was never cleared, and the page
 *   sat on its spinner forever — no message, no retry, nothing in the UI to
 *   distinguish "still loading" from "this is never going to finish".
 * - **No teardown.** Navigating away mid-load left the response to arrive and
 *   write signals on a destroyed component.
 *
 * Both are handled here once instead of eight times. Must be called from an
 * injection context (a field initializer or constructor) so it can take the
 * component's `DestroyRef`.
 *
 * @param load  Builds the request. Called again on every `reload()`, so it
 *              must construct a fresh observable rather than close over one.
 * @param apply Receives the result on success. Only ever called with a
 *              complete payload, so it can assume every source resolved.
 */
export function createDashboardLoader<T>(load: () => Observable<T>, apply: (value: T) => void): DashboardLoader {
  const destroyRef = inject(DestroyRef);
  const loading = signal(true);
  const failed = signal(false);

  function run(): void {
    loading.set(true);
    failed.set(false);

    load()
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (value) => {
          apply(value);
          loading.set(false);
        },
        error: () => {
          // Deliberately no toast here: errorInterceptor already raises one
          // for 5xx and network failures, and the in-page retry below is the
          // actionable part. Two notifications for one failure is noise.
          loading.set(false);
          failed.set(true);
        }
      });
  }

  run();

  return {
    loading: loading.asReadonly(),
    failed: failed.asReadonly(),
    reload: () => {
      if (!loading()) run();
    }
  };
}
