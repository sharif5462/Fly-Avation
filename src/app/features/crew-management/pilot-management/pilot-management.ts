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
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { daysUntil, fromDateOnly, toRequiredDateOnly } from '../../../core/utils/date.util';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type PilotStatus = 'Active' | 'On Leave' | 'Training' | 'Suspended';
export type LicenseType = 'ATPL' | 'CPL';

export interface Pilot {
  id: string;
  employeeNo: string;
  fullName: string;
  licenseNo: string;
  licenseType: LicenseType;
  ratings: string;
  medicalCertExpiry: string;
  totalFlightHours: number;
  status: PilotStatus;
}

const RESOURCE = 'pilot-management';
const STATUSES: PilotStatus[] = ['Active', 'On Leave', 'Training', 'Suspended'];
const LICENSE_TYPES: LicenseType[] = ['ATPL', 'CPL'];
const STATUS_SEVERITY: Record<PilotStatus, TagSeverity> = {
  Active: 'success',
  'On Leave': 'warn',
  Training: 'info',
  Suspended: 'danger'
};

/** How far ahead a lapsing medical certificate is flagged on the roster. */
const MEDICAL_EXPIRY_WARNING_DAYS = 60;

/** Days until a medical certificate lapses; negative once it already has. */
function daysUntilExpiry(dateOnly: string): number {
  return daysUntil(dateOnly) ?? 0;
}

@Component({
  selector: 'app-pilot-management',
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
    IconFieldModule,
    InputIconModule,
    PageHeader,
    StatCard
  ],
  templateUrl: './pilot-management.html'
})
export class PilotManagementPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly statuses = STATUSES;
  readonly licenseTypes = LICENSE_TYPES;

  pilots = signal<Pilot[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingPilot = signal<Pilot | null>(null);
  saving = signal(false);

  stats = computed(() => {
    const rows = this.pilots();
    return {
      total: rows.length,
      active: rows.filter((p) => p.status === 'Active').length,
      training: rows.filter((p) => p.status === 'Training').length,
      medicalExpiring: rows.filter((p) => {
        const days = daysUntilExpiry(p.medicalCertExpiry);
        return days >= 0 && days <= MEDICAL_EXPIRY_WARNING_DAYS;
      }).length
    };
  });

  form = this.fb.nonNullable.group({
    employeeNo: ['', Validators.required],
    fullName: ['', Validators.required],
    licenseNo: ['', Validators.required],
    licenseType: this.fb.control<LicenseType>('ATPL', { nonNullable: true, validators: Validators.required }),
    ratings: ['', Validators.required],
    medicalCertExpiry: this.fb.control<Date | null>(null, Validators.required),
    totalFlightHours: [0, Validators.min(0)],
    status: this.fb.control<PilotStatus>('Active', { nonNullable: true, validators: Validators.required })
  });

  ngOnInit(): void {
    this.load();
  }

  severity(status: PilotStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  medicalSeverity(expiry: string): TagSeverity {
    const days = daysUntilExpiry(expiry);
    if (days < 0) return 'danger';
    if (days <= MEDICAL_EXPIRY_WARNING_DAYS) return 'warn';
    return 'success';
  }

  openNew(): void {
    this.editingPilot.set(null);
    this.form.reset({ licenseType: 'ATPL', status: 'Active', totalFlightHours: 0, employeeNo: '', fullName: '', licenseNo: '', ratings: '' });
    this.dialogVisible.set(true);
  }

  openEdit(pilot: Pilot): void {
    this.editingPilot.set(pilot);
    this.form.setValue({
      employeeNo: pilot.employeeNo,
      fullName: pilot.fullName,
      licenseNo: pilot.licenseNo,
      licenseType: pilot.licenseType,
      ratings: pilot.ratings,
      medicalCertExpiry: fromDateOnly(pilot.medicalCertExpiry),
      totalFlightHours: pilot.totalFlightHours,
      status: pilot.status
    });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload = { ...value, medicalCertExpiry: toRequiredDateOnly(value.medicalCertExpiry, 'Medical Certificate Expiry') };
    const editing = this.editingPilot();
    this.saving.set(true);
    const request$ = editing ? this.api.update<Pilot>(RESOURCE, editing.id, payload) : this.api.create<Pilot>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({ severity: 'success', summary: editing ? 'Pilot updated' : 'Pilot added', detail: payload.fullName });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(pilot: Pilot): void {
    this.confirmation.confirm({
      header: 'Remove Pilot',
      message: `Remove ${pilot.fullName} (${pilot.employeeNo}) from the roster?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Remove', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, pilot.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Removed', detail: `${pilot.fullName} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<Pilot>(RESOURCE).subscribe({
      next: (res) => {
        this.pilots.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load pilots.' });
      }
    });
  }
}
