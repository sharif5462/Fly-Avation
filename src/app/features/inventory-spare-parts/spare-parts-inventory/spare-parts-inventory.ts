import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
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
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface SparePart {
  id: string;
  partNo: string;
  description: string;
  category: string;
  quantityOnHand: number;
  minStockLevel: number;
  unitCost: number;
  warehouseLocation: string;
  status: StockStatus;
}

const RESOURCE = 'spare-parts-inventory';
const CATEGORIES = ['Avionics', 'Airframe', 'Engine', 'Landing Gear', 'Hydraulics', 'Cabin Interior'];
const STATUS_SEVERITY: Record<StockStatus, TagSeverity> = {
  'In Stock': 'success',
  'Low Stock': 'warn',
  'Out of Stock': 'danger'
};

function deriveStatus(qty: number, min: number): StockStatus {
  if (qty <= 0) return 'Out of Stock';
  if (qty < min) return 'Low Stock';
  return 'In Stock';
}

@Component({
  selector: 'app-spare-parts-inventory',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    PageHeader,
    StatCard
  ],
  templateUrl: './spare-parts-inventory.html'
})
export class SparePartsInventoryPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly categories = CATEGORIES;

  parts = signal<SparePart[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingPart = signal<SparePart | null>(null);
  saving = signal(false);

  stats = computed(() => {
    const rows = this.parts();
    return {
      total: rows.length,
      lowStock: rows.filter((p) => p.status === 'Low Stock').length,
      outOfStock: rows.filter((p) => p.status === 'Out of Stock').length,
      totalValue: rows.reduce((sum, p) => sum + p.quantityOnHand * p.unitCost, 0)
    };
  });

  form = this.fb.nonNullable.group({
    partNo: ['', Validators.required],
    description: ['', Validators.required],
    category: this.fb.control<string>('Avionics', { nonNullable: true, validators: Validators.required }),
    quantityOnHand: [0, [Validators.required, Validators.min(0)]],
    minStockLevel: [5, [Validators.required, Validators.min(0)]],
    unitCost: [0, [Validators.required, Validators.min(0)]],
    warehouseLocation: ['', Validators.required]
  });

  ngOnInit(): void {
    this.load();
  }

  severity(status: StockStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  openNew(): void {
    this.editingPart.set(null);
    this.form.reset({ category: 'Avionics', quantityOnHand: 0, minStockLevel: 5, unitCost: 0, partNo: '', description: '', warehouseLocation: '' });
    this.dialogVisible.set(true);
  }

  openEdit(part: SparePart): void {
    this.editingPart.set(part);
    this.form.setValue({
      partNo: part.partNo,
      description: part.description,
      category: part.category,
      quantityOnHand: part.quantityOnHand,
      minStockLevel: part.minStockLevel,
      unitCost: part.unitCost,
      warehouseLocation: part.warehouseLocation
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
      status: deriveStatus(value.quantityOnHand ?? 0, value.minStockLevel ?? 0)
    };
    const editing = this.editingPart();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<SparePart>(RESOURCE, editing.id, payload)
      : this.api.create<SparePart>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({ severity: 'success', summary: editing ? 'Part updated' : 'Part added', detail: payload.partNo });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(part: SparePart): void {
    this.confirmation.confirm({
      header: 'Delete Spare Part',
      message: `Remove ${part.partNo} — ${part.description} from inventory?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, part.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Deleted', detail: `${part.partNo} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<SparePart>(RESOURCE).subscribe({
      next: (res) => {
        this.parts.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load inventory.' });
      }
    });
  }
}
