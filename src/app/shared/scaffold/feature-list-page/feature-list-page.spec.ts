import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';

import { FeatureListPage } from './feature-list-page';
import { environment } from '../../../../environments/environment';
import { EntityField } from '../../../core/models/entity-config.model';
import { toDateOnly } from '../../../core/utils/date.util';

/** A real manifest entity: text, number and a badge select, no date field. */
const ENTITY_KEY = 'route-planning';
const LIST_URL = `${environment.apiUrl}/${ENTITY_KEY}`;

/** A real manifest entity that does carry a date field, for the date round-trip. */
const DATE_ENTITY_KEY = 'aircraft-assignment';
const DATE_LIST_URL = `${environment.apiUrl}/${DATE_ENTITY_KEY}`;

describe('FeatureListPage', () => {
  let fixture: ComponentFixture<FeatureListPage>;
  let page: FeatureListPage;
  let http: HttpTestingController;

  function field(overrides: Partial<EntityField>): EntityField {
    return { key: 'f', label: 'Field', type: 'text', ...overrides };
  }

  function flushList(rows: Record<string, unknown>[] = []): void {
    http.expectOne(LIST_URL).flush({ data: rows, total: rows.length });
    fixture.detectChanges();
  }

  /** Fills every control with a type-appropriate value so the form validates. */
  function fillForm(): void {
    for (const f of page.formFields()) {
      const control = page.form.get(f.key)!;
      if (f.type === 'date' || f.type === 'datetime') control.setValue(new Date(2026, 7, 6));
      else if (f.type === 'number') control.setValue(1);
      else if (f.type === 'boolean') control.setValue(true);
      else if (f.type === 'email') control.setValue('someone@aviation-erp.test');
      else if (f.type === 'select') control.setValue(f.options?.[0]?.value ?? 'x');
      else control.setValue('value');
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FeatureListPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        MessageService,
        ConfirmationService
      ]
    });

    fixture = TestBed.createComponent(FeatureListPage);
    http = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('entityKey', ENTITY_KEY);
    page = fixture.componentInstance;
  });

  afterEach(() => http.verify());

  describe('loading', () => {
    it('resolves the entity config from the route key', () => {
      fixture.detectChanges();
      flushList();

      expect(page.config()?.key).toBe(ENTITY_KEY);
    });

    it('loads rows for the configured resource', () => {
      fixture.detectChanges();
      flushList([{ id: '1' }, { id: '2' }]);

      expect(page.rows().length).toBe(2);
      expect(page.loading()).toBe(false);
    });

    it('reloads when the entity key changes rather than showing the old entity', () => {
      fixture.detectChanges();
      flushList([{ id: '1' }]);

      fixture.componentRef.setInput('entityKey', 'flight-dispatch');
      fixture.detectChanges();

      const req = http.expectOne(`${environment.apiUrl}/flight-dispatch`);
      req.flush({ data: [{ id: 'a' }, { id: 'b' }], total: 2 });
      fixture.detectChanges();

      expect(page.config()?.key).toBe('flight-dispatch');
      expect(page.rows().length).toBe(2);
    });

    it('empties the table and stops loading when the request fails', () => {
      fixture.detectChanges();
      http.expectOne(LIST_URL).flush({}, { status: 500, statusText: 'Server Error' });
      fixture.detectChanges();

      expect(page.rows()).toEqual([]);
      expect(page.loading()).toBe(false);
    });

    it('renders an explanation instead of an empty page for an unknown key', () => {
      fixture.componentRef.setInput('entityKey', 'no-such-entity');
      fixture.detectChanges();

      expect(page.config()).toBeUndefined();
      expect(page.loading()).toBe(false);
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('No entity configuration found');
    });
  });

  describe('displayValue', () => {
    beforeEach(() => {
      fixture.detectChanges();
      flushList();
    });

    it('shows a placeholder for absent values', () => {
      const f = field({ key: 'x' });
      expect(page.displayValue(f, { id: '1', x: null })).toBe('—');
      expect(page.displayValue(f, { id: '1', x: undefined })).toBe('—');
      expect(page.displayValue(f, { id: '1', x: '' })).toBe('—');
    });

    it('shows a date on the calendar day it was stored', () => {
      // Reading '2026-08-06' with `new Date()` yields UTC midnight, which
      // renders as the 5th anywhere west of UTC.
      const stored = toDateOnly(new Date(2026, 7, 6))!;
      const rendered = page.displayValue(field({ key: 'd', type: 'date' }), { id: '1', d: stored });

      expect(rendered).toBe(new Date(2026, 7, 6).toLocaleDateString());
    });

    it('renders booleans as Yes/No', () => {
      const f = field({ key: 'b', type: 'boolean' });
      expect(page.displayValue(f, { id: '1', b: true })).toBe('Yes');
      expect(page.displayValue(f, { id: '1', b: false })).toBe('No');
    });

    it('formats currency to two decimals with its prefix', () => {
      const f = field({ key: 'n', type: 'number', prefix: '$' });
      expect(page.displayValue(f, { id: '1', n: 1234.5 })).toBe('$1,234.50');
    });

    it('appends a suffix to a plain number', () => {
      const f = field({ key: 'n', type: 'number', suffix: 'kg' });
      expect(page.displayValue(f, { id: '1', n: 1500 })).toBe('1,500 kg');
    });

    it('shows a non-numeric value verbatim instead of NaN', () => {
      const f = field({ key: 'n', type: 'number' });
      expect(page.displayValue(f, { id: '1', n: 'n/a' })).toBe('n/a');
    });

    it('falls back to the raw string for an unparseable date', () => {
      const f = field({ key: 'd', type: 'date' });
      expect(page.displayValue(f, { id: '1', d: 'soon' })).toBe('soon');
    });
  });

  describe('validation messages', () => {
    beforeEach(() => {
      fixture.detectChanges();
      flushList();
    });

    /**
     * Attaches a control built from `f`'s own validator hints, so each case
     * covers a specific validator rather than depending on which validators
     * the chosen manifest entity happens to declare.
     */
    function messageFor(f: EntityField, value: unknown): string | null {
      const validators = [];
      if (f.required) validators.push(Validators.required);
      if (f.type === 'email') validators.push(Validators.email);
      if (f.minLength != null) validators.push(Validators.minLength(f.minLength));
      if (f.maxLength != null) validators.push(Validators.maxLength(f.maxLength));
      if (f.min != null) validators.push(Validators.min(f.min));
      if (f.max != null) validators.push(Validators.max(f.max));

      const control = new FormControl(value, validators);
      control.markAsTouched();
      page.form.setControl(f.key, control);
      return page.errorMessage(f);
    }

    it('says nothing while a control is untouched', () => {
      const f = page.formFields()[0];
      page.form.get(f.key)!.setValue('');
      expect(page.errorMessage(f)).toBeNull();
    });

    it('says nothing when the control is valid', () => {
      expect(messageFor(field({ key: 'a', label: 'Code', required: true }), 'AB')).toBeNull();
    });

    it('reports a missing required value', () => {
      expect(messageFor(field({ key: 'a', label: 'Code', required: true }), '')).toBe('Code is required.');
    });

    it('reports an invalid email as an email problem, not a missing field', () => {
      const message = messageFor(field({ key: 'e', label: 'Email', type: 'email' }), 'not-an-email');
      expect(message).toBe('Email must be a valid email address.');
    });

    it('reports a too-short value with the length it needs', () => {
      const message = messageFor(field({ key: 'a', label: 'Code', minLength: 3 }), 'ab');
      expect(message).toBe('Code must be at least 3 characters.');
    });

    it('reports a too-long value with the limit', () => {
      const message = messageFor(field({ key: 'a', label: 'Code', maxLength: 2 }), 'abc');
      expect(message).toBe('Code must be at most 2 characters.');
    });

    it('reports a below-minimum number with the bound', () => {
      const message = messageFor(field({ key: 'n', label: 'Qty', type: 'number', min: 1 }), 0);
      expect(message).toBe('Qty must be 1 or more.');
    });

    it('reports an above-maximum number with the bound', () => {
      const message = messageFor(field({ key: 'n', label: 'Qty', type: 'number', max: 10 }), 11);
      expect(message).toBe('Qty must be 10 or less.');
    });

    it('returns null for a control that is not on the form', () => {
      expect(page.errorMessage(field({ key: 'ghost' }))).toBeNull();
    });
  });

  describe('saving', () => {
    beforeEach(() => {
      fixture.detectChanges();
      flushList();
    });

    it('refuses to submit an invalid form and marks it touched so errors show', () => {
      page.openNew();
      page.form.markAsUntouched();

      page.save();

      expect(page.form.invalid).toBe(true);
      expect(page.form.touched).toBe(true);
      http.expectNone(LIST_URL);
    });

    it('closes the dialog and clears the editing row after a successful save', () => {
      page.openEdit({ id: 'row-1' });
      expect(page.dialogVisible()).toBe(true);

      fillForm();
      page.save();

      http.expectOne(`${LIST_URL}/row-1`).flush({ id: 'row-1' });
      http.expectOne(LIST_URL).flush({ data: [], total: 0 });

      expect(page.dialogVisible()).toBe(false);
      expect(page.editingRow()).toBeNull();
      expect(page.saving()).toBe(false);
    });

    it('keeps the dialog open so the user can retry after a failed save', () => {
      page.openNew();
      fillForm();
      page.save();

      http.expectOne(LIST_URL).flush({}, { status: 500, statusText: 'Server Error' });

      expect(page.dialogVisible()).toBe(true);
      expect(page.saving()).toBe(false);
    });

    it('ignores a second submit while the first is still in flight', () => {
      page.openNew();
      fillForm();

      page.save();
      page.save();

      // A single POST — a double-click must not create the record twice.
      http.expectOne(LIST_URL).flush({ id: 'new' });
      http.expectOne(LIST_URL).flush({ data: [], total: 0 });
    });
  });

  describe('date round-trip', () => {
    it('sends a date field as the calendar day picked, not the UTC day', () => {
      // The regression this guards: toISOString() moved the day back one for
      // every user east of UTC, silently shifting due dates and expiries.
      fixture.componentRef.setInput('entityKey', DATE_ENTITY_KEY);
      fixture.detectChanges();
      http.expectOne(DATE_LIST_URL).flush({ data: [], total: 0 });
      fixture.detectChanges();

      const dateField = page.formFields().find((f) => f.type === 'date')!;
      page.openNew();
      fillForm();
      page.form.get(dateField.key)!.setValue(new Date(2026, 7, 6));
      page.save();

      const req = http.expectOne(DATE_LIST_URL);
      expect(req.request.method).toBe('POST');
      expect((req.request.body as Record<string, unknown>)[dateField.key]).toBe('2026-08-06');

      req.flush({ id: 'new' });
      http.expectOne(DATE_LIST_URL).flush({ data: [], total: 0 });
    });

    it('reopens an edited row on the day it was stored', () => {
      fixture.componentRef.setInput('entityKey', DATE_ENTITY_KEY);
      fixture.detectChanges();
      http.expectOne(DATE_LIST_URL).flush({ data: [], total: 0 });
      fixture.detectChanges();

      const dateField = page.formFields().find((f) => f.type === 'date')!;
      page.openEdit({ id: 'row-1', [dateField.key]: '2026-08-06' });

      const reopened = page.form.get(dateField.key)!.value as Date;
      expect(reopened.getFullYear()).toBe(2026);
      expect(reopened.getMonth()).toBe(7);
      expect(reopened.getDate()).toBe(6);
    });
  });

  describe('accessible names', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('names row actions after the record, not just "edit"', () => {
      const first = page.config()!.fields.find((f) => !f.hideInTable)!;
      flushList([{ id: '1', [first.key]: 'ABC-123' }]);

      const label = page.rowLabel({ id: '1', [first.key]: 'ABC-123' });
      expect(label).toContain('ABC-123');
      expect(label).toContain(page.config()!.label);
    });

    it('falls back to the entity label when the row has no title value', () => {
      flushList([{ id: '1' }]);
      expect(page.rowLabel({ id: '1' })).toBe(page.config()!.label);
    });
  });
});
