import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';

import { TagSeverity } from '../../../core/models/entity-config.model';
import {
  HAZARD_STATUS_SEVERITY,
  HazardReport,
  HazardStatus,
  RISK_TOLERABILITY_SEVERITY,
  RiskTolerability
} from '../../../core/models/sms.model';
import { ApiService } from '../../../core/services/api.service';
import { createDashboardLoader } from '../../../core/utils/dashboard-loader';
import { LoadError } from '../../../shared/components/load-error/load-error';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

interface QuickLink {
  label: string;
  icon: string;
  route: string[];
}

interface CapaRow {
  id: string;
  capaNo: string;
  status: string;
}

const OPEN_CAPA_STATUSES = ['Open', 'In Progress'];

@Component({
  selector: 'app-sms-dashboard',
  imports: [LoadError, RouterLink, ChartModule, TableModule, TagModule, PageHeader, StatCard],
  templateUrl: './sms-dashboard.html',
  styleUrl: './sms-dashboard.scss'
})
export class SmsDashboardPage {
  private readonly api = inject(ApiService);

  stats = signal({ totalHazards: 0, openHazards: 0, unacceptableRisk: 0, openCapas: 0 });
  topHazards = signal<HazardReport[]>([]);

  categoryChartData: unknown = null;
  tolerabilityChartData: unknown = null;
  doughnutOptions: unknown = null;
  barOptions: unknown = null;

  quickLinks: QuickLink[] = [
    { label: 'Hazard Reporting', icon: 'pi-exclamation-circle', route: ['/safety-management-system', 'hazard-reporting'] },
    { label: 'Safety Risk Register', icon: 'pi-table', route: ['/safety-management-system', 'safety-risk-register'] },
    { label: 'Corrective & Preventive Actions', icon: 'pi-refresh', route: ['/safety-management-system', 'capa'] },
    { label: 'Safety Audits', icon: 'pi-search', route: ['/safety-management-system', 'audit-management'] }
  ];

  /**
   * Fans out to every resource this dashboard renders. createDashboardLoader
   * owns the loading/failed state, the teardown, and the retry — a failed
   * forkJoin used to leave the page spinning forever.
   */
  private readonly loader = createDashboardLoader(
    () => forkJoin({
      hazards: this.api.list<HazardReport>('hazard-reporting'),
      capas: this.api.list<CapaRow>('capa')
    }),
    ({ hazards, capas }) => {
        this.computeStats(hazards.data, capas.data);
        this.buildCategoryChart(hazards.data);
        this.buildTolerabilityChart(hazards.data);
        this.topHazards.set(
          [...hazards.data].filter((h) => h.status !== 'Closed').sort((a, b) => b.initialRiskScore - a.initialRiskScore).slice(0, 6)
        );
    }
  );

  readonly loading = this.loader.loading;
  readonly loadFailed = this.loader.failed;

  private computeStats(hazards: HazardReport[], capas: CapaRow[]): void {
    const openHazards = hazards.filter((h) => h.status !== 'Closed').length;
    const unacceptableRisk = hazards.filter((h) => h.riskTolerability === 'Unacceptable').length;
    const openCapas = capas.filter((c) => OPEN_CAPA_STATUSES.includes(c.status)).length;
    this.stats.set({ totalHazards: hazards.length, openHazards, unacceptableRisk, openCapas });
  }

  private themeTextColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--p-text-muted-color') || '#64748b';
  }

  private buildCategoryChart(hazards: HazardReport[]): void {
    const buckets: Record<string, number> = {};
    hazards.forEach((h) => (buckets[h.hazardCategory] = (buckets[h.hazardCategory] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.categoryChartData = {
      labels: Object.keys(buckets),
      datasets: [
        {
          data: Object.values(buckets),
          backgroundColor: ['#134bd1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'],
          hoverBackgroundColor: ['#0f3fb0', '#16a34a', '#d97706', '#dc2626', '#7c3aed']
        }
      ]
    };
    this.doughnutOptions = {
      plugins: { legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true } } },
      cutout: '65%'
    };
  }

  private buildTolerabilityChart(hazards: HazardReport[]): void {
    const order: RiskTolerability[] = ['Acceptable', 'Tolerable', 'Unacceptable'];
    const buckets: Record<string, number> = {};
    order.forEach((t) => (buckets[t] = 0));
    hazards.forEach((h) => (buckets[h.riskTolerability] = (buckets[h.riskTolerability] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.tolerabilityChartData = {
      labels: order,
      datasets: [
        {
          label: 'Hazards',
          data: order.map((t) => buckets[t]),
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
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

  statusSeverity(status: HazardStatus): TagSeverity {
    return HAZARD_STATUS_SEVERITY[status];
  }

  tolerabilitySeverity(tolerability: RiskTolerability): TagSeverity {
    return RISK_TOLERABILITY_SEVERITY[tolerability];
  }

  reload(): void {
    this.loader.reload();
  }
}
