import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';

import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import type { BaggageRecord, BaggageStatus } from '../baggage-handling/baggage-handling';

type GenericRow = Record<string, unknown> & { id: string };

interface QuickLink {
  label: string;
  icon: string;
  route: string[];
}

const ACTIVE_STATUSES: BaggageStatus[] = ['Checked In', 'Screened', 'Sorted', 'Loaded', 'In Transfer'];
const OPEN_CASE_STATUSES = ['Open', 'Tracing'];

const CATEGORY_SEVERITY: Record<string, TagSeverity> = {
  Delayed: 'warn',
  Damaged: 'danger',
  Pilfered: 'danger',
  Lost: 'contrast'
};

@Component({
  selector: 'app-baggage-handling-dashboard',
  imports: [RouterLink, ChartModule, TableModule, TagModule, PageHeader, StatCard],
  templateUrl: './baggage-handling-dashboard.html',
  styleUrl: './baggage-handling-dashboard.scss'
})
export class BaggageHandlingDashboardPage implements OnInit {
  private readonly api = inject(ApiService);

  loading = signal(true);
  stats = signal({
    bagsInSystem: 0,
    trackingCompletionPct: 0,
    openMishandledCases: 0,
    openScreeningAlarms: 0,
    brsDiscrepancies: 0,
    inTransfer: 0
  });
  openCases = signal<GenericRow[]>([]);

  statusChartData: unknown = null;
  bagTypeChartData: unknown = null;
  doughnutOptions: unknown = null;
  barOptions: unknown = null;

  quickLinks: QuickLink[] = [
    { label: 'Baggage Handling', icon: 'pi-briefcase', route: ['/airport-operations', 'baggage-handling'] },
    { label: 'Baggage Reconciliation (BRS)', icon: 'pi-verified', route: ['/airport-operations', 'baggage-reconciliation'] },
    { label: 'Baggage Screening', icon: 'pi-shield', route: ['/airport-operations', 'baggage-screening'] },
    { label: 'Mishandled Baggage / Lost & Found', icon: 'pi-search', route: ['/airport-operations', 'mishandled-baggage'] }
  ];

  ngOnInit(): void {
    forkJoin({
      bags: this.api.list<BaggageRecord>('baggage-handling'),
      reconciliation: this.api.list<GenericRow>('baggage-reconciliation'),
      screening: this.api.list<GenericRow>('baggage-screening'),
      mishandled: this.api.list<GenericRow>('mishandled-baggage')
    }).subscribe(({ bags, reconciliation, screening, mishandled }) => {
      this.computeStats(bags.data, reconciliation.data, screening.data, mishandled.data);
      this.buildStatusChart(bags.data);
      this.buildBagTypeChart(bags.data);
      this.openCases.set(mishandled.data.filter((c) => OPEN_CASE_STATUSES.includes(c['status'] as string)).slice(0, 6));
      this.loading.set(false);
    });
  }

  categorySeverity(category: unknown): TagSeverity {
    return CATEGORY_SEVERITY[category as string] ?? 'secondary';
  }

  private isFullyTracked(bag: BaggageRecord): boolean {
    const needsTransfer = bag.routeType === 'Transfer';
    return !!bag.checkedInTime && !!bag.loadedTime && !!bag.arrivedTime && (!needsTransfer || !!bag.transferTime);
  }

  private computeStats(bags: BaggageRecord[], reconciliation: GenericRow[], screening: GenericRow[], mishandled: GenericRow[]): void {
    const bagsInSystem = bags.filter((b) => ACTIVE_STATUSES.includes(b.status)).length;
    const fullyTracked = bags.filter((b) => this.isFullyTracked(b)).length;
    const trackingCompletionPct = bags.length ? Math.round((fullyTracked / bags.length) * 100) : 0;

    this.stats.set({
      bagsInSystem,
      trackingCompletionPct,
      openMishandledCases: mishandled.filter((c) => OPEN_CASE_STATUSES.includes(c['status'] as string)).length,
      openScreeningAlarms: screening.filter((s) => s['result'] === 'Alarm').length,
      brsDiscrepancies: reconciliation.filter((r) => r['status'] === 'Discrepancy').length,
      inTransfer: bags.filter((b) => b.routeType === 'Transfer' && b.status !== 'Arrived' && b.status !== 'Delivered').length
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
}
