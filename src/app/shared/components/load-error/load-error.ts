import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * The "this did not load" state for a page that fetches on entry.
 *
 * Exists so a failed dashboard says so and offers a way out, instead of
 * leaving a spinner running forever. `role="alert"` announces it to screen
 * readers when it replaces the loading state.
 */
@Component({
  selector: 'app-load-error',
  imports: [ButtonModule],
  template: `
    <div class="load-error surface-card" role="alert">
      <span class="load-error__icon pi pi-exclamation-triangle" aria-hidden="true"></span>
      <div class="load-error__body">
        <strong>{{ title() }}</strong>
        <p class="text-muted">{{ detail() }}</p>
      </div>
      <p-button
        label="Try Again"
        icon="pi pi-refresh"
        severity="secondary"
        [outlined]="true"
        [loading]="retrying()"
        (onClick)="retry.emit()"
      />
    </div>
  `,
  styles: [
    `
      .load-error {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }
      .load-error__icon {
        font-size: 1.5rem;
        color: var(--p-orange-500);
        flex-shrink: 0;
      }
      .load-error__body {
        flex: 1 1 16rem;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
      .load-error__body p {
        margin: 0;
        font-size: 0.875rem;
      }
    `
  ]
})
export class LoadError {
  title = input('Could not load this page');
  detail = input('The server did not respond as expected. Your data has not been changed.');
  retrying = input(false);

  readonly retry = output<void>();
}
