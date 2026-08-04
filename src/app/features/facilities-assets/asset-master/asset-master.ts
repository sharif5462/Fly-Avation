import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
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
  ASSET_CATEGORIES,
  ASSET_CONDITIONS,
  ASSET_CONDITION_SEVERITY,
  ASSET_DATE_FIELDS,
  ASSET_STATUSES,
  ASSET_STATUS_SEVERITY,
  AssetCondition,
  AssetMaster,
  AssetStatus,
  DEPRECIATION_METHODS,
  DepreciationMethod
} from '../../../core/models/facilities-assets.model';
import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type { AssetMaster } from '../../../core/models/facilities-assets.model';

const RESOURCE = 'asset-master';

@Component({
  selector: 'app-asset-master',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    CheckboxModule,
    TextareaModule,
    TagModule,
    TabsModule,
    IconFieldModule,
    InputIconModule,
    PageHeader,
    StatCard
  ],
  templateUrl: './asset-master.html'
})
export class AssetMasterPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly assetCategories = ASSET_CATEGORIES;
  readonly depreciationMethods: string[] = [...DEPRECIATION_METHODS];
  readonly conditions: string[] = [...ASSET_CONDITIONS];
  readonly statuses: string[] = [...ASSET_STATUSES];

  assets = signal<AssetMaster[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editing = signal<AssetMaster | null>(null);
  saving = signal(false);
  activeTab = signal('0');

  stats = computed(() => {
    const rows = this.assets();
    return {
      total: rows.length,
      underMaintenance: rows.filter((a) => a.status === 'Under Maintenance').length,
      outOfService: rows.filter((a) => a.status === 'Out of Service').length,
      critical: rows.filter((a) => a.criticalAsset).length
    };
  });

  form = this.fb.nonNullable.group({
    // Basic Info
    assetCode: ['', Validators.required],
    assetName: ['', Validators.required],
    assetCategory: ['', Validators.required],
    assetType: [''],
    description: [''],
    serialNumber: [''],
    assetTag: [''],

    // Location
    facility: ['', Validators.required],
    building: [''],
    floorZone: [''],
    roomLocation: [''],

    // Acquisition & Financial
    manufacturer: [''],
    model: [''],
    purchaseDate: this.fb.control<Date | null>(null),
    purchasePrice: [0, Validators.min(0)],
    currentValue: [0, Validators.min(0)],
    depreciationMethod: this.fb.nonNullable.control<DepreciationMethod>('Straight Line'),
    usefulLifeYears: [0, Validators.min(0)],
    vendor: [''],
    warrantyExpiry: this.fb.control<Date | null>(null),
    insurancePolicyNo: [''],

    // Maintenance & Condition
    condition: this.fb.nonNullable.control<AssetCondition>('Good', Validators.required),
    lastInspectionDate: this.fb.control<Date | null>(null),
    nextInspectionDate: this.fb.control<Date | null>(null),
    lastMaintenanceDate: this.fb.control<Date | null>(null),
    nextMaintenanceDate: this.fb.control<Date | null>(null),
    maintenanceFrequencyMonths: [0, Validators.min(0)],
    assignedTechnician: [''],

    // Compliance & Status
    certificationRequired: [false],
    certificationExpiry: this.fb.control<Date | null>(null),
    criticalAsset: [false],
    status: this.fb.nonNullable.control<AssetStatus>('Active', Validators.required)
  });

  ngOnInit(): void {
    this.load();
  }

  conditionSeverity(condition: AssetCondition): TagSeverity {
    return ASSET_CONDITION_SEVERITY[condition];
  }

  statusSeverity(status: AssetStatus): TagSeverity {
    return ASSET_STATUS_SEVERITY[status];
  }

  openNew(): void {
    this.editing.set(null);
    this.form.reset();
    this.activeTab.set('0');
    this.dialogVisible.set(true);
  }

  openEdit(asset: AssetMaster): void {
    this.editing.set(asset);
    const patch: Record<string, unknown> = { ...asset };
    for (const key of ASSET_DATE_FIELDS) {
      const value = asset[key];
      patch[key] = value ? new Date(value) : null;
    }
    this.form.patchValue(patch);
    this.activeTab.set('0');
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: Record<string, unknown> = { ...this.form.getRawValue() };
    for (const key of ASSET_DATE_FIELDS) {
      const value = payload[key] as Date | null;
      payload[key] = value ? value.toISOString().slice(0, 10) : null;
    }

    const editing = this.editing();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<AssetMaster>(RESOURCE, editing.id, payload)
      : this.api.create<AssetMaster>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({
          severity: 'success',
          summary: editing ? 'Asset updated' : 'Asset created',
          detail: String(payload['assetName'])
        });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(asset: AssetMaster): void {
    this.confirmation.confirm({
      header: 'Remove Asset',
      message: `Remove ${asset.assetCode} — ${asset.assetName} from the asset register?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Remove', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, asset.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Removed', detail: `${asset.assetCode} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<AssetMaster>(RESOURCE).subscribe({
      next: (res) => {
        this.assets.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load the asset register.' });
      }
    });
  }
}
