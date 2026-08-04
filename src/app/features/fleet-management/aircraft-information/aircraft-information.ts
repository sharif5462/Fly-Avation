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

export type AircraftStatus = 'Active' | 'In Maintenance' | 'Grounded' | 'Stored';

export interface Aircraft {
  id: string;
  registration: string;
  aircraftType: string;
  manufacturer: string;
  capacity: number;
  yearBuilt: number;
  baseAirport: string;
  totalFlightHours: number;
  status: AircraftStatus;
}

const RESOURCE = 'aircraft-information';
const STATUSES: AircraftStatus[] = ['Active', 'In Maintenance', 'Grounded', 'Stored'];
const STATUS_SEVERITY: Record<AircraftStatus, TagSeverity> = {
  Active: 'success',
  'In Maintenance': 'warn',
  Grounded: 'danger',
  Stored: 'secondary'
};
const AIRCRAFT_TYPES = ['Boeing 737-800', 'Boeing 787-9', 'Airbus A320neo', 'Airbus A350-900', 'Embraer E190', 'ATR 72-600'];

@Component({
  selector: 'app-aircraft-information',
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
  templateUrl: './aircraft-information.html'
})
export class AircraftInformationPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly statuses = STATUSES;
  readonly aircraftTypes = AIRCRAFT_TYPES;

  fleet = signal<Aircraft[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingAircraft = signal<Aircraft | null>(null);
  saving = signal(false);

  stats = computed(() => {
    const rows = this.fleet();
    return {
      total: rows.length,
      active: rows.filter((a) => a.status === 'Active').length,
      maintenance: rows.filter((a) => a.status === 'In Maintenance').length,
      grounded: rows.filter((a) => a.status === 'Grounded').length
    };
  });

  form = this.fb.nonNullable.group({
    registration: ['', Validators.required],
    aircraftType: ['', Validators.required],
    manufacturer: ['', Validators.required],
    capacity: [0, [Validators.required, Validators.min(1)]],
    yearBuilt: [new Date().getFullYear(), [Validators.required, Validators.min(1950)]],
    baseAirport: ['', Validators.required],
    totalFlightHours: [0, Validators.min(0)],
    status: this.fb.control<AircraftStatus>('Active', { nonNullable: true, validators: Validators.required })
  });

  ngOnInit(): void {
    this.load();
  }

  severity(status: AircraftStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  onTypeChange(type: string): void {
    const manufacturer = type.startsWith('Boeing') ? 'Boeing' : type.startsWith('Airbus') ? 'Airbus' : type.startsWith('Embraer') ? 'Embraer' : type.startsWith('ATR') ? 'ATR' : '';
    if (manufacturer) {
      this.form.patchValue({ manufacturer });
    }
  }

  openNew(): void {
    this.editingAircraft.set(null);
    this.form.reset({ status: 'Active', totalFlightHours: 0, registration: '', aircraftType: '', manufacturer: '', baseAirport: '' });
    this.dialogVisible.set(true);
  }

  openEdit(aircraft: Aircraft): void {
    this.editingAircraft.set(aircraft);
    this.form.setValue({
      registration: aircraft.registration,
      aircraftType: aircraft.aircraftType,
      manufacturer: aircraft.manufacturer,
      capacity: aircraft.capacity,
      yearBuilt: aircraft.yearBuilt,
      baseAirport: aircraft.baseAirport,
      totalFlightHours: aircraft.totalFlightHours,
      status: aircraft.status
    });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    const editing = this.editingAircraft();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<Aircraft>(RESOURCE, editing.id, payload)
      : this.api.create<Aircraft>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({ severity: 'success', summary: editing ? 'Aircraft updated' : 'Aircraft added', detail: payload.registration });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(aircraft: Aircraft): void {
    this.confirmation.confirm({
      header: 'Remove Aircraft',
      message: `Remove ${aircraft.registration} (${aircraft.aircraftType}) from the fleet register?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Remove', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, aircraft.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Removed', detail: `${aircraft.registration} removed from fleet.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<Aircraft>(RESOURCE).subscribe({
      next: (res) => {
        this.fleet.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load the fleet register.' });
      }
    });
  }
}
