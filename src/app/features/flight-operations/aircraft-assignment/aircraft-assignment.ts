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

import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type AssignmentStatus = 'Confirmed' | 'Tentative' | 'Cancelled';

export interface AircraftAssignment {
  id: string;
  flightNo: string;
  aircraftReg: string;
  assignedDate: string;
  assignedBy: string;
  status: AssignmentStatus;
}

const RESOURCE = 'aircraft-assignment';
const STATUSES: AssignmentStatus[] = ['Confirmed', 'Tentative', 'Cancelled'];
const STATUS_SEVERITY: Record<AssignmentStatus, TagSeverity> = {
  Confirmed: 'success',
  Tentative: 'warn',
  Cancelled: 'danger'
};

@Component({
  selector: 'app-aircraft-assignment',
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
    TagModule,
    IconFieldModule,
    InputIconModule,
    PageHeader,
    StatCard
  ],
  templateUrl: './aircraft-assignment.html',
  styleUrl: './aircraft-assignment.scss'
})
export class AircraftAssignmentPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly statuses = STATUSES;

  assignments = signal<AircraftAssignment[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingAssignment = signal<AircraftAssignment | null>(null);
  saving = signal(false);

  filterFlightNo = signal('');
  filterAircraftReg = signal('');
  filterAssignedBy = signal('');
  filterStatus = signal<AssignmentStatus | null>(null);
  filterSearch = signal('');

  hasActiveFilters = computed(
    () =>
      this.filterFlightNo().trim().length > 0 ||
      this.filterAircraftReg().trim().length > 0 ||
      this.filterAssignedBy().trim().length > 0 ||
      !!this.filterStatus() ||
      this.filterSearch().trim().length > 0
  );

  filteredAssignments = computed(() => {
    const rows = this.assignments();
    const flightNo = this.filterFlightNo().trim().toLowerCase();
    const aircraftReg = this.filterAircraftReg().trim().toLowerCase();
    const assignedBy = this.filterAssignedBy().trim().toLowerCase();
    const status = this.filterStatus();
    const search = this.filterSearch().trim().toLowerCase();

    return rows.filter((assignment) => {
      if (flightNo && !assignment.flightNo.toLowerCase().includes(flightNo)) return false;
      if (aircraftReg && !assignment.aircraftReg.toLowerCase().includes(aircraftReg)) return false;
      if (assignedBy && !assignment.assignedBy.toLowerCase().includes(assignedBy)) return false;
      if (status && assignment.status !== status) return false;
      if (search) {
        const haystack = `${assignment.flightNo} ${assignment.aircraftReg} ${assignment.assignedBy}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  stats = computed(() => {
    const rows = this.assignments();
    return {
      total: rows.length,
      confirmed: rows.filter((a) => a.status === 'Confirmed').length,
      tentative: rows.filter((a) => a.status === 'Tentative').length,
      cancelled: rows.filter((a) => a.status === 'Cancelled').length
    };
  });

  form = this.fb.nonNullable.group({
    flightNo: ['', Validators.required],
    aircraftReg: ['', Validators.required],
    assignedDate: this.fb.control<Date | null>(null, Validators.required),
    assignedBy: ['', Validators.required],
    status: this.fb.control<AssignmentStatus>('Tentative', { nonNullable: true, validators: Validators.required })
  });

  ngOnInit(): void {
    this.load();
  }

  severity(status: AssignmentStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  clearFilters(): void {
    this.filterFlightNo.set('');
    this.filterAircraftReg.set('');
    this.filterAssignedBy.set('');
    this.filterStatus.set(null);
    this.filterSearch.set('');
  }

  openNew(): void {
    this.editingAssignment.set(null);
    this.form.reset({
      flightNo: '',
      aircraftReg: '',
      assignedDate: null,
      assignedBy: '',
      status: 'Tentative'
    });
    this.dialogVisible.set(true);
  }

  openEdit(assignment: AircraftAssignment): void {
    this.editingAssignment.set(assignment);
    this.form.reset({
      flightNo: assignment.flightNo,
      aircraftReg: assignment.aircraftReg,
      assignedDate: new Date(assignment.assignedDate),
      assignedBy: assignment.assignedBy,
      status: assignment.status
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
      assignedDate: value.assignedDate!.toISOString().slice(0, 10)
    };
    const editing = this.editingAssignment();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<AircraftAssignment>(RESOURCE, editing.id, payload)
      : this.api.create<AircraftAssignment>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({
          severity: 'success',
          summary: editing ? 'Assignment updated' : 'Assignment created',
          detail: `${payload.flightNo} / ${payload.aircraftReg}`
        });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(assignment: AircraftAssignment): void {
    this.confirmation.confirm({
      header: 'Delete Assignment',
      message: `Remove assignment ${assignment.flightNo} / ${assignment.aircraftReg}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, assignment.id).subscribe({
          next: () => {
            this.messages.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `Assignment ${assignment.flightNo} / ${assignment.aircraftReg} removed.`
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
    this.api.list<AircraftAssignment>(RESOURCE).subscribe({
      next: (res) => {
        this.assignments.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load assignments.' });
      }
    });
  }
}
