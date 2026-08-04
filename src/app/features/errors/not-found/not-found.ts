import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="error-page">
      <span class="error-page__code pi pi-compass"></span>
      <h1>404 — Page Not Found</h1>
      <p class="text-muted">The screen you're looking for doesn't exist or may have moved.</p>
      <p-button label="Back to Dashboard" icon="pi pi-arrow-left" routerLink="/dashboard" />
    </div>
  `,
  styleUrl: '../error-page.scss'
})
export class NotFoundPage {}
