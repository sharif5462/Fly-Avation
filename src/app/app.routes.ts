import { Route, Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { MODULES } from './core/data/module-manifest';
import { Shell } from './layout/shell/shell';

/**
 * Hand-built (flagship) components, keyed by their manifest item key.
 * `loadComponent` needs a literal dynamic import per target for esbuild to
 * code-split it, so this map is spelled out rather than generated — it's
 * the one place that has to know about every flagship page.
 *
 * 'dashboard' is deliberately absent: it's routed at the top level as
 * `/dashboard` (see below), not nested under business-intelligence, because
 * it's every user's landing page rather than a BI-role-gated screen.
 */
const FLAGSHIP_LOADERS: Record<string, Route['loadComponent']> = {
  'flight-scheduling': () =>
    import('./features/flight-operations/flight-scheduling/flight-scheduling').then((m) => m.FlightSchedulingPage),
  'aircraft-information': () =>
    import('./features/fleet-management/aircraft-information/aircraft-information').then((m) => m.AircraftInformationPage),
  'work-orders': () => import('./features/aircraft-maintenance/work-orders/work-orders').then((m) => m.WorkOrdersPage),
  'pilot-management': () =>
    import('./features/crew-management/pilot-management/pilot-management').then((m) => m.PilotManagementPage),
  'spare-parts-inventory': () =>
    import('./features/inventory-spare-parts/spare-parts-inventory/spare-parts-inventory').then((m) => m.SparePartsInventoryPage),
  'purchase-orders': () => import('./features/procurement/purchase-orders/purchase-orders').then((m) => m.PurchaseOrdersPage),
  'user-roles': () => import('./features/security-management/user-roles/user-roles').then((m) => m.UserRolesPage),
  'access-control': () => import('./features/security-management/access-control/access-control').then((m) => m.AccessControlPage)
};

function scaffoldLoader(): ReturnType<NonNullable<Route['loadComponent']>> {
  return import('./shared/scaffold/feature-list-page/feature-list-page').then((m) => m.FeatureListPage);
}

/** Builds one parent route per module, gated by that module's role, with one child route per sub-item. */
function buildModuleRoutes(): Routes {
  return MODULES.map((mod) => ({
    path: mod.key,
    canActivate: [roleGuard],
    data: { roles: mod.role ? [mod.role] : undefined },
    children: mod.items
      .filter((item) => !(mod.key === 'business-intelligence' && item.key === 'dashboard'))
      .map((item) => {
        const flagshipLoader = FLAGSHIP_LOADERS[item.key];
        return flagshipLoader
          ? { path: item.key, loadComponent: flagshipLoader }
          : { path: item.key, loadComponent: scaffoldLoader, data: { entityKey: item.key } };
      })
  }));
}

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginPage),
    canActivate: [guestGuard]
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/business-intelligence/dashboard/dashboard').then((m) => m.DashboardPage) },
      { path: '403', loadComponent: () => import('./features/errors/forbidden/forbidden').then((m) => m.ForbiddenPage) },
      ...buildModuleRoutes(),
      { path: '**', loadComponent: () => import('./features/errors/not-found/not-found').then((m) => m.NotFoundPage) }
    ]
  }
];
