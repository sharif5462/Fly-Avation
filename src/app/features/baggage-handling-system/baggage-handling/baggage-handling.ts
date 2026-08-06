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
import { TooltipModule } from 'primeng/tooltip';

import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type BagType = 'Checked' | 'Priority' | 'Oversize' | 'Fragile';
export type RouteType = 'Origin' | 'Transfer' | 'Transit';
export type BaggageStatus = 'Checked In' | 'Screened' | 'Sorted' | 'Loaded' | 'In Transfer' | 'Arrived' | 'Delivered' | 'Mishandled';

export interface BaggageRecord {
  id: string;
  tagNo: string;
  passengerName: string;
  pnr: string;
  flightNo: string;
  bagType: BagType;
  routeType: RouteType;
  beltNo: string;
  weightKg: number;
  checkedInTime: string | null;
  loadedTime: string | null;
  transferTime: string | null;
  arrivedTime: string | null;
  status: BaggageStatus;
}

interface TrackingStep {
  label: string;
  done: boolean;
  na: boolean;
}

const RESOURCE = 'baggage-handling';
const BAG_TYPES: BagType[] = ['Checked', 'Priority', 'Oversize', 'Fragile'];
const ROUTE_TYPES: RouteType[] = ['Origin', 'Transfer', 'Transit'];
const STATUSES: BaggageStatus[] = ['Checked In', 'Screened', 'Sorted', 'Loaded', 'In Transfer', 'Arrived', 'Delivered', 'Mishandled'];

const STATUS_SEVERITY: Record<BaggageStatus, TagSeverity> = {
  'Checked In': 'info',
  Screened: 'info',
  Sorted: 'secondary',
  Loaded: 'warn',
  'In Transfer': 'warn',
  Arrived: 'success',
  Delivered: 'success',
  Mishandled: 'danger'
};

@Component({
  selector: 'app-baggage-handling',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    PageHeader,
    StatCard
  ],
  templateUrl: './baggage-handling.html'
})
export class BaggageHandlingPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly bagTypes = BAG_TYPES;
  readonly routeTypes = ROUTE_TYPES;
  readonly statuses = STATUSES;

  bags = signal<BaggageRecord[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingBag = signal<BaggageRecord | null>(null);
  saving = signal(false);

  stats = computed(() => {
    const rows = this.bags();
    return {
      total: rows.length,
      fullyTracked: rows.filter((b) => this.isFullyTracked(b)).length,
      inTransfer: rows.filter((b) => b.routeType === 'Transfer' && b.status !== 'Arrived' && b.status !== 'Delivered').length,
      mishandled: rows.filter((b) => b.status === 'Mishandled').length
    };
  });

  form = this.fb.nonNullable.group({
    tagNo: ['', Validators.required],
    passengerName: ['', Validators.required],
    pnr: ['', Validators.required],
    flightNo: ['', Validators.required],
    bagType: this.fb.control<BagType>('Checked', { nonNullable: true, validators: Validators.required }),
    routeType: this.fb.control<RouteType>('Origin', { nonNullable: true, validators: Validators.required }),
    beltNo: ['', Validators.required],
    weightKg: this.fb.control<number | null>(null, Validators.required),
    checkedInTime: this.fb.control<Date | null>(new Date(), Validators.required),
    loadedTime: this.fb.control<Date | null>(null),
    transferTime: this.fb.control<Date | null>(null),
    arrivedTime: this.fb.control<Date | null>(null),
    status: this.fb.control<BaggageStatus>('Checked In', { nonNullable: true, validators: Validators.required })
  });

  ngOnInit(): void {
    this.load();
  }

  statusSeverity(status: BaggageStatus): TagSeverity {
    return STATUS_SEVERITY[status];
  }

  /** IATA Resolution 753 requires 4 tracking points for transfer bags; origin/transit bags skip the transfer scan. */
  isFullyTracked(bag: BaggageRecord): boolean {
    return this.trackingSteps(bag).every((step) => step.na || step.done);
  }

  trackingSteps(bag: BaggageRecord): TrackingStep[] {
    return [
      { label: 'Check-in', done: !!bag.checkedInTime, na: false },
      { label: 'Loaded', done: !!bag.loadedTime, na: false },
      { label: 'Transfer', done: !!bag.transferTime, na: bag.routeType !== 'Transfer' },
      { label: 'Arrived', done: !!bag.arrivedTime, na: false }
    ];
  }

  openNew(): void {
    this.editingBag.set(null);
    this.form.reset({
      bagType: 'Checked',
      routeType: 'Origin',
      status: 'Checked In',
      checkedInTime: new Date(),
      tagNo: '',
      passengerName: '',
      pnr: '',
      flightNo: '',
      beltNo: '',
      weightKg: null,
      loadedTime: null,
      transferTime: null,
      arrivedTime: null
    });
    this.dialogVisible.set(true);
  }

  openEdit(bag: BaggageRecord): void {
    this.editingBag.set(bag);
    this.form.setValue({
      tagNo: bag.tagNo,
      passengerName: bag.passengerName,
      pnr: bag.pnr,
      flightNo: bag.flightNo,
      bagType: bag.bagType,
      routeType: bag.routeType,
      beltNo: bag.beltNo,
      weightKg: bag.weightKg,
      checkedInTime: bag.checkedInTime ? new Date(bag.checkedInTime) : null,
      loadedTime: bag.loadedTime ? new Date(bag.loadedTime) : null,
      transferTime: bag.transferTime ? new Date(bag.transferTime) : null,
      arrivedTime: bag.arrivedTime ? new Date(bag.arrivedTime) : null,
      status: bag.status
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
      weightKg: value.weightKg!,
      checkedInTime: value.checkedInTime ? value.checkedInTime.toISOString() : null,
      loadedTime: value.loadedTime ? value.loadedTime.toISOString() : null,
      transferTime: value.transferTime ? value.transferTime.toISOString() : null,
      arrivedTime: value.arrivedTime ? value.arrivedTime.toISOString() : null
    };
    const editing = this.editingBag();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<BaggageRecord>(RESOURCE, editing.id, payload)
      : this.api.create<BaggageRecord>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({ severity: 'success', summary: editing ? 'Baggage record updated' : 'Baggage record created', detail: payload.tagNo });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(bag: BaggageRecord): void {
    this.confirmation.confirm({
      header: 'Delete Baggage Record',
      message: `Delete baggage tag ${bag.tagNo} for ${bag.passengerName}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, bag.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Deleted', detail: `Baggage tag ${bag.tagNo} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<BaggageRecord>(RESOURCE).subscribe({
      next: (res) => {
        this.bags.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load baggage records.' });
      }
    });
  }
}
