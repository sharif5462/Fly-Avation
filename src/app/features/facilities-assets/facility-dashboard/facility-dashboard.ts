import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';

import { TagSeverity } from '../../../core/models/entity-config.model';
import {
  ASSET_CONDITION_SEVERITY,
  ASSET_STATUS_SEVERITY,
  AssetCondition,
  AssetMaster,
  AssetStatus
} from '../../../core/models/facilities-assets.model';
import { ApiService } from '../../../core/services/api.service';
import { createDashboardLoader } from '../../../core/utils/dashboard-loader';
import { daysUntil } from '../../../core/utils/date.util';
import { LoadError } from '../../../shared/components/load-error/load-error';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

interface QuickLink {
  label: string;
  icon: string;
  route: string[];
}

interface FacilityWorkOrderRow {
  id: string;
  workOrderNo: string;
  facility: string;
  status: string;
}

const OPEN_WO_STATUSES = ['Open', 'In Progress', 'Pending'];
const CERT_HORIZON_DAYS = 90;

@Component({
  selector: 'app-facility-dashboard',
  imports: [LoadError, RouterLink, ChartModule, TableModule, TagModule, PageHeader, StatCard],
  templateUrl: './facility-dashboard.html',
  styleUrl: './facility-dashboard.scss'
})
export class FacilityDashboardPage {
  private readonly api = inject(ApiService);

  stats = signal({ totalAssets: 0, needsAttention: 0, openWorkOrders: 0, certsExpiringSoon: 0 });
  attentionAssets = signal<AssetMaster[]>([]);

  categoryChartData: unknown = null;
  conditionChartData: unknown = null;
  doughnutOptions: unknown = null;
  barOptions: unknown = null;

  quickLinks: QuickLink[] = [
    { label: 'Asset Master', icon: 'pi-box', route: ['/facilities-assets', 'asset-master'] },
    { label: 'Facility Work Orders', icon: 'pi-clipboard', route: ['/facilities-assets', 'facility-work-orders'] },
    { label: 'Preventive Maintenance', icon: 'pi-shield', route: ['/facilities-assets', 'facility-preventive-maintenance'] },
    { label: 'GSE Fleet Registry', icon: 'pi-truck', route: ['/facilities-assets', 'gse-fleet-registry'] }
  ];

  /**
   * Fans out to every resource this dashboard renders. createDashboardLoader
   * owns the loading/failed state, the teardown, and the retry — a failed
   * forkJoin used to leave the page spinning forever.
   */
  private readonly loader = createDashboardLoader(
    () => forkJoin({
      assets: this.api.list<AssetMaster>('asset-master'),
      workOrders: this.api.list<FacilityWorkOrderRow>('facility-work-orders')
    }),
    ({ assets, workOrders }) => {
        this.computeStats(assets.data, workOrders.data);
        this.buildCategoryChart(assets.data);
        this.buildConditionChart(assets.data);
        this.attentionAssets.set(
          assets.data
            .filter((a) => a.status === 'Under Maintenance' || a.status === 'Out of Service' || this.isCertExpiringSoon(a))
            .slice(0, 6)
        );
    }
  );

  readonly loading = this.loader.loading;
  readonly loadFailed = this.loader.failed;

  private isCertExpiringSoon(asset: AssetMaster): boolean {
    const days = daysUntil(asset.certificationExpiry);
    return days !== null && days >= 0 && days <= CERT_HORIZON_DAYS;
  }

  private computeStats(assets: AssetMaster[], workOrders: FacilityWorkOrderRow[]): void {
    const needsAttention = assets.filter((a) => a.status === 'Under Maintenance' || a.status === 'Out of Service').length;
    const openWorkOrders = workOrders.filter((w) => OPEN_WO_STATUSES.includes(w.status)).length;
    const certsExpiringSoon = assets.filter((a) => this.isCertExpiringSoon(a)).length;
    this.stats.set({ totalAssets: assets.length, needsAttention, openWorkOrders, certsExpiringSoon });
  }

  private themeTextColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--p-text-muted-color') || '#64748b';
  }

  private buildCategoryChart(assets: AssetMaster[]): void {
    const buckets: Record<string, number> = {};
    assets.forEach((a) => (buckets[a.assetCategory] = (buckets[a.assetCategory] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.categoryChartData = {
      labels: Object.keys(buckets),
      datasets: [
        {
          data: Object.values(buckets),
          backgroundColor: ['#134bd1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#64748b', '#84cc16', '#f97316', '#14b8a6', '#a855f7'],
          hoverBackgroundColor: ['#0f3fb0', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0284c7', '#db2777', '#475569', '#65a30d', '#ea580c', '#0d9488', '#9333ea']
        }
      ]
    };
    this.doughnutOptions = {
      plugins: { legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true } } },
      cutout: '65%'
    };
  }

  private buildConditionChart(assets: AssetMaster[]): void {
    const order: AssetCondition[] = ['Excellent', 'Good', 'Fair', 'Poor', 'Out of Service'];
    const buckets: Record<string, number> = {};
    order.forEach((c) => (buckets[c] = 0));
    assets.forEach((a) => (buckets[a.condition] = (buckets[a.condition] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.conditionChartData = {
      labels: order,
      datasets: [
        {
          label: 'Assets',
          data: order.map((c) => buckets[c]),
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

  conditionSeverity(condition: AssetCondition): TagSeverity {
    return ASSET_CONDITION_SEVERITY[condition];
  }

  statusSeverity(status: AssetStatus): TagSeverity {
    return ASSET_STATUS_SEVERITY[status];
  }

  reload(): void {
    this.loader.reload();
  }
}
