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

export type CrewRole = 'Captain' | 'First Officer' | 'Purser' | 'Flight Attendant';
export type AssignmentStatus = 'Confirmed' | 'Pending' | 'Swapped';

export interface CrewAssignment {
  id: string;
  flightNo: string;
  crewMember: string;
  role: CrewRole;
  assignedDate: string;
  status: AssignmentStatus;
}

const RESOURCE = 'crew-assignment';
const ROLES: CrewRole[] = ['Captain', 'First Officer', 'Purser', 'Flight Attendant'];
const STATUSES: AssignmentStatus[] = ['Confirmed', 'Pending', 'Swapped'];
const STATUS_SEVERITY: Record<AssignmentStatus, TagSeverity> = {
  Confirmed: 'success',
  Pending: 'info',
  Swapped: 'warn'
};

@Component({
  selector: 'app-crew-assignment',
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
  templateUrl: './crew-assignment.html',
  styleUrl: './crew-assignment.scss'
})
export class CrewAssignmentPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly roles = ROLES;
  readonly statuses = STATUSES;

  assignments = signal<CrewAssignment[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingAssignment = signal<CrewAssignment | null>(null);
  saving = signal(false);

  filterFlightNo = signal('');
  filterCrewMember = signal('');
  filterRole = signal<CrewRole | null>(null);
  filterStatus = signal<AssignmentStatus | null>(null);
  filterSearch = signal('');

  hasActiveFilters = computed(
    () =>
      this.filterFlightNo().trim().length > 0 ||
      this.filterCrewMember().trim().length > 0 ||
      !!this.filterRole() ||
      !!this.filterStatus() ||
      this.filterSearch().trim().length > 0
  );

  filteredAssignments = computed(() => {
    const rows = this.assignments();
    const flightNo = this.filterFlightNo().trim().toLowerCase();
    const crewMember = this.filterCrewMember().trim().toLowerCase();
    const role = this.filterRole();
    const status = this.filterStatus();
    const search = this.filterSearch().trim().toLowerCase();

    return rows.filter((assignment) => {
      if (flightNo && !assignment.flightNo.toLowerCase().includes(flightNo)) return false;
      if (crewMember && !assignment.crewMember.toLowerCase().includes(crewMember)) return false;
      if (role && assignment.role !== role) return false;
      if (status && assignment.status !== status) return false;
      if (search) {
        const haystack = `${assignment.flightNo} ${assignment.crewMember} ${assignment.role} ${assignment.status}`.toLowerCase();
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
      pending: rows.filter((a) => a.status === 'Pending').length,
      swapped: rows.filter((a) => a.status === 'Swapped').length
    };
  });

  form = this.fb.nonNullable.group({
    flightNo: ['', Validators.required],
    crewMember: ['', Validators.required],
    role: this.fb.control<CrewRole>('Captain', { nonNullable: true, validators: Validators.required }),
    assignedDate: this.fb.control<Date | null>(null, Validators.required),
    status: this.fb.control<AssignmentStatus>('Pending', { nonNullable: true, validators: Validators.required })
  });

  ngOnInit(): void {
    this.load();
  }

  severity(status: AssignmentStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  clearFilters(): void {
    this.filterFlightNo.set('');
    this.filterCrewMember.set('');
    this.filterRole.set(null);
    this.filterStatus.set(null);
    this.filterSearch.set('');
  }

  openNew(): void {
    this.editingAssignment.set(null);
    this.form.reset({
      flightNo: '',
      crewMember: '',
      role: 'Captain',
      assignedDate: null,
      status: 'Pending'
    });
    this.dialogVisible.set(true);
  }

  openEdit(assignment: CrewAssignment): void {
    this.editingAssignment.set(assignment);
    this.form.reset({
      flightNo: assignment.flightNo,
      crewMember: assignment.crewMember,
      role: assignment.role,
      assignedDate: new Date(assignment.assignedDate),
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
      ? this.api.update<CrewAssignment>(RESOURCE, editing.id, payload)
      : this.api.create<CrewAssignment>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({
          severity: 'success',
          summary: editing ? 'Crew assignment updated' : 'Crew assignment created',
          detail: `${payload.crewMember} on ${payload.flightNo}`
        });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(assignment: CrewAssignment): void {
    this.confirmation.confirm({
      header: 'Delete Crew Assignment',
      message: `Remove ${assignment.crewMember} from flight ${assignment.flightNo}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, assignment.id).subscribe({
          next: () => {
            this.messages.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `Crew assignment for ${assignment.flightNo} removed.`
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
    this.api.list<CrewAssignment>(RESOURCE).subscribe({
      next: (res) => {
        this.assignments.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load crew assignments.' });
      }
    });
  }
}
