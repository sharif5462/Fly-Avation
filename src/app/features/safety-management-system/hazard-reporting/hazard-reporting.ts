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
  AFFECTED_AREAS,
  FLIGHT_PHASES,
  HAZARD_CATEGORIES,
  HAZARD_DATE_FIELDS,
  HAZARD_SOURCES,
  HAZARD_STATUSES,
  HAZARD_STATUS_SEVERITY,
  HazardReport,
  HazardStatus,
  LIKELIHOOD_LEVELS,
  LikelihoodLevel,
  RISK_TOLERABILITY,
  RISK_TOLERABILITY_SEVERITY,
  RiskTolerability,
  SEVERITY_LEVELS,
  SeverityLevel
} from '../../../core/models/sms.model';
import { TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

export type { HazardReport } from '../../../core/models/sms.model';

const RESOURCE = 'hazard-reporting';

@Component({
  selector: 'app-hazard-reporting',
  imports: [
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
  templateUrl: './hazard-reporting.html'
})
export class HazardReportingPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly hazardSources = HAZARD_SOURCES;
  readonly hazardCategories = HAZARD_CATEGORIES;
  readonly affectedAreas = AFFECTED_AREAS;
  readonly flightPhases = FLIGHT_PHASES;
  readonly likelihoodLevels: string[] = [...LIKELIHOOD_LEVELS];
  readonly severityLevels: string[] = [...SEVERITY_LEVELS];
  readonly tolerabilityLevels: string[] = [...RISK_TOLERABILITY];
  readonly statuses: string[] = [...HAZARD_STATUSES];

  hazards = signal<HazardReport[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editing = signal<HazardReport | null>(null);
  saving = signal(false);
  activeTab = signal('0');

  stats = computed(() => {
    const rows = this.hazards();
    return {
      total: rows.length,
      open: rows.filter((h) => h.status === 'Open').length,
      unacceptable: rows.filter((h) => h.riskTolerability === 'Unacceptable').length,
      closed: rows.filter((h) => h.status === 'Closed').length
    };
  });

  form = this.fb.nonNullable.group({
    // Hazard Details
    hazardNo: ['', Validators.required],
    hazardTitle: ['', Validators.required],
    dateIdentified: this.fb.control<Date | null>(null, Validators.required),
    reportedBy: [''],
    department: [''],
    source: this.fb.nonNullable.control<string>('Line Operations', Validators.required),
    description: [''],
    location: [''],

    // Classification
    hazardCategory: ['', Validators.required],
    affectedArea: ['', Validators.required],
    aircraftReg: [''],
    flightPhase: this.fb.nonNullable.control<string>('N/A'),

    // Risk Assessment
    initialLikelihood: this.fb.nonNullable.control<LikelihoodLevel>('Possible', Validators.required),
    initialSeverity: this.fb.nonNullable.control<SeverityLevel>('Minor', Validators.required),
    initialRiskScore: [1, [Validators.min(1), Validators.max(25)]],
    riskTolerability: this.fb.nonNullable.control<RiskTolerability>('Tolerable', Validators.required),

    // Mitigation
    mitigationActions: [''],
    responsiblePerson: [''],
    targetCompletionDate: this.fb.control<Date | null>(null),
    residualLikelihood: this.fb.nonNullable.control<LikelihoodLevel>('Unlikely'),
    residualSeverity: this.fb.nonNullable.control<SeverityLevel>('Minor'),
    residualRiskScore: [1, [Validators.min(1), Validators.max(25)]],

    // Status & Closure
    status: this.fb.nonNullable.control<HazardStatus>('Open', Validators.required),
    closedDate: this.fb.control<Date | null>(null),
    closedBy: [''],
    verifiedEffective: [false]
  });

  ngOnInit(): void {
    this.load();
  }

  statusSeverity(status: HazardStatus): TagSeverity {
    return HAZARD_STATUS_SEVERITY[status];
  }

  tolerabilitySeverity(tolerability: RiskTolerability): TagSeverity {
    return RISK_TOLERABILITY_SEVERITY[tolerability];
  }

  openNew(): void {
    this.editing.set(null);
    this.form.reset();
    this.activeTab.set('0');
    this.dialogVisible.set(true);
  }

  openEdit(hazard: HazardReport): void {
    this.editing.set(hazard);
    const patch: Record<string, unknown> = { ...hazard };
    for (const key of HAZARD_DATE_FIELDS) {
      const value = hazard[key];
      patch[key] = value ? new Date(value) : null;
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
    for (const key of HAZARD_DATE_FIELDS) {
      const value = payload[key] as Date | null;
      payload[key] = value ? value.toISOString().slice(0, 10) : null;
    }

    const editing = this.editing();
    this.saving.set(true);
    const request$ = editing
      ? this.api.update<HazardReport>(RESOURCE, editing.id, payload)
      : this.api.create<HazardReport>(RESOURCE, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({
          severity: 'success',
          summary: editing ? 'Hazard updated' : 'Hazard reported',
          detail: String(payload['hazardTitle'])
        });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(hazard: HazardReport): void {
    this.confirmation.confirm({
      header: 'Remove Hazard Report',
      message: `Remove ${hazard.hazardNo} — ${hazard.hazardTitle} from the hazard register?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Remove', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(RESOURCE, hazard.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Removed', detail: `${hazard.hazardNo} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list<HazardReport>(RESOURCE).subscribe({
      next: (res) => {
        this.hazards.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load the hazard register.' });
      }
    });
  }
}
