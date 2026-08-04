import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="error-page">
      <span class="error-page__code pi pi-lock"></span>
      <h1>403 — Access Restricted</h1>
      <p class="text-muted">
        Your account doesn't have permission to view this module. Ask an administrator
        to grant you the required role, or head back to your dashboard.
      </p>
      <p-button label="Back to Dashboard" icon="pi pi-arrow-left" routerLink="/dashboard" />
    </div>
  `,
  styleUrl: '../error-page.scss'
})
export class ForbiddenPage {}
