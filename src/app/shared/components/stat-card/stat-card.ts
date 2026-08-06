import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  template: `
    <div class="stat-card">
      <div class="stat-card__icon pi {{ icon() }}" [style.background]="iconBg()" [style.color]="iconColor()"></div>
      <div class="stat-card__body">
        <span class="stat-card__value">{{ value() }}</span>
        <span class="stat-card__label">{{ label() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1rem 1.125rem;
      background: var(--p-content-background);
      border: 1px solid var(--p-content-border-color);
      border-radius: var(--app-radius);
      box-shadow: var(--app-shadow-sm);
      flex: 1 1 10rem;
      min-width: 10rem;
    }
    .stat-card__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 10px;
      font-size: 1.15rem;
      flex-shrink: 0;
    }
    .stat-card__body {
      display: flex;
      flex-direction: column;
    }
    .stat-card__value {
      font-size: 1.375rem;
      font-weight: 700;
      line-height: 1.2;
      color: var(--p-text-color);
    }
    .stat-card__label {
      font-size: 0.8125rem;
      color: var(--p-text-muted-color);
    }
  `]
})
export class StatCard {
  icon = input('pi-circle');
  value = input<string | number>(0);
  label = input('');
  iconBg = input('color-mix(in srgb, var(--p-primary-color) 12%, transparent)');
  iconColor = input('var(--p-primary-color)');
}
