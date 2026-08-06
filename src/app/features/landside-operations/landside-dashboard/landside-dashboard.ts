import { DatePipe } from '@angular/common';
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

type GenericRow = Record<string, unknown> & { id: string };

interface QuickLink {
  label: string;
  icon: string;
  route: string[];
}

const CURB_STATUS_ORDER = ['Within Limit', 'Dwell Exceeded', 'Citation Issued', 'Cleared'];
const SERVICE_TYPE_ORDER = ['Terminal Shuttle', 'Hotel Connector', 'Rental Car Shuttle', 'Employee Shuttle', 'Remote Parking Shuttle'];

const ADVISORY_SEVERITY: Record<string, TagSeverity> = {
  Active: 'danger',
  Monitoring: 'warn',
  Cleared: 'success'
};

@Component({
  selector: 'app-landside-dashboard',
  imports: [RouterLink, DatePipe, ChartModule, TableModule, TagModule, PageHeader, StatCard],
  templateUrl: './landside-dashboard.html',
  styleUrl: './landside-dashboard.scss'
})
export class LandsideDashboardPage implements OnInit {
  private readonly api = inject(ApiService);

  loading = signal(true);
  stats = signal({
    curbZonesWithinLimit: 0,
    curbDwellExceeded: 0,
    activePermits: 0,
    shuttlesEnRoute: 0,
    avgParkingOccupancyPct: 0,
    vehiclesQueued: 0,
    activeTrafficAdvisories: 0
  });
  activeAdvisories = signal<GenericRow[]>([]);

  curbStatusChartData: unknown = null;
  dispatchByServiceChartData: unknown = null;
  doughnutOptions: unknown = null;
  barOptions: unknown = null;

  quickLinks: QuickLink[] = [
    { label: 'Curbside Management', icon: 'pi-map', route: ['/landside-operations', 'curbside-management'] },
    { label: 'Commercial Vehicle Permits', icon: 'pi-id-card', route: ['/landside-operations', 'commercial-vehicle-permits'] },
    { label: 'Ground Transportation Dispatch', icon: 'pi-directions-alt', route: ['/landside-operations', 'ground-transportation-dispatch'] },
    { label: 'Public Parking Management', icon: 'pi-car', route: ['/landside-operations', 'public-parking-management'] },
    { label: 'Taxi & Rideshare Queue', icon: 'pi-users', route: ['/landside-operations', 'taxi-rideshare-queue'] },
    { label: 'Terminal Curb Access Control', icon: 'pi-key', route: ['/landside-operations', 'terminal-curb-access-control'] }
  ];

  ngOnInit(): void {
    forkJoin({
      curbside: this.api.list<GenericRow>('curbside-management'),
      permits: this.api.list<GenericRow>('commercial-vehicle-permits'),
      dispatch: this.api.list<GenericRow>('ground-transportation-dispatch'),
      parking: this.api.list<GenericRow>('public-parking-management'),
      queue: this.api.list<GenericRow>('taxi-rideshare-queue'),
      traffic: this.api.list<GenericRow>('road-traffic-circulation')
    }).subscribe(({ curbside, permits, dispatch, parking, queue, traffic }) => {
      this.computeStats(curbside.data, permits.data, dispatch.data, parking.data, queue.data, traffic.data);
      this.buildCurbStatusChart(curbside.data);
      this.buildDispatchChart(dispatch.data);
      this.activeAdvisories.set(traffic.data.filter((t) => t['status'] === 'Active').slice(0, 6));
      this.loading.set(false);
    });
  }

  advisorySeverity(status: unknown): TagSeverity {
    return ADVISORY_SEVERITY[status as string] ?? 'secondary';
  }

  private computeStats(
    curbside: GenericRow[],
    permits: GenericRow[],
    dispatch: GenericRow[],
    parking: GenericRow[],
    queue: GenericRow[],
    traffic: GenericRow[]
  ): void {
    const totalSpaces = parking.reduce((sum, p) => sum + (Number(p['totalSpaces']) || 0), 0);
    const occupiedSpaces = parking.reduce((sum, p) => sum + (Number(p['occupiedSpaces']) || 0), 0);

    this.stats.set({
      curbZonesWithinLimit: curbside.filter((c) => c['status'] === 'Within Limit').length,
      curbDwellExceeded: curbside.filter((c) => c['status'] === 'Dwell Exceeded' || c['status'] === 'Citation Issued').length,
      activePermits: permits.filter((p) => p['status'] === 'Active').length,
      shuttlesEnRoute: dispatch.filter((d) => d['status'] === 'En Route').length,
      avgParkingOccupancyPct: totalSpaces ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0,
      vehiclesQueued: queue.filter((q) => q['status'] === 'Waiting').length,
      activeTrafficAdvisories: traffic.filter((t) => t['status'] === 'Active').length
    });
  }

  private themeTextColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--p-text-muted-color') || '#64748b';
  }

  private buildCurbStatusChart(curbside: GenericRow[]): void {
    const buckets: Record<string, number> = {};
    CURB_STATUS_ORDER.forEach((s) => (buckets[s] = 0));
    curbside.forEach((c) => {
      const status = c['status'] as string;
      if (status in buckets) buckets[status] += 1;
    });
    const textColor = this.themeTextColor();

    this.curbStatusChartData = {
      labels: CURB_STATUS_ORDER,
      datasets: [
        {
          data: CURB_STATUS_ORDER.map((s) => buckets[s]),
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#64748b'],
          hoverBackgroundColor: ['#16a34a', '#d97706', '#dc2626', '#475569']
        }
      ]
    };
    this.doughnutOptions = {
      plugins: { legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true } } },
      cutout: '65%'
    };
  }

  private buildDispatchChart(dispatch: GenericRow[]): void {
    const buckets: Record<string, number> = {};
    SERVICE_TYPE_ORDER.forEach((t) => (buckets[t] = 0));
    dispatch.forEach((d) => {
      const type = d['serviceType'] as string;
      if (type in buckets) buckets[type] += 1;
    });
    const textColor = this.themeTextColor();

    this.dispatchByServiceChartData = {
      labels: SERVICE_TYPE_ORDER,
      datasets: [
        {
          label: 'Runs',
          data: SERVICE_TYPE_ORDER.map((t) => buckets[t]),
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
