import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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

export type DispatchStatus = 'Released' | 'Pending' | 'Held';

export interface FlightDispatch {
  id: string;
  dispatchNo: string;
  flightNo: string;
  aircraftReg: string;
  dispatcher: string;
  releaseTime: string;
  status: DispatchStatus;
  origin: string;
  destination: string;
  gate: string;
  fuelLoad: number;
  notes?: string;
}

const RESOURCE = 'flight-dispatch';
const STATUSES: DispatchStatus[] = ['Released', 'Pending', 'Held'];
const DISPATCHERS = ['Capt. Rahman', 'F. Abdullah', 'N. Hossain', 'S. Karim', 'M. Chowdhury', 'P. Bose'];
const STATUS_SEVERITY: Record<DispatchStatus, TagSeverity> = {
  Released: 'success',
  Pending: 'info',
  Held: 'danger'
};

@Component({
  selector: 'app-flight-dispatch',
  imports: [
    DatePipe,
    FormsModule,
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
  templateUrl: './flight-dispatch.html',
  styleUrl: './flight-dispatch.scss'
})
export class FlightDispatchPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly statuses = STATUSES;
  readonly dispatchers = DISPATCHERS;

  dispatches = signal<FlightDispatch[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingDispatch = signal<FlightDispatch | null>(null);
  saving = signal(false);

  filterFlightNo = signal('');
  filterStatus = signal<DispatchStatus | null>(null);
  filterDispatcher = signal<string | null>(null);
  filterSearch = signal('');

  hasActiveFilters = computed(
    () =>
      this.filterFlightNo().trim().length > 0 ||
      !!this.filterStatus() ||
      !!this.filterDispatcher() ||
      this.filterSearch().trim().length > 0
  );

  filteredDispatches = computed(() => {
    const rows = this.dispatches();
    const flightNo = this.filterFlightNo().trim().toLowerCase();
    const status = this.filterStatus();
    const dispatcher = this.filterDispatcher();
    const search = this.filterSearch().trim().toLowerCase();

    return rows.filter((dispatch) => {
      if (flightNo && !dispatch.flightNo.toLowerCase().includes(flightNo)) return false;
      if (status && dispatch.status !== status) return false;
      if (dispatcher && dispatch.dispatcher !== dispatcher) return false;
      if (search) {
        const haystack = `${dispatch.dispatchNo} ${dispatch.flightNo} ${dispatch.aircraftReg} ${dispatch.dispatcher} ${dispatch.origin} ${dispatch.destination}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  stats = computed(() => {
    const rows = this.dispatches();
    return {
      total: rows.length,
      released: rows.filter((d) => d.status === 'Released').length,
      pending: rows.filter((d) => d.status === 'Pending').length,
      held: rows.filter((d) => d.status === 'Held').length
    };
  });

  form = this.fb.nonNullable.group({
    dispatchNo: ['', Validators.required],
    flightNo: ['', Validators.required],
    aircraftReg: ['', Validators.required],
    dispatcher: this.fb.control<string>(DISPATCHERS[0], { nonNullable: true, validators: Validators.required }),
    releaseTime: this.fb.control<Date | null>(null, Validators.required),
    status: this.fb.control<DispatchStatus>('Pending', { nonNullable: true, validators: Validators.required }),
    origin: ['', [Validators.required, Validators.maxLength(3)]],
    destination: ['', [Validators.required, Validators.maxLength(3)]],
    gate: ['', Validators.required],
    fuelLoad: [0, [Validators.required, Validators.min(0)]],
    notes: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  severity(status: DispatchStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  clearFilters(): void {
    this.filterFlightNo.set('');
    this.filterStatus.set(null);
    this.filterDispatcher.set(null);
    this.filterSearch.set('');
  }

  openNew(): void {
    this.editingDispatch.set(null);
    this.form.reset({
      dispatchNo: '',
      flightNo: '',
      aircraftReg: '',
      dispatcher: DISPATCHERS[0],
      releaseTime: null,
      status: 'Pending',
      origin: '',
      destination: '',
      gate: '',
      fuelLoad: 0,
      notes: ''
    });
    this.dialogVisible.set(true);
  }

  openEdit(dispatch: FlightDispatch): void {
    this.editingDispatch.set(dispatch);
    this.form.reset({
      dispatchNo: dispatch.dispatchNo,
      flightNo: dispatch.flightNo,
      aircraftReg: dispatch.aircraftReg,
      dispatcher: dispatch.dispatcher,
      releaseTime: new Date(dispatch.releaseTime),
      status: dispatch.status,
      origin: dispatch.origin,
      destination: dispatch.destination,
      gate: dispatch.gate,
      fuelLoad: dispatch.fuelLoad,
      notes: dispatch.notes ?? ''
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
      releaseTime: value.releaseTime!.toISOString()
    };
    const editing = this.editingDispatch();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<FlightDispatch>(RESOURCE, editing.id, payload)
      : this.api.create<FlightDispatch>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({
          severity: 'success',
          summary: editing ? 'Dispatch updated' : 'Dispatch created',
          detail: payload.dispatchNo
        });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(dispatch: FlightDispatch): void {
    this.confirmation.confirm({
      header: 'Delete Dispatch',
      message: `Remove dispatch ${dispatch.dispatchNo} for flight ${dispatch.flightNo}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, dispatch.id).subscribe({
          next: () => {
            this.messages.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `Dispatch ${dispatch.dispatchNo} removed.`
            });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<FlightDispatch>(RESOURCE).subscribe({
      next: (res) => {
        this.dispatches.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load dispatches.' });
      }
    });
  }
}
