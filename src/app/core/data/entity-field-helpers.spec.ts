import { entity, f, file, lookup, money, num, statusField } from './entity-field-helpers';

describe('entity-field-helpers', () => {
  describe('f', () => {
    it('defaults to a required text field', () => {
      expect(f('code', 'Code')).toEqual({ key: 'code', label: 'Code', type: 'text', required: true });
    });

    it('lets extra overrides win, including required: false', () => {
      const field = f('note', 'Note', 'textarea', { required: false, hideInTable: true });
      expect(field.type).toBe('textarea');
      expect(field.required).toBe(false);
      expect(field.hideInTable).toBe(true);
    });
  });

  describe('money', () => {
    it('is a number field with a dollar prefix and a floor of 0', () => {
      const field = money('amount', 'Amount');
      expect(field.type).toBe('number');
      expect(field.prefix).toBe('$');
      expect(field.min).toBe(0);
    });
  });

  describe('num', () => {
    it('is a plain number field with no prefix', () => {
      expect(num('count', 'Count').prefix).toBeUndefined();
    });
  });

  describe('statusField', () => {
    it('builds a badge select whose options carry severities in order', () => {
      const field = statusField([
        ['Open', 'danger'],
        ['Closed', 'success']
      ]);
      expect(field.key).toBe('status');
      expect(field.label).toBe('Status');
      expect(field.type).toBe('select');
      expect(field.badge).toBe(true);
      expect(field.options).toEqual([
        { label: 'Open', value: 'Open', severity: 'danger' },
        { label: 'Closed', value: 'Closed', severity: 'success' }
      ]);
    });

    it('accepts a custom key/label so an entity can have more than one status-like column', () => {
      const field = statusField([['Approved', 'success']], 'decision', 'Decision');
      expect(field.key).toBe('decision');
      expect(field.label).toBe('Decision');
    });
  });

  describe('lookup', () => {
    it('produces a lookup field carrying the referenced entity and label field', () => {
      const field = lookup('origin', 'Origin Airport', 'airport-master', 'iataCode');
      expect(field.type).toBe('lookup');
      expect(field.lookupEntity).toBe('airport-master');
      expect(field.lookupLabelField).toBe('iataCode');
      expect(field.required).toBe(true);
    });
  });

  describe('file', () => {
    it('is optional by default, since attaching a document is rarely mandatory', () => {
      const field = file('attachmentFile', 'Attachment');
      expect(field.type).toBe('file');
      expect(field.required).toBe(false);
    });

    it('still lets a caller force it required', () => {
      expect(file('scan', 'Scan', { required: true }).required).toBe(true);
    });
  });

  describe('entity', () => {
    it('defaults seedCount to 10 when omitted', () => {
      const config = entity('widget', 'Widget', 'Widgets', 'pi-box', 'desc', [f('code', 'Code')]);
      expect(config.seedCount).toBe(10);
      expect(config.fields.length).toBe(1);
    });

    it('keeps an explicit seedCount', () => {
      const config = entity('widget', 'Widget', 'Widgets', 'pi-box', 'desc', [], 25);
      expect(config.seedCount).toBe(25);
    });
  });
});
