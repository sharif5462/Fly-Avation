import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { filter, map } from 'rxjs';

import { MODULES } from '../../core/data/module-manifest';

@Component({
  selector: 'app-breadcrumb',
  imports: [BreadcrumbModule],
  template: `<p-breadcrumb [model]="items()" [home]="home" styleClass="app-breadcrumb" />`,
  styles: [`
    :host { display: block; margin-bottom: 1rem; }
  `]
})
export class Breadcrumb {
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  home: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };

  items = computed<MenuItem[]>(() => {
    const url = this.currentUrl().split('?')[0];
    const segments = url.split('/').filter(Boolean);
    if (segments.length === 0 || segments[0] === 'dashboard') {
      return [{ label: 'Dashboard' }];
    }

    const [moduleKey, itemKey] = segments;
    const mod = MODULES.find((m) => m.key === moduleKey);
    if (!mod) return [{ label: segments.join(' / ') }];

    const item = mod.items.find((i) => i.key === itemKey);
    const crumbs: MenuItem[] = [{ label: mod.label }];
    if (item) crumbs.push({ label: item.label });
    return crumbs;
  });
}
