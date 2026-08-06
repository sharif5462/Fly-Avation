import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';

import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { createDashboardLoader } from '../../../core/utils/dashboard-loader';
import { LoadError } from '../../../shared/components/load-error/load-error';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

type GenericRow = Record<string, unknown> & { id: string };

interface QuickLink {
  label: string;
  icon: string;
  route: string[];
}

const RESOURCE_STATUS_ORDER = ['Available', 'Occupied', 'Blocked', 'Out of Service'];
const CONFLICT_TYPE_ORDER = [
  'Double Booking',
  'Size Code Violation',
  'Insufficient Towing Gap',
  'Adjacent Stand Restriction',
  'Resource Out of Service'
];

const SEVERITY_SEVERITY: Record<string, TagSeverity> = {
  Critical: 'danger',
  Major: 'warn',
  Minor: 'info'
};

/** Conflicts still needing a planner's attention — everything except Resolved/Accepted Risk. */
const UNRESOLVED_CONFLICT_STATUSES = ['Open', 'Being Resolved'];

@Component({
  selector: 'app-resource-dashboard',
  imports: [LoadError, RouterLink, DatePipe, ChartModule, TableModule, TagModule, PageHeader, StatCard],
  templateUrl: './resource-dashboard.html',
  styleUrl: './resource-dashboard.scss'
})
export class ResourceDashboardPage {
  private readonly api = inject(ApiService);

  stats = signal({
    standsAvailable: 0,
    gatesOccupied: 0,
    openConflicts: 0,
    activeBlockings: 0,
    avgOccupancyPct: 0,
    turnaroundsAtRisk: 0,
    gateChangesApplied: 0
  });
  openConflicts = signal<GenericRow[]>([]);

  standStatusChartData: unknown = null;
  conflictTypeChartData: unknown = null;
  doughnutOptions: unknown = null;
  barOptions: unknown = null;

  quickLinks: QuickLink[] = [
    { label: 'Stand & Bay Registry', icon: 'pi-map-marker', route: ['/resource-gate-management', 'stand-registry'] },
    { label: 'Gate Registry', icon: 'pi-sitemap', route: ['/resource-gate-management', 'gate-registry'] },
    { label: 'Gate Allocation', icon: 'pi-sitemap', route: ['/resource-gate-management', 'gate-management'] },
    { label: 'Stand Allocation', icon: 'pi-map-marker', route: ['/resource-gate-management', 'aircraft-parking'] },
    { label: 'Daily Resource Plan', icon: 'pi-calendar-clock', route: ['/resource-gate-management', 'daily-resource-plan'] },
    { label: 'Outages & Blockings', icon: 'pi-ban', route: ['/resource-gate-management', 'resource-outage-blocking'] }
  ];

  /**
   * Fans out to every resource this dashboard renders. createDashboardLoader
   * owns the loading/failed state, the teardown, and the retry — a failed
   * forkJoin used to leave the page spinning forever.
   */
  private readonly loader = createDashboardLoader(
    () => forkJoin({
      stands: this.api.list<GenericRow>('stand-registry'),
      gates: this.api.list<GenericRow>('gate-registry'),
      conflicts: this.api.list<GenericRow>('resource-conflict-management'),
      blockings: this.api.list<GenericRow>('resource-outage-blocking'),
      turnarounds: this.api.list<GenericRow>('turnaround-monitoring'),
      changes: this.api.list<GenericRow>('gate-change-log'),
      utilization: this.api.list<GenericRow>('resource-utilization')
    }),
    ({ stands, gates, conflicts, blockings, turnarounds, changes, utilization }) => {
        this.computeStats(stands.data, gates.data, conflicts.data, blockings.data, turnarounds.data, changes.data, utilization.data);
        this.buildStandStatusChart(stands.data);
        this.buildConflictTypeChart(conflicts.data);
        this.openConflicts.set(
          conflicts.data.filter((c) => UNRESOLVED_CONFLICT_STATUSES.includes(c['status'] as string)).slice(0, 6)
        );
    }
  );

  readonly loading = this.loader.loading;
  readonly loadFailed = this.loader.failed;

  severityTag(severity: unknown): TagSeverity {
    return SEVERITY_SEVERITY[severity as string] ?? 'secondary';
  }

  private computeStats(
    stands: GenericRow[],
    gates: GenericRow[],
    conflicts: GenericRow[],
    blockings: GenericRow[],
    turnarounds: GenericRow[],
    changes: GenericRow[],
    utilization: GenericRow[]
  ): void {
    const occupancyValues = utilization.map((u) => Number(u['occupancyPct']) || 0);
    const occupancyTotal = occupancyValues.reduce((sum, v) => sum + v, 0);

    this.stats.set({
      standsAvailable: stands.filter((s) => s['status'] === 'Available').length,
      gatesOccupied: gates.filter((g) => g['status'] === 'Occupied').length,
      openConflicts: conflicts.filter((c) => c['status'] === 'Open').length,
      activeBlockings: blockings.filter((b) => b['status'] === 'Active').length,
      avgOccupancyPct: occupancyValues.length ? Math.round(occupancyTotal / occupancyValues.length) : 0,
      turnaroundsAtRisk: turnarounds.filter((t) => t['status'] === 'At Risk' || t['status'] === 'Delayed').length,
      gateChangesApplied: changes.filter((c) => c['status'] === 'Applied').length
    });
  }

  private themeTextColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--p-text-muted-color') || '#64748b';
  }

  private buildStandStatusChart(stands: GenericRow[]): void {
    const buckets: Record<string, number> = {};
    RESOURCE_STATUS_ORDER.forEach((s) => (buckets[s] = 0));
    stands.forEach((s) => {
      const status = s['status'] as string;
      if (status in buckets) buckets[status] += 1;
    });
    const textColor = this.themeTextColor();

    this.standStatusChartData = {
      labels: RESOURCE_STATUS_ORDER,
      datasets: [
        {
          data: RESOURCE_STATUS_ORDER.map((s) => buckets[s]),
          backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
          hoverBackgroundColor: ['#16a34a', '#2563eb', '#d97706', '#dc2626']
        }
      ]
    };
    this.doughnutOptions = {
      plugins: { legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true } } },
      cutout: '65%'
    };
  }

  private buildConflictTypeChart(conflicts: GenericRow[]): void {
    const buckets: Record<string, number> = {};
    CONFLICT_TYPE_ORDER.forEach((t) => (buckets[t] = 0));
    conflicts.forEach((c) => {
      const type = c['conflictType'] as string;
      if (type in buckets) buckets[type] += 1;
    });
    const textColor = this.themeTextColor();

    this.conflictTypeChartData = {
      labels: CONFLICT_TYPE_ORDER,
      datasets: [
        {
          label: 'Conflicts',
          data: CONFLICT_TYPE_ORDER.map((t) => buckets[t]),
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

  reload(): void {
    this.loader.reload();
  }
}
