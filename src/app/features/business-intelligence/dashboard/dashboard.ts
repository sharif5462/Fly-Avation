import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { createDashboardLoader } from '../../../core/utils/dashboard-loader';
import { LoadError } from '../../../shared/components/load-error/load-error';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import type { AircraftRegistration } from '../../../core/models/aircraft-registration.model';
import type { Flight } from '../../flight-operations/flight-scheduling/flight-scheduling';
import type { SparePart } from '../../inventory-spare-parts/spare-parts-inventory/spare-parts-inventory';
import type { PoStatus, PurchaseOrder } from '../../procurement/purchase-orders/purchase-orders';
import type { WorkOrder, WorkOrderPriority } from '../../aircraft-maintenance/work-orders/work-orders';

interface QuickLink {
  label: string;
  icon: string;
  route: string[];
}

/** How many purchase orders the "Recent" panel shows — and therefore fetches. */
const RECENT_ORDER_COUNT = 5;

const PO_STATUS_SEVERITY: Record<PoStatus, TagSeverity> = {
  Draft: 'secondary',
  Submitted: 'info',
  Approved: 'warn',
  Received: 'success',
  Cancelled: 'danger'
};

@Component({
  selector: 'app-dashboard',
  imports: [LoadError, RouterLink, DatePipe, CurrencyPipe, ChartModule, TableModule, TagModule, PageHeader, StatCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardPage {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  user = this.auth.user;

  stats = signal({ activeFlights: 0, fleetAvailability: 0, openWorkOrders: 0, attentionParts: 0 });
  recentOrders = signal<PurchaseOrder[]>([]);

  fleetChartData: unknown = null;
  flightChartData: unknown = null;
  workOrderChartData: unknown = null;
  doughnutOptions: unknown = null;
  barOptions: unknown = null;

  private readonly poStatusSeverity = PO_STATUS_SEVERITY;

  quickLinks: QuickLink[] = [
    { label: 'Flight Scheduling', icon: 'pi-calendar', route: ['/flight-operations', 'flight-scheduling'] },
    { label: 'Work Orders', icon: 'pi-clipboard', route: ['/aircraft-maintenance', 'work-orders'] },
    { label: 'Purchase Orders', icon: 'pi-shopping-cart', route: ['/procurement', 'purchase-orders'] },
    { label: 'User Roles', icon: 'pi-users', route: ['/security-management', 'user-roles'] }
  ];

  /**
   * Fans out to every resource this dashboard renders. createDashboardLoader
   * owns the loading/failed state, the teardown, and the retry — a failed
   * forkJoin used to leave the page spinning forever.
   */
  private readonly loader = createDashboardLoader(
    () => forkJoin({
      flights: this.api.list<Flight>('flight-scheduling'),
      aircraft: this.api.list<AircraftRegistration>('aircraft-registration'),
      workOrders: this.api.list<WorkOrder>('work-orders'),
      spareParts: this.api.list<SparePart>('spare-parts-inventory'),
      // Only the five most recent are rendered, so ask for five. Fetching
      // the whole purchase-order table and slicing it is invisible against
      // the seeded mock and a full table scan against Oracle.
      purchaseOrders: this.api.list<PurchaseOrder>('purchase-orders', {
        sortField: 'orderDate',
        sortOrder: 'desc',
        page: 0,
        pageSize: RECENT_ORDER_COUNT
      })
    }),
    ({ flights, aircraft, workOrders, spareParts, purchaseOrders }) => {
        this.computeStats(flights.data, aircraft.data, workOrders.data, spareParts.data);
        this.buildFleetChart(aircraft.data);
        this.buildFlightChart(flights.data);
        this.buildWorkOrderChart(workOrders.data);
        this.recentOrders.set(purchaseOrders.data);
    }
  );

  readonly loading = this.loader.loading;
  readonly loadFailed = this.loader.failed;

  private computeStats(flights: Flight[], aircraft: AircraftRegistration[], workOrders: WorkOrder[], spareParts: SparePart[]): void {
    const activeFlights = flights.filter((f) => f.status === 'In Air' || f.status === 'Departed' || f.status === 'Boarding').length;
    const activeAircraft = aircraft.filter((a) => a.currentStatus === 'Active').length;
    const fleetAvailability = aircraft.length ? Math.round((activeAircraft / aircraft.length) * 100) : 0;
    const openWorkOrders = workOrders.filter((w) => w.status === 'Open' || w.status === 'In Progress').length;
    const attentionParts = spareParts.filter((p) => p.status !== 'In Stock').length;
    this.stats.set({ activeFlights, fleetAvailability, openWorkOrders, attentionParts });
  }

  poSeverity(status: PoStatus): TagSeverity {
    return this.poStatusSeverity[status];
  }

  private themeTextColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--p-text-muted-color') || '#64748b';
  }

  private buildFleetChart(aircraft: AircraftRegistration[]): void {
    const buckets: Record<string, number> = { Active: 0, Maintenance: 0, Grounded: 0, Retired: 0, Parked: 0 };
    aircraft.forEach((a) => (buckets[a.currentStatus] = (buckets[a.currentStatus] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.fleetChartData = {
      labels: Object.keys(buckets),
      datasets: [
        {
          data: Object.values(buckets),
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#64748b', '#0ea5e9'],
          hoverBackgroundColor: ['#16a34a', '#d97706', '#dc2626', '#475569', '#0284c7']
        }
      ]
    };
    this.doughnutOptions = {
      plugins: { legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true } } },
      cutout: '65%'
    };
  }

  private buildFlightChart(flights: Flight[]): void {
    const order = ['Scheduled', 'Boarding', 'Departed', 'In Air', 'Landed', 'Delayed', 'Cancelled'];
    const buckets: Record<string, number> = {};
    order.forEach((s) => (buckets[s] = 0));
    flights.forEach((f) => (buckets[f.status] = (buckets[f.status] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.flightChartData = {
      labels: order,
      datasets: [
        {
          label: 'Flights',
          data: order.map((s) => buckets[s]),
          backgroundColor: '#134bd1',
          borderRadius: 6,
          maxBarThickness: 36
        }
      ]
    };
    this.barOptions = {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: 'rgba(148, 163, 184, 0.2)' }, beginAtZero: true }
      }
    };
  }

  private buildWorkOrderChart(workOrders: WorkOrder[]): void {
    const order: WorkOrderPriority[] = ['Low', 'Medium', 'High', 'Critical'];
    const buckets: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    workOrders.forEach((w) => (buckets[w.priority] = (buckets[w.priority] ?? 0) + 1));

    // Reuses barOptions built in buildFlightChart — both bar charts share the
    // same axis/legend styling, so there's nothing chart-specific to set here.
    this.workOrderChartData = {
      labels: order,
      datasets: [
        {
          label: 'Work Orders',
          data: order.map((p) => buckets[p]),
          backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#ef4444'],
          borderRadius: 6,
          maxBarThickness: 36
        }
      ]
    };
  }

  reload(): void {
    this.loader.reload();
  }
}
