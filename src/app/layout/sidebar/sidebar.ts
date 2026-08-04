import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PanelMenuModule } from 'primeng/panelmenu';
import { filter, map } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { MODULES } from '../../core/data/module-manifest';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, PanelMenuModule, IconFieldModule, InputIconModule, InputTextModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  filterText = signal('');

  /**
   * BI's "Dashboard" sub-item is deliberately excluded here and routed to
   * the unrestricted top-level `/dashboard` instead of the role-guarded
   * `business-intelligence/dashboard` — it's every user's landing page, not
   * just BI's, so it can't require the BI role. See app.routes.ts.
   */
  private readonly baseMenu = computed<MenuItem[]>(() => {
    const url = this.currentUrl();
    return MODULES.filter((mod) => !mod.role || this.auth.hasRole(mod.role)).map((mod) => ({
      label: mod.label,
      icon: `pi ${mod.icon}`,
      expanded: url.startsWith(`/${mod.key}/`),
      items: mod.items
        .filter((item) => !(mod.key === 'business-intelligence' && item.key === 'dashboard'))
        .map((item) => ({
          label: item.label,
          icon: `pi ${item.icon}`,
          routerLink: [`/${mod.key}/${item.key}`]
        }))
    }));
  });

  menuItems = computed<MenuItem[]>(() => {
    const term = this.filterText().trim().toLowerCase();
    if (!term) return this.baseMenu();

    return this.baseMenu()
      .map((group) => {
        const moduleMatches = (group.label as string).toLowerCase().includes(term);
        const items = (group.items ?? []).filter(
          (child) => moduleMatches || (child.label as string).toLowerCase().includes(term)
        );
        return { ...group, items, expanded: items.length > 0 };
      })
      .filter((group) => (group.items ?? []).length > 0);
  });

  onFilterInput(value: string): void {
    this.filterText.set(value);
  }
}
