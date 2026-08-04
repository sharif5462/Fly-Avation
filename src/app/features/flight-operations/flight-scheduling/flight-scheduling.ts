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
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type FlightStatus = 'Scheduled' | 'Boarding' | 'Departed' | 'In Air' | 'Landed' | 'Delayed' | 'Cancelled';

export interface Flight {
  id: string;
  flightNo: string;
  origin: string;
  destination: string;
  aircraftReg: string;
  departureTime: string;
  arrivalTime: string;
  gate: string;
  status: FlightStatus;
  remarks?: string;
}

const RESOURCE = 'flight-scheduling';
const STATUSES: FlightStatus[] = ['Scheduled', 'Boarding', 'Departed', 'In Air', 'Landed', 'Delayed', 'Cancelled'];
const STATUS_SEVERITY: Record<FlightStatus, TagSeverity> = {
  Scheduled: 'info',
  Boarding: 'warn',
  Departed: 'secondary',
  'In Air': 'info',
  Landed: 'success',
  Delayed: 'warn',
  Cancelled: 'danger'
};

@Component({
  selector: 'app-flight-scheduling',
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
  templateUrl: './flight-scheduling.html'
})
export class FlightSchedulingPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly statuses = STATUSES;

  flights = signal<Flight[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingFlight = signal<Flight | null>(null);
  saving = signal(false);

  stats = computed(() => {
    const rows = this.flights();
    return {
      total: rows.length,
      active: rows.filter((f) => f.status === 'In Air' || f.status === 'Departed' || f.status === 'Boarding').length,
      delayed: rows.filter((f) => f.status === 'Delayed').length,
      cancelled: rows.filter((f) => f.status === 'Cancelled').length
    };
  });

  form = this.fb.nonNullable.group({
    flightNo: ['', Validators.required],
    origin: ['', Validators.required],
    destination: ['', Validators.required],
    aircraftReg: ['', Validators.required],
    departureTime: this.fb.control<Date | null>(null, Validators.required),
    arrivalTime: this.fb.control<Date | null>(null, Validators.required),
    gate: [''],
    status: this.fb.control<FlightStatus>('Scheduled', { nonNullable: true, validators: Validators.required }),
    remarks: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  severity(status: FlightStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  openNew(): void {
    this.editingFlight.set(null);
    this.form.reset({ status: 'Scheduled', gate: '', remarks: '', flightNo: '', origin: '', destination: '', aircraftReg: '' });
    this.dialogVisible.set(true);
  }

  openEdit(flight: Flight): void {
    this.editingFlight.set(flight);
    this.form.setValue({
      flightNo: flight.flightNo,
      origin: flight.origin,
      destination: flight.destination,
      aircraftReg: flight.aircraftReg,
      departureTime: new Date(flight.departureTime),
      arrivalTime: new Date(flight.arrivalTime),
      gate: flight.gate ?? '',
      status: flight.status,
      remarks: flight.remarks ?? ''
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
      departureTime: value.departureTime!.toISOString(),
      arrivalTime: value.arrivalTime!.toISOString()
    };
    const editing = this.editingFlight();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<Flight>(RESOURCE, editing.id, payload)
      : this.api.create<Flight>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({ severity: 'success', summary: editing ? 'Flight updated' : 'Flight created', detail: payload.flightNo });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(flight: Flight): void {
    this.confirmation.confirm({
      header: 'Delete Flight',
      message: `Remove flight ${flight.flightNo} (${flight.origin} → ${flight.destination}) from the schedule?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, flight.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Deleted', detail: `Flight ${flight.flightNo} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<Flight>(RESOURCE).subscribe({
      next: (res) => {
        this.flights.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load flights.' });
      }
    });
  }
}
