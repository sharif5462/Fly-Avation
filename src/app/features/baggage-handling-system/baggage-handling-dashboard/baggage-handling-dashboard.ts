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
import type { BaggageRecord, BaggageStatus } from '../baggage-handling/baggage-handling';

type GenericRow = Record<string, unknown> & { id: string };

interface QuickLink {
  label: string;
  icon: string;
  route: string[];
}

interface DashboardSources {
  bags: { data: BaggageRecord[] };
  reconciliation: { data: GenericRow[] };
  screening: { data: GenericRow[] };
  mishandled: { data: GenericRow[] };
  equipment: { data: GenericRow[] };
  faults: { data: GenericRow[] };
  transfers: { data: GenericRow[] };
  ebs: { data: GenericRow[] };
  messaging: { data: GenericRow[] };
  certifications: { data: GenericRow[] };
  sla: { data: GenericRow[] };
  claims: { data: GenericRow[] };
}

const ACTIVE_STATUSES: BaggageStatus[] = ['Checked In', 'Screened', 'Sorted', 'Loaded', 'In Transfer'];
const OPEN_CASE_STATUSES = ['Open', 'Tracing'];
const OPEN_FAULT_STATUSES = ['Open', 'Under Repair'];
const HOT_BAG_STATUSES = ['Short Connection', 'Hot Bag — Expedite'];

/**
 * Industry benchmark from SITA's Baggage IT Insights: the global mishandling
 * rate sits at roughly 6.3 bags per 1,000 passengers. The KPI card colours
 * itself against this rather than against an arbitrary internal target.
 */
const MISHANDLE_BENCHMARK_PER_1K = 6.3;

const CATEGORY_SEVERITY: Record<string, TagSeverity> = {
  Delayed: 'warn',
  Damaged: 'danger',
  Pilfered: 'danger',
  Lost: 'contrast'
};

const FAULT_SEVERITY: Record<string, TagSeverity> = {
  Critical: 'danger',
  Major: 'warn',
  Minor: 'info',
  Warning: 'secondary'
};

@Component({
  selector: 'app-baggage-handling-dashboard',
  imports: [LoadError, RouterLink, ChartModule, TableModule, TagModule, PageHeader, StatCard],
  templateUrl: './baggage-handling-dashboard.html',
  styleUrl: './baggage-handling-dashboard.scss'
})
export class BaggageHandlingDashboardPage {
  private readonly api = inject(ApiService);

  readonly benchmark = MISHANDLE_BENCHMARK_PER_1K;

  stats = signal({
    bagsInSystem: 0,
    trackingCompletionPct: 0,
    openMishandledCases: 0,
    openScreeningAlarms: 0,
    brsDiscrepancies: 0,
    inTransfer: 0,
    mishandledPerThousandPax: 0,
    equipmentAvailabilityPct: 0,
    openFaults: 0,
    criticalFaults: 0,
    hotBags: 0,
    ebsStored: 0,
    unmatchedMessages: 0,
    expiringCertifications: 0,
    openClaimValue: 0
  });
  openCases = signal<GenericRow[]>([]);
  openFaults = signal<GenericRow[]>([]);

  statusChartData: unknown = null;
  bagTypeChartData: unknown = null;
  equipmentChartData: unknown = null;
  doughnutOptions: unknown = null;
  barOptions: unknown = null;

  quickLinks: QuickLink[] = [
    { label: 'Bag Tracking (Res. 753)', icon: 'pi-briefcase', route: ['/baggage-handling-system', 'baggage-handling'] },
    { label: 'Hold Baggage Screening (HBS)', icon: 'pi-shield', route: ['/baggage-handling-system', 'baggage-screening'] },
    { label: 'Transfer & Hot Bags', icon: 'pi-sync', route: ['/baggage-handling-system', 'transfer-baggage'] },
    { label: 'BHS Equipment Registry', icon: 'pi-cog', route: ['/baggage-handling-system', 'bhs-equipment'] },
    { label: 'Fault, Jam & SCADA Alarms', icon: 'pi-exclamation-triangle', route: ['/baggage-handling-system', 'bhs-fault-log'] },
    { label: 'Mishandled Baggage / Lost & Found', icon: 'pi-search', route: ['/baggage-handling-system', 'mishandled-baggage'] }
  ];

  /**
   * Fans out to every resource this dashboard renders. createDashboardLoader
   * owns the loading/failed state, the teardown, and the retry — a failed
   * forkJoin used to leave the page spinning forever.
   */
  private readonly loader = createDashboardLoader(
    () => forkJoin({
      bags: this.api.list<BaggageRecord>('baggage-handling'),
      reconciliation: this.api.list<GenericRow>('baggage-reconciliation'),
      screening: this.api.list<GenericRow>('baggage-screening'),
      mishandled: this.api.list<GenericRow>('mishandled-baggage'),
      equipment: this.api.list<GenericRow>('bhs-equipment'),
      faults: this.api.list<GenericRow>('bhs-fault-log'),
      transfers: this.api.list<GenericRow>('transfer-baggage'),
      ebs: this.api.list<GenericRow>('early-bag-storage'),
      messaging: this.api.list<GenericRow>('baggage-messaging'),
      certifications: this.api.list<GenericRow>('hbs-machine-certification'),
      sla: this.api.list<GenericRow>('baggage-sla-performance'),
      claims: this.api.list<GenericRow>('baggage-claims')
    }),
    (sources) => {
        this.computeStats(sources);
        this.buildStatusChart(sources.bags.data);
        this.buildBagTypeChart(sources.bags.data);
        this.buildEquipmentChart(sources.equipment.data);
        this.openCases.set(sources.mishandled.data.filter((c) => OPEN_CASE_STATUSES.includes(c['status'] as string)).slice(0, 6));
        this.openFaults.set(sources.faults.data.filter((fl) => OPEN_FAULT_STATUSES.includes(fl['status'] as string)).slice(0, 6));
    }
  );

  readonly loading = this.loader.loading;
  readonly loadFailed = this.loader.failed;

  categorySeverity(category: unknown): TagSeverity {
    return CATEGORY_SEVERITY[category as string] ?? 'secondary';
  }

  faultSeverity(severity: unknown): TagSeverity {
    return FAULT_SEVERITY[severity as string] ?? 'secondary';
  }

  /** Green at or under the industry benchmark, amber up to 1.5x it, red beyond. */
  mishandleIconColor(): string {
    const rate = this.stats().mishandledPerThousandPax;
    if (rate <= MISHANDLE_BENCHMARK_PER_1K) return 'var(--p-green-500)';
    if (rate <= MISHANDLE_BENCHMARK_PER_1K * 1.5) return 'var(--p-yellow-600)';
    return 'var(--p-red-500)';
  }

  mishandleIconBg(): string {
    const rate = this.stats().mishandledPerThousandPax;
    if (rate <= MISHANDLE_BENCHMARK_PER_1K) return 'color-mix(in srgb, var(--p-green-500) 15%, transparent)';
    if (rate <= MISHANDLE_BENCHMARK_PER_1K * 1.5) return 'color-mix(in srgb, var(--p-yellow-500) 15%, transparent)';
    return 'color-mix(in srgb, var(--p-red-500) 15%, transparent)';
  }

  private isFullyTracked(bag: BaggageRecord): boolean {
    const needsTransfer = bag.routeType === 'Transfer';
    return !!bag.checkedInTime && !!bag.loadedTime && !!bag.arrivedTime && (!needsTransfer || !!bag.transferTime);
  }

  private average(rows: GenericRow[], key: string): number {
    const values = rows.map((row) => Number(row[key])).filter((n) => Number.isFinite(n));
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private computeStats(sources: DashboardSources): void {
    const bags = sources.bags.data;
    const bagsInSystem = bags.filter((b) => ACTIVE_STATUSES.includes(b.status)).length;
    const fullyTracked = bags.filter((b) => this.isFullyTracked(b)).length;
    const trackingCompletionPct = bags.length ? Math.round((fullyTracked / bags.length) * 100) : 0;

    const equipment = sources.equipment.data;
    const operational = equipment.filter((e) => e['status'] === 'Operational').length;
    const openFaults = sources.faults.data.filter((fl) => OPEN_FAULT_STATUSES.includes(fl['status'] as string));
    const openClaims = sources.claims.data.filter((c) => c['status'] !== 'Settled' && c['status'] !== 'Rejected');

    this.stats.set({
      bagsInSystem,
      trackingCompletionPct,
      openMishandledCases: sources.mishandled.data.filter((c) => OPEN_CASE_STATUSES.includes(c['status'] as string)).length,
      openScreeningAlarms: sources.screening.data.filter((s) => s['result'] === 'Alarm').length,
      brsDiscrepancies: sources.reconciliation.data.filter((x) => x['status'] === 'Discrepancy').length,
      inTransfer: bags.filter((b) => b.routeType === 'Transfer' && b.status !== 'Arrived' && b.status !== 'Delivered').length,
      mishandledPerThousandPax: Math.round(this.average(sources.sla.data, 'mishandledPerThousandPax') * 10) / 10,
      equipmentAvailabilityPct: equipment.length ? Math.round((operational / equipment.length) * 100) : 0,
      openFaults: openFaults.length,
      criticalFaults: openFaults.filter((fl) => fl['severity'] === 'Critical').length,
      hotBags: sources.transfers.data.filter((t) => HOT_BAG_STATUSES.includes(t['status'] as string)).length,
      ebsStored: sources.ebs.data.filter((e) => e['status'] === 'Stored').length,
      unmatchedMessages: sources.messaging.data.filter((m) => m['status'] === 'Unmatched' || m['status'] === 'Failed').length,
      expiringCertifications: sources.certifications.data.filter((c) => c['status'] === 'Expiring Soon' || c['status'] === 'Expired').length,
      openClaimValue: Math.round(openClaims.reduce((sum, c) => sum + (Number(c['claimedAmount']) || 0), 0))
    });
  }

  private themeTextColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--p-text-muted-color') || '#64748b';
  }

  private buildStatusChart(bags: BaggageRecord[]): void {
    const order: BaggageStatus[] = ['Checked In', 'Screened', 'Sorted', 'Loaded', 'In Transfer', 'Arrived', 'Delivered', 'Mishandled'];
    const buckets: Record<string, number> = {};
    order.forEach((s) => (buckets[s] = 0));
    bags.forEach((b) => (buckets[b.status] = (buckets[b.status] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.statusChartData = {
      labels: order,
      datasets: [
        {
          data: order.map((s) => buckets[s]),
          backgroundColor: ['#0ea5e9', '#8b5cf6', '#64748b', '#f59e0b', '#f97316', '#22c55e', '#16a34a', '#ef4444'],
          hoverBackgroundColor: ['#0284c7', '#7c3aed', '#475569', '#d97706', '#ea580c', '#16a34a', '#15803d', '#dc2626']
        }
      ]
    };
    this.doughnutOptions = {
      plugins: { legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true } } },
      cutout: '65%'
    };
  }

  private buildBagTypeChart(bags: BaggageRecord[]): void {
    const order = ['Checked', 'Priority', 'Oversize', 'Fragile'];
    const buckets: Record<string, number> = {};
    order.forEach((t) => (buckets[t] = 0));
    bags.forEach((b) => (buckets[b.bagType] = (buckets[b.bagType] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.bagTypeChartData = {
      labels: order,
      datasets: [
        {
          label: 'Bags',
          data: order.map((t) => buckets[t]),
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

  /** Shares `doughnutOptions` with the bag-status chart — same legend/cutout styling. */
  private buildEquipmentChart(equipment: GenericRow[]): void {
    const order = ['Operational', 'Degraded', 'Under Maintenance', 'Out of Service'];
    const buckets: Record<string, number> = {};
    order.forEach((s) => (buckets[s] = 0));
    equipment.forEach((e) => {
      const status = e['status'] as string;
      if (status in buckets) buckets[status] += 1;
    });

    this.equipmentChartData = {
      labels: order,
      datasets: [
        {
          data: order.map((s) => buckets[s]),
          backgroundColor: ['#22c55e', '#f59e0b', '#0ea5e9', '#ef4444'],
          hoverBackgroundColor: ['#16a34a', '#d97706', '#0284c7', '#dc2626']
        }
      ]
    };
  }

  reload(): void {
    this.loader.reload();
  }
}
