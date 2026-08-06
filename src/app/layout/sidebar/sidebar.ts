import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PanelMenuModule } from 'primeng/panelmenu';
import { filter, map } from 'rxjs';

import { ModuleAccessService } from '../../core/auth/module-access.service';
import { MODULES } from '../../core/data/module-manifest';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, PanelMenuModule, IconFieldModule, InputIconModule, InputTextModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  private readonly access = inject(ModuleAccessService);
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
   * The visible modules. Reads ModuleAccessService rather than roles directly
   * so an Access Control grant shows up in the nav, not just in the router —
   * otherwise a user could reach a granted module by URL but never see a link
   * to it.
   *
   * BI's "Dashboard" sub-item is deliberately excluded here and routed to
   * the unrestricted top-level `/dashboard` instead of the guarded
   * `business-intelligence/dashboard` — it's every user's landing page, not
   * just BI's, so it can't require the BI role. See app.routes.ts.
   */
  private readonly visibleModules = computed(() => MODULES.filter((mod) => this.access.canAccessModule(mod.key)));

  /**
   * Rebuilt only when the visible module set changes — not on every
   * navigation. Highlighting the open module is left to routerLinkActive in
   * the template; recomputing 259 MenuItem objects per NavigationEnd made
   * PanelMenu re-render the whole tree and discard the panels the user had
   * expanded by hand.
   */
  private readonly baseMenu = computed<MenuItem[]>(() =>
    this.visibleModules().map((mod) => ({
      label: mod.label,
      icon: `pi ${mod.icon}`,
      items: mod.items
        .filter((item) => !(mod.key === 'business-intelligence' && item.key === 'dashboard'))
        .map((item) => ({
          label: item.label,
          icon: `pi ${item.icon}`,
          routerLink: [`/${mod.key}/${item.key}`]
        }))
    }))
  );

  /**
   * Expansion state, applied on top of baseMenu. Split out so that changing
   * route (or typing in the filter) produces new wrapper objects for the
   * groups but reuses the same child item arrays.
   */
  private readonly menuWithExpansion = computed<MenuItem[]>(() => {
    const url = this.currentUrl();
    const modules = this.visibleModules();
    return this.baseMenu().map((group, index) => ({
      ...group,
      expanded: url.startsWith(`/${modules[index].key}/`)
    }));
  });

  menuItems = computed<MenuItem[]>(() => {
    const term = this.filterText().trim().toLowerCase();
    if (!term) return this.menuWithExpansion();

    return this.menuWithExpansion()
      .map((group) => {
        const moduleMatches = (group.label as string).toLowerCase().includes(term);
        const items = (group.items ?? []).filter(
          (child) => moduleMatches || (child.label as string).toLowerCase().includes(term)
        );
        return { ...group, items, expanded: items.length > 0 };
      })
      .filter((group) => (group.items ?? []).length > 0);
  });

  constructor() {
    // Access Control grants are what let a module appear here at all beyond
    // the user's own role, so the nav can't render correctly until they load.
    this.access.load().pipe(takeUntilDestroyed()).subscribe();
  }

  onFilterInput(value: string): void {
    this.filterText.set(value);
  }
}
