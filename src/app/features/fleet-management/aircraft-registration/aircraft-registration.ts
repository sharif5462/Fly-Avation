import { DecimalPipe } from '@angular/common';
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
  AIRCRAFT_DATE_FIELDS,
  AIRCRAFT_TYPES,
  AircraftRegistration,
  CURRENT_STATUSES,
  CURRENT_STATUS_SEVERITY,
  CurrentStatus,
  ERP_STATUSES,
  ERP_STATUS_SEVERITY,
  ErpStatus,
  FLIGHT_CATEGORIES,
  LEASE_TYPES,
  MANUFACTURERS,
  MODELS_BY_MANUFACTURER,
  Manufacturer
} from '../../../core/models/aircraft-registration.model';
import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { fromDateOnly, toDateOnly } from '../../../core/utils/date.util';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type { AircraftRegistration } from '../../../core/models/aircraft-registration.model';

const RESOURCE = 'aircraft-registration';

@Component({
  selector: 'app-aircraft-registration',
  imports: [
    DecimalPipe,
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
  templateUrl: './aircraft-registration.html'
})
export class AircraftRegistrationPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly manufacturers: string[] = [...MANUFACTURERS];
  readonly aircraftTypes = AIRCRAFT_TYPES;
  readonly leaseTypes: string[] = [...LEASE_TYPES];
  readonly currentStatuses: string[] = [...CURRENT_STATUSES];
  readonly flightCategories: string[] = [...FLIGHT_CATEGORIES];
  readonly erpStatuses: string[] = [...ERP_STATUSES];

  fleet = signal<AircraftRegistration[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editing = signal<AircraftRegistration | null>(null);
  saving = signal(false);
  activeTab = signal('0');
  availableModels = signal<string[]>([]);

  stats = computed(() => {
    const rows = this.fleet();
    return {
      total: rows.length,
      active: rows.filter((a) => a.currentStatus === 'Active').length,
      maintenance: rows.filter((a) => a.currentStatus === 'Maintenance').length,
      grounded: rows.filter((a) => a.currentStatus === 'Grounded').length
    };
  });

  form = this.fb.nonNullable.group({
    // 1. Basic Information
    registrationNumber: ['', Validators.required],
    serialNumber: ['', Validators.required],
    manufacturer: ['', Validators.required],
    model: ['', Validators.required],
    aircraftType: ['', Validators.required],
    icaoCode: [''],
    iataCode: [''],

    // 2. Ownership Information
    ownerName: ['', Validators.required],
    operatorName: ['', Validators.required],
    leaseType: this.fb.nonNullable.control<'Owned' | 'Dry Lease' | 'Wet Lease'>('Owned', Validators.required),
    leaseStartDate: this.fb.control<Date | null>(null),
    leaseEndDate: this.fb.control<Date | null>(null),
    lessorName: [''],

    // 3. Technical Information
    engineManufacturer: [''],
    engineModel: [''],
    engineCount: [2, Validators.min(0)],
    engineSerialNumbers: [''],
    mtow: [0, Validators.min(0)],
    mlw: [0, Validators.min(0)],
    mzfw: [0, Validators.min(0)],
    fuelCapacity: [0, Validators.min(0)],
    cruiseSpeed: [0, Validators.min(0)],
    maxRange: [0, Validators.min(0)],
    wingspan: [0, Validators.min(0)],
    aircraftLength: [0, Validators.min(0)],
    aircraftHeight: [0, Validators.min(0)],

    // 4. Capacity
    totalSeats: [0, Validators.min(0)],
    businessSeats: [0, Validators.min(0)],
    economySeats: [0, Validators.min(0)],
    firstClassSeats: [0, Validators.min(0)],
    cargoCapacity: [0, Validators.min(0)],
    maxPassengers: [0, Validators.min(0)],

    // 5. Operational Information
    homeBaseAirport: ['', Validators.required],
    currentAirport: [''],
    currentStatus: this.fb.nonNullable.control<CurrentStatus>('Active', Validators.required),
    flightCategory: this.fb.nonNullable.control<'Domestic' | 'International' | 'Cargo' | 'Charter'>('Domestic', Validators.required),

    // 6. Certification
    registrationDate: this.fb.control<Date | null>(null),
    registrationExpiry: this.fb.control<Date | null>(null),
    airworthinessCertNo: [''],
    airworthinessExpiry: this.fb.control<Date | null>(null),
    insurancePolicyNo: [''],
    insuranceExpiry: this.fb.control<Date | null>(null),
    noiseCertificate: [''],
    radioLicense: [''],
    certificateOfRegistration: [''],

    // 7. Maintenance Information
    lastMaintenanceDate: this.fb.control<Date | null>(null),
    nextMaintenanceDate: this.fb.control<Date | null>(null),
    lastACheck: this.fb.control<Date | null>(null),
    nextACheck: this.fb.control<Date | null>(null),
    lastCCheck: this.fb.control<Date | null>(null),
    nextCCheck: this.fb.control<Date | null>(null),
    totalFlightHours: [0, Validators.min(0)],
    totalFlightCycles: [0, Validators.min(0)],
    remainingHours: [0, Validators.min(0)],
    remainingCycles: [0, Validators.min(0)],

    // 8. Communication Equipment
    transponderCode: [''],
    eltNumber: [''],
    satcomInstalled: [false],
    adsbInstalled: [false],
    tcasInstalled: [false],
    weatherRadarInstalled: [false],

    // 9. Documents (filename/reference only — no upload storage backend yet)
    registrationCertificateFile: [''],
    airworthinessCertificateFile: [''],
    insuranceCopyFile: [''],
    leaseAgreementFile: [''],
    maintenanceCertificateFile: [''],
    aircraftPhotoFile: [''],

    // 10. Financial Information
    purchasePrice: [0, Validators.min(0)],
    currentValue: [0, Validators.min(0)],
    monthlyLeaseCost: [0, Validators.min(0)],
    depreciation: [0, Validators.min(0)],
    insuranceCost: [0, Validators.min(0)],

    // 11. ERP Status
    erpStatus: this.fb.nonNullable.control<ErpStatus>('Active', Validators.required)
  });

  ngOnInit(): void {
    this.load();
  }

  statusSeverity(status: CurrentStatus): TagSeverity {
    return CURRENT_STATUS_SEVERITY[status];
  }

  erpSeverity(status: ErpStatus): TagSeverity {
    return ERP_STATUS_SEVERITY[status];
  }

  onManufacturerChange(manufacturer: string): void {
    this.availableModels.set(MODELS_BY_MANUFACTURER[manufacturer as Manufacturer] ?? []);
  }

  openNew(): void {
    this.editing.set(null);
    this.availableModels.set([]);
    this.form.reset();
    this.activeTab.set('0');
    this.dialogVisible.set(true);
  }

  openEdit(aircraft: AircraftRegistration): void {
    this.editing.set(aircraft);
    this.availableModels.set(MODELS_BY_MANUFACTURER[aircraft.manufacturer as Manufacturer] ?? []);
    const patch: Record<string, unknown> = { ...aircraft };
    for (const key of AIRCRAFT_DATE_FIELDS) {
      const value = aircraft[key];
      patch[key] = fromDateOnly(value);
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
    for (const key of AIRCRAFT_DATE_FIELDS) {
      const value = payload[key] as Date | null;
      payload[key] = toDateOnly(value);
    }

    const editing = this.editing();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<AircraftRegistration>(RESOURCE, editing.id, payload)
      : this.api.create<AircraftRegistration>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({
          severity: 'success',
          summary: editing ? 'Aircraft updated' : 'Aircraft registered',
          detail: String(payload['registrationNumber'])
        });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(aircraft: AircraftRegistration): void {
    this.confirmation.confirm({
      header: 'Remove Aircraft',
      message: `Remove ${aircraft.registrationNumber} (${aircraft.model}) from the aircraft register?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Remove', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, aircraft.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Removed', detail: `${aircraft.registrationNumber} removed from register.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<AircraftRegistration>(RESOURCE).subscribe({
      next: (res) => {
        this.fleet.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load the aircraft register.' });
      }
    });
  }
}
