import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type RouteStatus = 'Active' | 'Under Review' | 'Suspended';

export interface RoutePlan {
  id: string;
  routeCode: string;
  origin: string;
  destination: string;
  distanceNm: number;
  estFlightTime: string;
  status: RouteStatus;
  aircraftType: string;
  frequency: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

const RESOURCE = 'route-planning';
const STATUSES: RouteStatus[] = ['Active', 'Under Review', 'Suspended'];
const STATUS_SEVERITY: Record<RouteStatus, TagSeverity> = {
  Active: 'success',
  'Under Review': 'warn',
  Suspended: 'danger'
};

const AIRCRAFT_TYPES = ['Boeing 737-800', 'Boeing 777-300ER', 'Airbus A320neo', 'Airbus A350-900', 'Dash 8-Q400'];
const FREQUENCIES = ['Daily', 'Weekdays', 'Weekends', 'Mon/Wed/Fri', 'Tue/Thu/Sat'];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

@Component({
  selector: 'app-route-planning',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
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
  templateUrl: './route-planning.html',
  styleUrl: './route-planning.scss'
})
export class RoutePlanningPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly statuses = STATUSES;
  readonly aircraftTypes = AIRCRAFT_TYPES;
  readonly frequencies = FREQUENCIES;

  routes = signal<RoutePlan[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingRoute = signal<RoutePlan | null>(null);
  saving = signal(false);

  filterOrigin = signal('');
  filterDestination = signal('');
  filterStatus = signal<RouteStatus | null>(null);
  filterAircraftType = signal<string | null>(null);
  filterSearch = signal('');

  hasActiveFilters = computed(
    () =>
      this.filterOrigin().trim().length > 0 ||
      this.filterDestination().trim().length > 0 ||
      !!this.filterStatus() ||
      !!this.filterAircraftType() ||
      this.filterSearch().trim().length > 0
  );

  filteredRoutes = computed(() => {
    const rows = this.routes();
    const origin = this.filterOrigin().trim().toLowerCase();
    const destination = this.filterDestination().trim().toLowerCase();
    const status = this.filterStatus();
    const aircraftType = this.filterAircraftType();
    const search = this.filterSearch().trim().toLowerCase();

    return rows.filter((route) => {
      if (origin && !route.origin.toLowerCase().includes(origin)) return false;
      if (destination && !route.destination.toLowerCase().includes(destination)) return false;
      if (status && route.status !== status) return false;
      if (aircraftType && route.aircraftType !== aircraftType) return false;
      if (search) {
        const haystack = `${route.routeCode} ${route.origin} ${route.destination} ${route.aircraftType} ${route.frequency}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  stats = computed(() => {
    const rows = this.routes();
    return {
      total: rows.length,
      active: rows.filter((r) => r.status === 'Active').length,
      review: rows.filter((r) => r.status === 'Under Review').length,
      suspended: rows.filter((r) => r.status === 'Suspended').length
    };
  });

  form = this.fb.nonNullable.group({
    routeCode: ['', Validators.required],
    origin: ['', [Validators.required, Validators.maxLength(3)]],
    destination: ['', [Validators.required, Validators.maxLength(3)]],
    distanceNm: [0, [Validators.required, Validators.min(1)]],
    estFlightTime: ['', Validators.required],
    status: this.fb.control<RouteStatus>('Active', { nonNullable: true, validators: Validators.required }),
    aircraftType: this.fb.control<string>(AIRCRAFT_TYPES[0], { nonNullable: true, validators: Validators.required }),
    frequency: this.fb.control<string>(FREQUENCIES[0], { nonNullable: true, validators: Validators.required }),
    effectiveFrom: this.fb.control<Date | null>(null, Validators.required),
    effectiveTo: this.fb.control<Date | null>(null)
  });

  ngOnInit(): void {
    this.load();
  }

  severity(status: RouteStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  clearFilters(): void {
    this.filterOrigin.set('');
    this.filterDestination.set('');
    this.filterStatus.set(null);
    this.filterAircraftType.set(null);
    this.filterSearch.set('');
  }

  openNew(): void {
    this.editingRoute.set(null);
    this.form.reset({
      routeCode: '',
      origin: '',
      destination: '',
      distanceNm: 0,
      estFlightTime: '',
      status: 'Active',
      aircraftType: AIRCRAFT_TYPES[0],
      frequency: FREQUENCIES[0],
      effectiveFrom: null,
      effectiveTo: null
    });
    this.dialogVisible.set(true);
  }

  openEdit(route: RoutePlan): void {
    this.editingRoute.set(route);
    this.form.reset({
      routeCode: route.routeCode,
      origin: route.origin,
      destination: route.destination,
      distanceNm: route.distanceNm,
      estFlightTime: route.estFlightTime,
      status: route.status,
      aircraftType: route.aircraftType,
      frequency: route.frequency,
      effectiveFrom: new Date(route.effectiveFrom),
      effectiveTo: route.effectiveTo ? new Date(route.effectiveTo) : null
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
      effectiveFrom: value.effectiveFrom!.toISOString(),
      effectiveTo: value.effectiveTo ? value.effectiveTo.toISOString() : undefined
    };
    const editing = this.editingRoute();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<RoutePlan>(RESOURCE, editing.id, payload)
      : this.api.create<RoutePlan>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({
          severity: 'success',
          summary: editing ? 'Route updated' : 'Route created',
          detail: payload.routeCode
        });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(route: RoutePlan): void {
    this.confirmation.confirm({
      header: 'Delete Route',
      message: `Remove route ${route.routeCode} (${route.origin} → ${route.destination})?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, route.id).subscribe({
          next: () => {
            this.messages.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `Route ${route.routeCode} removed.`
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
    this.api.list<RoutePlan>(RESOURCE).subscribe({
      next: (res) => {
        this.routes.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load routes.' });
      }
    });
  }
}
