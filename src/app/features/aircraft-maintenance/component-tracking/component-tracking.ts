import { DatePipe, DecimalPipe } from '@angular/common';
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
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { fromDateOnly, toDateOnly, toRequiredDateOnly } from '../../../core/utils/date.util';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type ComponentCategory = 'Rotable' | 'Life-Limited Part' | 'Repairable' | 'Consumable';
export type ComponentStatus = 'Installed' | 'Removed' | 'In Repair' | 'Quarantine' | 'Scrapped';

export interface TrackedComponent {
  id: string;
  componentNo: string;
  componentName: string;
  category: ComponentCategory;
  ataChapter: string;
  aircraftReg: string;
  position: string;
  serialNumber: string;
  installedDate: string;
  lifeLimitHours: number | null;
  lifeRemainingHours: number | null;
  cyclesRemaining: number | null;
  nextRemovalDue: string | null;
  status: ComponentStatus;
}

const RESOURCE = 'component-tracking';
const CATEGORIES: ComponentCategory[] = ['Rotable', 'Life-Limited Part', 'Repairable', 'Consumable'];
const STATUSES: ComponentStatus[] = ['Installed', 'Removed', 'In Repair', 'Quarantine', 'Scrapped'];
const LIFE_TRACKED_CATEGORIES: ComponentCategory[] = ['Rotable', 'Life-Limited Part'];

const STATUS_SEVERITY: Record<ComponentStatus, TagSeverity> = {
  Installed: 'success',
  Removed: 'secondary',
  'In Repair': 'warn',
  Quarantine: 'danger',
  Scrapped: 'contrast'
};

@Component({
  selector: 'app-component-tracking',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    TagModule,
    ProgressBarModule,
    IconFieldModule,
    InputIconModule,
    PageHeader,
    StatCard
  ],
  templateUrl: './component-tracking.html'
})
export class ComponentTrackingPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly categories = CATEGORIES;
  readonly statuses = STATUSES;

  components = signal<TrackedComponent[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingComponent = signal<TrackedComponent | null>(null);
  saving = signal(false);

  stats = computed(() => {
    const rows = this.components();
    return {
      total: rows.length,
      lifeLimited: rows.filter((c) => LIFE_TRACKED_CATEGORIES.includes(c.category)).length,
      critical: rows.filter((c) => this.lifePct(c) !== null && this.lifePct(c)! < 25).length,
      inRepair: rows.filter((c) => c.status === 'In Repair' || c.status === 'Quarantine').length
    };
  });

  form = this.fb.nonNullable.group({
    componentNo: ['', Validators.required],
    componentName: ['', Validators.required],
    category: this.fb.control<ComponentCategory>('Rotable', { nonNullable: true, validators: Validators.required }),
    ataChapter: ['', Validators.required],
    aircraftReg: ['', Validators.required],
    position: ['', Validators.required],
    serialNumber: ['', Validators.required],
    installedDate: this.fb.control<Date | null>(new Date(), Validators.required),
    lifeLimitHours: this.fb.control<number | null>(null),
    lifeRemainingHours: this.fb.control<number | null>(null),
    cyclesRemaining: this.fb.control<number | null>(null),
    nextRemovalDue: this.fb.control<Date | null>(null),
    status: this.fb.control<ComponentStatus>('Installed', { nonNullable: true, validators: Validators.required })
  });

  ngOnInit(): void {
    this.load();
  }

  statusSeverity(status: ComponentStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  isLifeTracked(component: TrackedComponent): boolean {
    return LIFE_TRACKED_CATEGORIES.includes(component.category) && component.lifeLimitHours != null && component.lifeLimitHours > 0;
  }

  lifePct(component: TrackedComponent): number | null {
    if (!this.isLifeTracked(component) || component.lifeRemainingHours == null) return null;
    const pct = (component.lifeRemainingHours / component.lifeLimitHours!) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }

  lifeColor(component: TrackedComponent): string {
    const pct = this.lifePct(component);
    if (pct === null) return 'var(--p-green-500)';
    if (pct < 10) return 'var(--p-red-500)';
    if (pct < 25) return 'var(--p-orange-500)';
    return 'var(--p-green-500)';
  }

  openNew(): void {
    this.editingComponent.set(null);
    this.form.reset({
      category: 'Rotable',
      status: 'Installed',
      installedDate: new Date(),
      componentNo: '',
      componentName: '',
      ataChapter: '',
      aircraftReg: '',
      position: '',
      serialNumber: '',
      lifeLimitHours: null,
      lifeRemainingHours: null,
      cyclesRemaining: null,
      nextRemovalDue: null
    });
    this.dialogVisible.set(true);
  }

  openEdit(component: TrackedComponent): void {
    this.editingComponent.set(component);
    this.form.setValue({
      componentNo: component.componentNo,
      componentName: component.componentName,
      category: component.category,
      ataChapter: component.ataChapter,
      aircraftReg: component.aircraftReg,
      position: component.position,
      serialNumber: component.serialNumber,
      installedDate: fromDateOnly(component.installedDate),
      lifeLimitHours: component.lifeLimitHours,
      lifeRemainingHours: component.lifeRemainingHours,
      cyclesRemaining: component.cyclesRemaining,
      nextRemovalDue: fromDateOnly(component.nextRemovalDue),
      status: component.status
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
      installedDate: toRequiredDateOnly(value.installedDate, 'Installed Date'),
      nextRemovalDue: toDateOnly(value.nextRemovalDue)
    };
    const editing = this.editingComponent();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<TrackedComponent>(RESOURCE, editing.id, payload)
      : this.api.create<TrackedComponent>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({ severity: 'success', summary: editing ? 'Component updated' : 'Component created', detail: payload.componentNo });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(component: TrackedComponent): void {
    this.confirmation.confirm({
      header: 'Delete Component',
      message: `Delete component ${component.componentNo} (${component.componentName})?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, component.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Deleted', detail: `Component ${component.componentNo} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<TrackedComponent>(RESOURCE).subscribe({
      next: (res) => {
        this.components.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load components.' });
      }
    });
  }
}
