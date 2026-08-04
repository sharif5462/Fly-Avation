import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header">
      <div class="page-header__heading">
        <span class="page-header__icon pi {{ icon() }}"></span>
        <div>
          <h1>{{ title() }}</h1>
          @if (description()) {
            <p class="text-muted">{{ description() }}</p>
          }
        </div>
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .page-header__heading {
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;
    }
    .page-header__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 10px;
      background: color-mix(in srgb, var(--p-primary-color) 12%, transparent);
      color: var(--p-primary-color);
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    h1 {
      margin: 0;
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--p-surface-900);
    }
    p {
      margin: 0.125rem 0 0;
      font-size: 0.875rem;
    }
    .page-header__actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  `]
})
export class PageHeader {
  icon = input('pi-circle');
  title = input.required<string>();
  description = input('');
}
