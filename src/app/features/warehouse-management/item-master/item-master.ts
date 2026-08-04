import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

import {
  ITEM_CATEGORIES,
  ITEM_STATUSES,
  ITEM_STATUS_SEVERITY,
  ITEM_TYPES,
  ItemMaster,
  ItemStatus,
  ItemType,
  UNITS
} from '../../../core/models/warehouse-management.model';
import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type { ItemMaster } from '../../../core/models/warehouse-management.model';

const RESOURCE = 'item-master';

@Component({
  selector: 'app-item-master',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    TextareaModule,
    TagModule,
    TabsModule,
    IconFieldModule,
    InputIconModule,
    PageHeader,
    StatCard
  ],
  templateUrl: './item-master.html'
})
export class ItemMasterPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly itemCategories = ITEM_CATEGORIES;
  readonly itemTypes: string[] = [...ITEM_TYPES];
  readonly units = UNITS;
  readonly statuses: string[] = [...ITEM_STATUSES];

  items = signal<ItemMaster[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editing = signal<ItemMaster | null>(null);
  saving = signal(false);
  activeTab = signal('0');

  stats = computed(() => {
    const rows = this.items();
    return {
      total: rows.length,
      lowStock: rows.filter((i) => i.currentStock <= i.reorderLevel).length,
      active: rows.filter((i) => i.status === 'Active').length,
      assets: rows.filter((i) => i.assetFlag).length
    };
  });

  form = this.fb.nonNullable.group({
    // Basic Info
    itemCode: ['', Validators.required],
    itemName: ['', Validators.required],
    itemCategory: ['', Validators.required],
    itemGroup: [''],
    itemSubGroup: [''],
    description: [''],

    // Classification
    itemType: this.fb.nonNullable.control<ItemType>('Consumable', Validators.required),
    unit: ['', Validators.required],
    brand: [''],
    manufacturer: [''],
    manufacturerPartNo: [''],
    ataChapter: [''],

    // Supplier & Pricing
    primarySupplier: [''],
    purchasePrice: [0, Validators.min(0)],
    salesPrice: [0, Validators.min(0)],
    packSize: [1, Validators.min(1)],
    discountApplicable: [false],
    taxVatPct: [0, [Validators.min(0), Validators.max(100)]],

    // Stock & Storage
    warehouse: [''],
    storeLocation: [''],
    rackBin: [''],
    reorderLevel: [0, Validators.min(0)],
    reorderQty: [0, Validators.min(0)],
    minStock: [0, Validators.min(0)],
    maxStock: [0, Validators.min(0)],
    currentStock: [0, Validators.min(0)],

    // Tracking & Compliance
    serialTracked: [false],
    batchTracked: [false],
    shelfLifeTracked: [false],
    shelfLifeMonths: [0, Validators.min(0)],
    warrantyApplicable: [false],
    warrantyPeriodMonths: [0, Validators.min(0)],
    calibrationRequired: [false],
    calibrationIntervalMonths: [0, Validators.min(0)],
    lifeLimited: [false],
    assetFlag: [false],

    // Status
    status: this.fb.nonNullable.control<ItemStatus>('Active', Validators.required)
  });

  ngOnInit(): void {
    this.load();
  }

  statusSeverity(status: ItemStatus): TagSeverity {
    return ITEM_STATUS_SEVERITY[status];
  }

  stockSeverity(item: ItemMaster): TagSeverity {
    return item.currentStock <= item.reorderLevel ? 'danger' : 'success';
  }

  openNew(): void {
    this.editing.set(null);
    this.form.reset();
    this.activeTab.set('0');
    this.dialogVisible.set(true);
  }

  openEdit(item: ItemMaster): void {
    this.editing.set(item);
    this.form.patchValue(item);
    this.activeTab.set('0');
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    const editing = this.editing();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<ItemMaster>(RESOURCE, editing.id, payload)
      : this.api.create<ItemMaster>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({ severity: 'success', summary: editing ? 'Item updated' : 'Item created', detail: payload.itemName });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(item: ItemMaster): void {
    this.confirmation.confirm({
      header: 'Remove Item',
      message: `Remove ${item.itemCode} — ${item.itemName} from the item master?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Remove', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, item.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Removed', detail: `${item.itemCode} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<ItemMaster>(RESOURCE).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load the item master.' });
      }
    });
  }
}
