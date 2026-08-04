import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { getEntityConfig } from '../../../core/data/entity-configs';
import { EntityConfig, EntityField, TagSeverity } from '../../../core/models/entity-config.model';
import { ApiService } from '../../../core/services/api.service';
import { PageHeader } from '../../components/page-header/page-header';

type Row = Record<string, unknown> & { id: string };

/**
 * Renders a real, working CRUD screen — search, sortable table, add/edit
 * dialog with validation, delete confirmation — for any entity described in
 * core/data/entity-configs.ts. Every non-flagship sub-item in the manifest
 * routes here with a different `entityKey`; this one component is the
 * generic scaffold behind ~120 of the app's pages.
 */
@Component({
  selector: 'app-feature-list-page',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    CheckboxModule,
    TextareaModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    PageHeader
  ],
  templateUrl: './feature-list-page.html'
})
export class FeatureListPage implements OnInit {
  entityKey = input.required<string>();

  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  config = computed<EntityConfig | undefined>(() => getEntityConfig(this.entityKey()));
  tableFields = computed<EntityField[]>(() => (this.config()?.fields ?? []).filter((field) => !field.hideInTable));
  formFields = computed<EntityField[]>(() => (this.config()?.fields ?? []).filter((field) => !field.hideInForm));
  filterFieldKeys = computed(() => this.tableFields().map((field) => field.key));

  rows = signal<Row[]>([]);
  loading = signal(true);
  dialogVisible = signal(false);
  editingRow = signal<Row | null>(null);
  saving = signal(false);
  form: FormGroup = this.fb.group({});

  // Every manifest item routes here through its own distinct route config
  // (see app.routes.ts), so Angular's default RouteReuseStrategy destroys
  // and recreates this component on every navigation between sibling
  // scaffold pages — ngOnInit reliably re-runs with the new entityKey.
  ngOnInit(): void {
    // The dialog's <form> template binds formControlName for every
    // formFields() entry as soon as this component renders — even while the
    // dialog itself is hidden — so `form` needs its controls built up front,
    // not lazily inside openNew()/openEdit(), or Angular throws "Cannot find
    // control with name" the instant the page loads.
    this.buildForm();
    this.load();
  }

  private load(): void {
    const cfg = this.config();
    if (!cfg) {
      this.rows.set([]);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.api.list<Row>(cfg.key).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.rows.set([]);
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Load failed', detail: `Could not load ${cfg.pluralLabel}.` });
      }
    });
  }

  severityFor(field: EntityField, value: unknown): TagSeverity | undefined {
    return field.options?.find((opt) => opt.value === value)?.severity;
  }

  displayValue(field: EntityField, row: Row): string {
    const raw = row[field.key];
    if (raw === null || raw === undefined || raw === '') return '—';

    switch (field.type) {
      case 'boolean':
        return raw ? 'Yes' : 'No';
      case 'date':
        return new Date(raw as string).toLocaleDateString();
      case 'datetime':
        return new Date(raw as string).toLocaleString();
      case 'number': {
        const numeric = Number(raw);
        const formatted =
          field.prefix === '$'
            ? numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : numeric.toLocaleString();
        return `${field.prefix ?? ''}${formatted}${field.suffix ? ' ' + field.suffix : ''}`;
      }
      default:
        return String(raw);
    }
  }

  openNew(): void {
    this.editingRow.set(null);
    this.buildForm();
    this.dialogVisible.set(true);
  }

  openEdit(row: Row): void {
    this.editingRow.set(row);
    this.buildForm();
    this.form.patchValue(this.coerceForForm(row));
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const cfg = this.config();
    if (!cfg) return;

    this.saving.set(true);
    const payload = this.coerceForSave(this.form.value);
    const editing = this.editingRow();
    const request$ = editing ? this.api.update(cfg.key, editing['id'] as string, payload) : this.api.create(cfg.key, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({
          severity: 'success',
          summary: editing ? 'Updated' : 'Created',
          detail: `${cfg.label} saved successfully.`
        });
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Save failed', detail: 'Please try again.' });
      }
    });
  }

  confirmDelete(row: Row): void {
    const cfg = this.config();
    if (!cfg) return;

    this.confirmation.confirm({
      header: `Delete ${cfg.label}`,
      message: `Are you sure you want to delete this ${cfg.label.toLowerCase()}? This cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.api.remove(cfg.key, row['id'] as string).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Deleted', detail: `${cfg.label} removed.` });
            this.load();
          },
          error: () => this.messages.add({ severity: 'error', summary: 'Delete failed', detail: 'Please try again.' })
        });
      }
    });
  }

  private buildForm(): void {
    const controls: Record<string, unknown> = {};
    for (const field of this.formFields()) {
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.type === 'email') validators.push(Validators.email);
      if (field.minLength != null) validators.push(Validators.minLength(field.minLength));
      if (field.maxLength != null) validators.push(Validators.maxLength(field.maxLength));
      if (field.min != null) validators.push(Validators.min(field.min));
      if (field.max != null) validators.push(Validators.max(field.max));
      controls[field.key] = [this.defaultValueFor(field), validators];
    }
    this.form = this.fb.group(controls);
  }

  private defaultValueFor(field: EntityField): unknown {
    if (field.type === 'boolean') return false;
    if (field.type === 'number') return null;
    return '';
  }

  private coerceForForm(row: Row): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const field of this.formFields()) {
      const raw = row[field.key];
      if ((field.type === 'date' || field.type === 'datetime') && typeof raw === 'string' && raw) {
        out[field.key] = new Date(raw);
      } else {
        out[field.key] = raw ?? this.defaultValueFor(field);
      }
    }
    return out;
  }

  private coerceForSave(value: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const field of this.formFields()) {
      const raw = value[field.key];
      if (field.type === 'date' && raw instanceof Date) {
        out[field.key] = raw.toISOString().slice(0, 10);
      } else if (field.type === 'datetime' && raw instanceof Date) {
        out[field.key] = raw.toISOString();
      } else {
        out[field.key] = raw;
      }
    }
    return out;
  }
}
