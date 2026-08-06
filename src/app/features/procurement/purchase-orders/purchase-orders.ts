import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { fromDateOnly, toRequiredDateOnly } from '../../../core/utils/date.util';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type PoStatus = 'Draft' | 'Submitted' | 'Approved' | 'Received' | 'Cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  orderDate: string;
  expectedDelivery: string;
  itemCount: number;
  totalAmount: number;
  status: PoStatus;
}

const RESOURCE = 'purchase-orders';
const STATUSES: PoStatus[] = ['Draft', 'Submitted', 'Approved', 'Received', 'Cancelled'];
const STATUS_SEVERITY: Record<PoStatus, TagSeverity> = {
  Draft: 'secondary',
  Submitted: 'info',
  Approved: 'warn',
  Received: 'success',
  Cancelled: 'danger'
};

@Component({
  selector: 'app-purchase-orders',
  imports: [
    DatePipe,
    CurrencyPipe,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    PageHeader,
    StatCard
  ],
  templateUrl: './purchase-orders.html'
})
export class PurchaseOrdersPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly statuses = STATUSES;

  orders = signal<PurchaseOrder[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingOrder = signal<PurchaseOrder | null>(null);
  saving = signal(false);

  stats = computed(() => {
    const rows = this.orders();
    return {
      total: rows.length,
      pending: rows.filter((o) => o.status === 'Submitted' || o.status === 'Draft').length,
      approved: rows.filter((o) => o.status === 'Approved').length,
      totalSpend: rows.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.totalAmount, 0)
    };
  });

  form = this.fb.nonNullable.group({
    poNumber: ['', Validators.required],
    vendor: ['', Validators.required],
    orderDate: this.fb.control<Date | null>(new Date(), Validators.required),
    expectedDelivery: this.fb.control<Date | null>(null, Validators.required),
    itemCount: [1, [Validators.required, Validators.min(1)]],
    totalAmount: [0, [Validators.required, Validators.min(0)]],
    status: this.fb.control<PoStatus>('Draft', { nonNullable: true, validators: Validators.required })
  });

  ngOnInit(): void {
    this.load();
  }

  severity(status: PoStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  openNew(): void {
    this.editingOrder.set(null);
    this.form.reset({ status: 'Draft', orderDate: new Date(), itemCount: 1, totalAmount: 0, poNumber: '', vendor: '' });
    this.dialogVisible.set(true);
  }

  openEdit(order: PurchaseOrder): void {
    this.editingOrder.set(order);
    this.form.setValue({
      poNumber: order.poNumber,
      vendor: order.vendor,
      orderDate: fromDateOnly(order.orderDate),
      expectedDelivery: fromDateOnly(order.expectedDelivery),
      itemCount: order.itemCount,
      totalAmount: order.totalAmount,
      status: order.status
    });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload = {
      ...value,
      orderDate: toRequiredDateOnly(value.orderDate, 'Order Date'),
      expectedDelivery: toRequiredDateOnly(value.expectedDelivery, 'Expected Delivery')
    };
    const editing = this.editingOrder();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<PurchaseOrder>(RESOURCE, editing.id, payload)
      : this.api.create<PurchaseOrder>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({ severity: 'success', summary: editing ? 'PO updated' : 'PO created', detail: payload.poNumber });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(order: PurchaseOrder): void {
    this.confirmation.confirm({
      header: 'Delete Purchase Order',
      message: `Delete PO ${order.poNumber} for ${order.vendor}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, order.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Deleted', detail: `PO ${order.poNumber} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<PurchaseOrder>(RESOURCE).subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load purchase orders.' });
      }
    });
  }
}
