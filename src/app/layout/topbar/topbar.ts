import { Component, computed, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';

import { AuthService } from '../../core/auth/auth.service';
import { CompanyContextService } from '../../core/auth/company-context.service';
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
  private readonly company = inject(CompanyContextService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly menuToggle = output<void>();

  user = this.auth.user;

  activeCompany = this.company.activeCompany;
  showCompanySwitcher = this.company.hasMultipleCompanies;

  companyMenuItems = computed<MenuItem[]>(() =>
    this.company.companies().map((c) => ({
      label: `${c.code} — ${c.name}`,
      icon: c.id === this.company.activeCompanyId() ? 'pi pi-check' : 'pi pi-building',
      disabled: c.id === this.company.activeCompanyId(),
      command: () => this.switchCompany(c.id)
    }))
  );

  /**
   * Every page on screen is showing the previous company's records, so the
   * switch is followed by a full reload of the current route rather than
   * leaving stale rows visible until the user happens to navigate.
   */
  private switchCompany(companyId: string): void {
    if (!this.company.setActiveCompany(companyId)) return;

    const url = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigateByUrl(url));
  }
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
