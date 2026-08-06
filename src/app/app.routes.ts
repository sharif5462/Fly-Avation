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
  'aircraft-registration': () =>
    import('./features/fleet-management/aircraft-registration/aircraft-registration').then((m) => m.AircraftRegistrationPage),
  'work-orders': () => import('./features/aircraft-maintenance/work-orders/work-orders').then((m) => m.WorkOrdersPage),
  'mro-dashboard': () => import('./features/aircraft-maintenance/mro-dashboard/mro-dashboard').then((m) => m.MroDashboardPage),
  'component-tracking': () =>
    import('./features/aircraft-maintenance/component-tracking/component-tracking').then((m) => m.ComponentTrackingPage),
  'baggage-handling-dashboard': () =>
    import('./features/baggage-handling-system/baggage-handling-dashboard/baggage-handling-dashboard').then(
      (m) => m.BaggageHandlingDashboardPage
    ),
  'baggage-handling': () =>
    import('./features/baggage-handling-system/baggage-handling/baggage-handling').then((m) => m.BaggageHandlingPage),
  'pilot-management': () =>
    import('./features/crew-management/pilot-management/pilot-management').then((m) => m.PilotManagementPage),
  'spare-parts-inventory': () =>
    import('./features/inventory-spare-parts/spare-parts-inventory/spare-parts-inventory').then((m) => m.SparePartsInventoryPage),
  'purchase-orders': () => import('./features/procurement/purchase-orders/purchase-orders').then((m) => m.PurchaseOrdersPage),
  'user-roles': () => import('./features/security-management/user-roles/user-roles').then((m) => m.UserRolesPage),
  'access-control': () => import('./features/security-management/access-control/access-control').then((m) => m.AccessControlPage),
  'warehouse-dashboard': () =>
    import('./features/warehouse-management/warehouse-dashboard/warehouse-dashboard').then((m) => m.WarehouseDashboardPage),
  'item-master': () => import('./features/warehouse-management/item-master/item-master').then((m) => m.ItemMasterPage),
  'facility-dashboard': () =>
    import('./features/facilities-assets/facility-dashboard/facility-dashboard').then((m) => m.FacilityDashboardPage),
  'asset-master': () => import('./features/facilities-assets/asset-master/asset-master').then((m) => m.AssetMasterPage),
  'sms-dashboard': () =>
    import('./features/safety-management-system/sms-dashboard/sms-dashboard').then((m) => m.SmsDashboardPage),
  'hazard-reporting': () =>
    import('./features/safety-management-system/hazard-reporting/hazard-reporting').then((m) => m.HazardReportingPage),
  'landside-dashboard': () =>
    import('./features/landside-operations/landside-dashboard/landside-dashboard').then((m) => m.LandsideDashboardPage),
  'resource-dashboard': () =>
    import('./features/resource-gate-management/resource-dashboard/resource-dashboard').then((m) => m.ResourceDashboardPage)
};

function scaffoldLoader(): ReturnType<NonNullable<Route['loadComponent']>> {
  return import('./shared/scaffold/feature-list-page/feature-list-page').then((m) => m.FeatureListPage);
}

/**
 * Builds one parent route per module, gated by that module's access rules,
 * with one child route per sub-item. The guard resolves `moduleKey` against
 * both the manifest's owning role and any grants made on the Access Control
 * screen — see core/auth/module-access.service.ts.
 */
function buildModuleRoutes(): Routes {
  return MODULES.map((mod) => ({
    path: mod.key,
    canActivate: [roleGuard],
    data: { moduleKey: mod.key },
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
