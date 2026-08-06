import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
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
import { formatDate, formatDateTime, fromDateOnly, toDateOnly, toInstant } from '../../../core/utils/date.util';
import { PageHeader } from '../../components/page-header/page-header';

type Row = Record<string, unknown> & { id: string };

/** Placeholder for a value that is absent, not one that failed to parse. */
const EMPTY_DISPLAY = '—';

/** `EntityField.prefix` value that marks a number field as currency. */
const CURRENCY_PREFIX = '$';

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
export class FeatureListPage {
  entityKey = input.required<string>();

  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

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

  constructor() {
    // Keyed off the input signal rather than ngOnInit: Angular's default
    // RouteReuseStrategy happens to destroy and recreate this component
    // between sibling scaffold pages today (each manifest item has its own
    // route config), but that is an implementation detail of the router, not
    // a guarantee. Reacting to entityKey directly means a reused instance
    // still reloads instead of silently showing the previous entity's rows.
    //
    // The dialog's <form> binds formControlName for every formFields() entry
    // as soon as the page renders — even while the dialog is hidden — so the
    // controls have to exist before the first render, not lazily inside
    // openNew()/openEdit(), or Angular throws "Cannot find control with name".
    effect(() => {
      this.entityKey();
      this.closeDialog();
      this.buildForm();
      this.load();
    });
  }

  private load(): void {
    const cfg = this.config();
    if (!cfg) {
      this.rows.set([]);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.api
      .list<Row>(cfg.key)
      // Without this, a response that lands after the user has navigated on
      // writes rows for the previous entity into a destroyed component.
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
    if (raw === null || raw === undefined || raw === '') return EMPTY_DISPLAY;

    switch (field.type) {
      case 'boolean':
        return raw ? 'Yes' : 'No';
      // Both go through date.util so a 'YYYY-MM-DD' value is read as a local
      // calendar day instead of UTC midnight, which renders as the previous
      // day for every user west of UTC.
      case 'date':
        return formatDate(raw) ?? String(raw);
      case 'datetime':
        return formatDateTime(raw) ?? String(raw);
      case 'number': {
        const numeric = Number(raw);
        // A non-numeric value in a numeric column is bad data, not zero —
        // show it verbatim rather than rendering the string "NaN".
        if (!Number.isFinite(numeric)) return String(raw);
        const formatted = this.isCurrency(field)
          ? numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : numeric.toLocaleString();
        return `${field.prefix ?? ''}${formatted}${field.suffix ? ' ' + field.suffix : ''}`;
      }
      default:
        return String(raw);
    }
  }

  /** A '$' prefix is the config's way of saying "money" — always two decimals. */
  isCurrency(field: EntityField): boolean {
    return field.prefix === CURRENCY_PREFIX;
  }

  /**
   * The specific reason a control is invalid. Previously every field reported
   * "<label> is required", so a too-short code or an out-of-range number told
   * the user to fill in a field they had already filled in.
   */
  errorMessage(field: EntityField): string | null {
    const control = this.form.get(field.key);
    if (!control || control.valid || !control.touched) return null;

    const errors = control.errors ?? {};
    if (errors['required']) return `${field.label} is required.`;
    if (errors['email']) return `${field.label} must be a valid email address.`;
    if (errors['minlength']) {
      return `${field.label} must be at least ${(errors['minlength'] as { requiredLength: number }).requiredLength} characters.`;
    }
    if (errors['maxlength']) {
      return `${field.label} must be at most ${(errors['maxlength'] as { requiredLength: number }).requiredLength} characters.`;
    }
    if (errors['min']) return `${field.label} must be ${(errors['min'] as { min: number }).min} or more.`;
    if (errors['max']) return `${field.label} must be ${(errors['max'] as { max: number }).max} or less.`;
    return `${field.label} is invalid.`;
  }

  /** Row-level accessible name for the icon-only action buttons. */
  rowLabel(row: Row): string {
    const cfg = this.config();
    if (!cfg) return 'record';
    const titleField = this.tableFields()[0];
    const title = titleField ? this.displayValue(titleField, row) : EMPTY_DISPLAY;
    return title === EMPTY_DISPLAY ? cfg.label : `${cfg.label} ${title}`;
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

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.editingRow.set(null);
    this.saving.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const cfg = this.config();
    if (!cfg || this.saving()) return;

    this.saving.set(true);
    // getRawValue(), not `value`: `value` omits disabled controls, which would
    // silently drop those fields from the PUT payload.
    const payload = this.coerceForSave(this.form.getRawValue());
    const editing = this.editingRow();
    const request$ = editing ? this.api.update(cfg.key, editing['id'] as string, payload) : this.api.create(cfg.key, payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.closeDialog();
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
        this.api.remove(cfg.key, row['id'] as string).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
      const validators: ValidatorFn[] = [];
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
      if (field.type === 'date' || field.type === 'datetime') {
        // fromDateOnly, not `new Date(raw)`: a 'YYYY-MM-DD' string parses as
        // UTC midnight per spec, so the picker would open on the previous day
        // for anyone west of UTC.
        out[field.key] = fromDateOnly(raw as string | Date | null) ?? this.defaultValueFor(field);
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
      if (field.type === 'date') {
        // A date-only field is a calendar day, so it is serialized from the
        // picker's *local* Y/M/D. toISOString() would shift it back a day for
        // every user east of UTC.
        out[field.key] = raw instanceof Date ? toDateOnly(raw) : (raw ?? null);
      } else if (field.type === 'datetime') {
        out[field.key] = raw instanceof Date ? toInstant(raw) : (raw ?? null);
      } else {
        out[field.key] = raw;
      }
    }
    return out;
  }
}
