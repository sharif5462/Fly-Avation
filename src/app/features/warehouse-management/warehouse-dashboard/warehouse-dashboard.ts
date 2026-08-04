import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';

import { TagSeverity } from '../../../core/models/entity-config.model';
import { ItemMaster } from '../../../core/models/warehouse-management.model';
import { ApiService } from '../../../core/services/api.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import type { PoStatus, PurchaseOrder } from '../../procurement/purchase-orders/purchase-orders';

interface QuickLink {
  label: string;
  icon: string;
  route: string[];
}

interface GrnRow {
  id: string;
  grnNo: string;
  poNumber: string;
  vendor: string;
  receivedDate: string;
  status: string;
}

const PO_PENDING_STATUSES: PoStatus[] = ['Draft', 'Submitted', 'Approved'];
const GRN_PENDING_STATUSES = ['Pending', 'Partially Received'];

@Component({
  selector: 'app-warehouse-dashboard',
  imports: [RouterLink, ChartModule, TableModule, TagModule, PageHeader, StatCard],
  templateUrl: './warehouse-dashboard.html',
  styleUrl: './warehouse-dashboard.scss'
})
export class WarehouseDashboardPage implements OnInit {
  private readonly api = inject(ApiService);

  loading = signal(true);
  stats = signal({ totalItems: 0, lowStock: 0, pendingOrders: 0, pendingGrns: 0 });
  lowStockItems = signal<ItemMaster[]>([]);

  categoryChartData: unknown = null;
  typeChartData: unknown = null;
  doughnutOptions: unknown = null;
  barOptions: unknown = null;

  quickLinks: QuickLink[] = [
    { label: 'Item Master', icon: 'pi-box', route: ['/warehouse-management', 'item-master'] },
    { label: 'Goods Receive (GRN)', icon: 'pi-inbox', route: ['/warehouse-management', 'goods-receiving'] },
    { label: 'Stock Issue', icon: 'pi-sign-out', route: ['/warehouse-management', 'stock-issue'] },
    { label: 'Purchase Order', icon: 'pi-shopping-cart', route: ['/warehouse-management', 'purchase-orders'] }
  ];

  ngOnInit(): void {
    forkJoin({
      items: this.api.list<ItemMaster>('item-master'),
      purchaseOrders: this.api.list<PurchaseOrder>('purchase-orders'),
      grns: this.api.list<GrnRow>('goods-receiving')
    }).subscribe(({ items, purchaseOrders, grns }) => {
      this.computeStats(items.data, purchaseOrders.data, grns.data);
      this.buildCategoryChart(items.data);
      this.buildTypeChart(items.data);
      this.lowStockItems.set(items.data.filter((i) => i.currentStock <= i.reorderLevel).slice(0, 6));
      this.loading.set(false);
    });
  }

  private computeStats(items: ItemMaster[], orders: PurchaseOrder[], grns: GrnRow[]): void {
    const lowStock = items.filter((i) => i.currentStock <= i.reorderLevel).length;
    const pendingOrders = orders.filter((o) => PO_PENDING_STATUSES.includes(o.status)).length;
    const pendingGrns = grns.filter((g) => GRN_PENDING_STATUSES.includes(g.status)).length;
    this.stats.set({ totalItems: items.length, lowStock, pendingOrders, pendingGrns });
  }

  private themeTextColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--p-text-muted-color') || '#64748b';
  }

  private buildCategoryChart(items: ItemMaster[]): void {
    const buckets: Record<string, number> = {};
    items.forEach((i) => (buckets[i.itemCategory] = (buckets[i.itemCategory] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.categoryChartData = {
      labels: Object.keys(buckets),
      datasets: [
        {
          data: Object.values(buckets),
          backgroundColor: ['#134bd1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#64748b', '#84cc16', '#f97316'],
          hoverBackgroundColor: ['#0f3fb0', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0284c7', '#db2777', '#475569', '#65a30d', '#ea580c']
        }
      ]
    };
    this.doughnutOptions = {
      plugins: { legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true } } },
      cutout: '65%'
    };
  }

  private buildTypeChart(items: ItemMaster[]): void {
    const order = ['Rotable', 'Repairable', 'Consumable', 'Expendable', 'Tool', 'Raw Material'];
    const buckets: Record<string, number> = {};
    order.forEach((t) => (buckets[t] = 0));
    items.forEach((i) => (buckets[i.itemType] = (buckets[i.itemType] ?? 0) + 1));
    const textColor = this.themeTextColor();

    this.typeChartData = {
      labels: order,
      datasets: [
        {
          label: 'Items',
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

  stockSeverity(): TagSeverity {
    return 'danger';
  }
}
