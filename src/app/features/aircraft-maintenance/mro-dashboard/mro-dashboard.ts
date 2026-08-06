import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';

import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import type { TrackedComponent } from '../component-tracking/component-tracking';
import type { WorkOrder } from '../work-orders/work-orders';

type GenericRow = Record<string, unknown> & { id: string };

interface QuickLink {
  label: string;
  icon: string;
  route: string[];
}

const OPEN_WO_STATUSES = ['Open', 'In Progress', 'Awaiting Parts'];
const CERT_EXPIRY_WINDOW_DAYS = 60;

@Component({
  selector: 'app-mro-dashboard',
  imports: [RouterLink, DecimalPipe, ChartModule, TableModule, TagModule, ProgressBarModule, PageHeader, StatCard],
  templateUrl: './mro-dashboard.html',
  styleUrl: './mro-dashboard.scss'
})
export class MroDashboardPage implements OnInit {
  private readonly api = inject(ApiService);

  loading = signal(true);
  stats = signal({
    openWorkOrders: 0,
    criticalWorkOrders: 0,
    criticalComponents: 0,
    overdueAd: 0,
    expiringCertificates: 0,
    openServiceBulletins: 0,
    activeMelItems: 0
  });
  attentionComponents = signal<Array<TrackedComponent & { pct: number }>>([]);

  woStatusChartData: unknown = null;
  woTypeChartData: unknown = null;
  doughnutOptions: unknown = null;
  barOptions: unknown = null;

  quickLinks: QuickLink[] = [
    { label: 'Work Orders', icon: 'pi-clipboard', route: ['/aircraft-maintenance', 'work-orders'] },
    { label: 'Component Tracking', icon: 'pi-microchip', route: ['/aircraft-maintenance', 'component-tracking'] },
    { label: 'Maintenance Planning', icon: 'pi-calendar-clock', route: ['/aircraft-maintenance', 'maintenance-planning'] },
    { label: 'AD Compliance', icon: 'pi-exclamation-triangle', route: ['/aircraft-maintenance', 'ad-compliance'] },
    { label: 'MEL / CDL Tracking', icon: 'pi-list-check', route: ['/aircraft-maintenance', 'mel-cdl-tracking'] },
    { label: 'Service Bulletins', icon: 'pi-megaphone', route: ['/aircraft-maintenance', 'service-bulletin-management'] }
  ];

  ngOnInit(): void {
    forkJoin({
      workOrders: this.api.list<WorkOrder>('work-orders'),
      components: this.api.list<TrackedComponent>('component-tracking'),
      adCompliance: this.api.list<GenericRow>('ad-compliance'),
      certificates: this.api.list<GenericRow>('airworthiness-certificate'),
      serviceBulletins: this.api.list<GenericRow>('service-bulletin-management'),
      melItems: this.api.list<GenericRow>('mel-cdl-tracking')
    }).subscribe(({ workOrders, components, adCompliance, certificates, serviceBulletins, melItems }) => {
      this.computeStats(workOrders.data, components.data, adCompliance.data, certificates.data, serviceBulletins.data, melItems.data);
      this.buildWoStatusChart(workOrders.data);
      this.buildWoTypeChart(workOrders.data);
      this.computeAttentionComponents(components.data);
      this.loading.set(false);
    });
  }

  severityForPct(pct: number): TagSeverity {
    if (pct < 10) return 'danger';
    if (pct < 25) return 'warn';
    return 'success';
  }

  private computeStats(
    workOrders: WorkOrder[],
    components: TrackedComponent[],
    adCompliance: GenericRow[],
    certificates: GenericRow[],
    serviceBulletins: GenericRow[],
    melItems: GenericRow[]
  ): void {
    const now = Date.now();
    const withinWindow = (iso: unknown, days: number) => {
      if (typeof iso !== 'string' || !iso) return false;
      const diff = (new Date(iso).getTime() - now) / 86400000;
      return diff <= days;
    };

    this.stats.set({
      openWorkOrders: workOrders.filter((w) => OPEN_WO_STATUSES.includes(w.status)).length,
      criticalWorkOrders: workOrders.filter((w) => w.priority === 'Critical').length,
      criticalComponents: components.filter((c) => this.lifePctOf(c) !== null && this.lifePctOf(c)! < 25).length,
      overdueAd: adCompliance.filter((a) => a['status'] === 'Overdue').length,
      expiringCertificates: certificates.filter(
        (c) => c['status'] === 'Expired' || withinWindow(c['expiryDate'], CERT_EXPIRY_WINDOW_DAYS)
      ).length,
      openServiceBulletins: serviceBulletins.filter((s) => s['status'] === 'Open').length,
      activeMelItems: melItems.filter((m) => m['status'] === 'Deferred' || m['status'] === 'Extended').length
    });
  }

  private lifePctOf(c: TrackedComponent): number | null {
    if (c.lifeLimitHours == null || c.lifeLimitHours <= 0 || c.lifeRemainingHours == null) return null;
    return Math.max(0, Math.min(100, Math.round((c.lifeRemainingHours / c.lifeLimitHours) * 100)));
  }

  private computeAttentionComponents(components: TrackedComponent[]): void {
    const withPct = components
      .map((c) => ({ ...c, pct: this.lifePctOf(c) }))
      .filter((c): c is TrackedComponent & { pct: number } => c.pct !== null)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 6);
    this.attentionComponents.set(withPct);
  }

  private themeTextColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--p-text-muted-color') || '#64748b';
  }

  private buildWoStatusChart(workOrders: WorkOrder[]): void {
    const order = ['Open', 'In Progress', 'Awaiting Parts', 'Completed', 'Closed'];
    const buckets: Record<string, number> = {};
    order.forEach((s) => (buckets[s] = 0));
    workOrders.forEach((w) => (buckets[w.status] = (buckets[w.status] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.woStatusChartData = {
      labels: order,
      datasets: [
        {
          data: order.map((s) => buckets[s]),
          backgroundColor: ['#ef4444', '#f59e0b', '#0ea5e9', '#22c55e', '#64748b'],
          hoverBackgroundColor: ['#dc2626', '#d97706', '#0284c7', '#16a34a', '#475569']
        }
      ]
    };
    this.doughnutOptions = {
      plugins: { legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true } } },
      cutout: '65%'
    };
  }

  private buildWoTypeChart(workOrders: WorkOrder[]): void {
    const order = ['Scheduled', 'Unscheduled', 'AOG', 'Line Maintenance', 'Base Maintenance'];
    const buckets: Record<string, number> = {};
    order.forEach((t) => (buckets[t] = 0));
    workOrders.forEach((w) => (buckets[w.maintenanceType] = (buckets[w.maintenanceType] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.woTypeChartData = {
      labels: order,
      datasets: [
        {
          label: 'Work Orders',
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
