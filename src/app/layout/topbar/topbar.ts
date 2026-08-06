import { Component, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';

import { AuthService } from '../../core/auth/auth.service';
import { MOCK_BACKEND_AVAILABLE, resetMockDatabase } from '../../core/mock';
import { ROLE_LABELS } from '../../core/models/role.model';

const DARK_MODE_KEY = 'aviation_erp_dark_mode';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, AvatarModule, ButtonModule, MenuModule, BadgeModule, TooltipModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class Topbar {
  private readonly auth = inject(AuthService);
  private readonly confirmation = inject(ConfirmationService);

  readonly menuToggle = output<void>();

  user = this.auth.user;
  darkMode = signal(typeof localStorage !== 'undefined' && localStorage.getItem(DARK_MODE_KEY) === 'true');

  // "Reset Demo Data" only exists where there is a mock database to reset;
  // production builds replace core/mock with a stub and drop the entry.
  userMenuItems: MenuItem[] = [
    ...(MOCK_BACKEND_AVAILABLE
      ? [
          { label: 'Reset Demo Data', icon: 'pi pi-refresh', command: () => this.resetDemoData() },
          { separator: true }
        ]
      : []),
    { label: 'Sign Out', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];

  roleLabel(): string {
    const roles = this.user()?.roles ?? [];
    return roles.map((r) => ROLE_LABELS[r]).join(' · ');
  }

  logout(): void {
    // ModuleAccessService clears its own per-user grant cache off the
    // identity change, so there is nothing extra to tear down here.
    this.auth.logout();
  }

  toggleDarkMode(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    document.documentElement.classList.toggle('app-dark', next);
    localStorage.setItem(DARK_MODE_KEY, String(next));
  }

  private resetDemoData(): void {
    this.confirmation.confirm({
      header: 'Reset Demo Data',
      message: 'This clears everything you have added or edited in this browser and restores the original seed data. Continue?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Reset', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        resetMockDatabase();
        window.location.reload();
      }
    });
  }
}
