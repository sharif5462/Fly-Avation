import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { fromDateOnly, toRequiredDateOnly } from '../../../core/utils/date.util';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type WorkOrderType = 'Scheduled' | 'Unscheduled' | 'AOG' | 'Line Maintenance' | 'Base Maintenance';
export type WorkOrderPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type WorkOrderStatus = 'Open' | 'In Progress' | 'Awaiting Parts' | 'Completed' | 'Closed';

export interface WorkOrder {
  id: string;
  woNumber: string;
  aircraftReg: string;
  maintenanceType: WorkOrderType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedTechnician: string;
  openedDate: string;
  dueDate: string;
  description?: string;
}

const RESOURCE = 'work-orders';
const TYPES: WorkOrderType[] = ['Scheduled', 'Unscheduled', 'AOG', 'Line Maintenance', 'Base Maintenance'];
const PRIORITIES: WorkOrderPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: WorkOrderStatus[] = ['Open', 'In Progress', 'Awaiting Parts', 'Completed', 'Closed'];

const STATUS_SEVERITY: Record<WorkOrderStatus, TagSeverity> = {
  Open: 'danger',
  'In Progress': 'warn',
  'Awaiting Parts': 'info',
  Completed: 'success',
  Closed: 'secondary'
};
const PRIORITY_SEVERITY: Record<WorkOrderPriority, TagSeverity> = {
  Low: 'secondary',
  Medium: 'info',
  High: 'warn',
  Critical: 'danger'
};

@Component({
  selector: 'app-work-orders',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    PageHeader,
    StatCard
  ],
  templateUrl: './work-orders.html'
})
export class WorkOrdersPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly types = TYPES;
  readonly priorities = PRIORITIES;
  readonly statuses = STATUSES;

  workOrders = signal<WorkOrder[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingOrder = signal<WorkOrder | null>(null);
  saving = signal(false);

  stats = computed(() => {
    const rows = this.workOrders();
    return {
      total: rows.length,
      open: rows.filter((w) => w.status === 'Open' || w.status === 'In Progress').length,
      critical: rows.filter((w) => w.priority === 'Critical').length,
      completed: rows.filter((w) => w.status === 'Completed' || w.status === 'Closed').length
    };
  });

  form = this.fb.nonNullable.group({
    woNumber: ['', Validators.required],
    aircraftReg: ['', Validators.required],
    maintenanceType: this.fb.control<WorkOrderType>('Scheduled', { nonNullable: true, validators: Validators.required }),
    priority: this.fb.control<WorkOrderPriority>('Medium', { nonNullable: true, validators: Validators.required }),
    status: this.fb.control<WorkOrderStatus>('Open', { nonNullable: true, validators: Validators.required }),
    assignedTechnician: ['', Validators.required],
    openedDate: this.fb.control<Date | null>(new Date(), Validators.required),
    dueDate: this.fb.control<Date | null>(null, Validators.required),
    description: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  statusSeverity(status: WorkOrderStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  prioritySeverity(priority: WorkOrderPriority): TagSeverity {
    return PRIORITY_SEVERITY[priority];
  }

  openNew(): void {
    this.editingOrder.set(null);
    this.form.reset({
      maintenanceType: 'Scheduled',
      priority: 'Medium',
      status: 'Open',
      openedDate: new Date(),
      woNumber: '',
      aircraftReg: '',
      assignedTechnician: '',
      description: ''
    });
    this.dialogVisible.set(true);
  }

  openEdit(order: WorkOrder): void {
    this.editingOrder.set(order);
    this.form.setValue({
      woNumber: order.woNumber,
      aircraftReg: order.aircraftReg,
      maintenanceType: order.maintenanceType,
      priority: order.priority,
      status: order.status,
      assignedTechnician: order.assignedTechnician,
      openedDate: fromDateOnly(order.openedDate),
      dueDate: fromDateOnly(order.dueDate),
      description: order.description ?? ''
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
      openedDate: toRequiredDateOnly(value.openedDate, 'Opened Date'),
      dueDate: toRequiredDateOnly(value.dueDate, 'Due Date')
    };
    const editing = this.editingOrder();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<WorkOrder>(RESOURCE, editing.id, payload)
      : this.api.create<WorkOrder>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({ severity: 'success', summary: editing ? 'Work order updated' : 'Work order created', detail: payload.woNumber });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(order: WorkOrder): void {
    this.confirmation.confirm({
      header: 'Delete Work Order',
      message: `Delete work order ${order.woNumber} for ${order.aircraftReg}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, order.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Deleted', detail: `Work order ${order.woNumber} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<WorkOrder>(RESOURCE).subscribe({
      next: (res) => {
        this.workOrders.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load work orders.' });
      }
    });
  }
}
