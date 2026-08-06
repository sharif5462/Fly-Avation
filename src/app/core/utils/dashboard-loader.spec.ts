import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, throwError } from 'rxjs';

import { createDashboardLoader } from './dashboard-loader';

/**
 * Regression net for the "permanent spinner" defect: every dashboard used to
 * subscribe to a `forkJoin` with only a next handler, so one failing source
 * left `loading` true forever with no message and no way to retry.
 */
describe('createDashboardLoader', () => {
  /** Host component so the loader gets a real DestroyRef and injection context. */
  @Component({ template: '' })
  class Host {
    readonly applied: unknown[] = [];
    readonly source = inject(SourceStub);
    readonly loader = createDashboardLoader(
      () => this.source.load(),
      (value) => this.applied.push(value)
    );
  }

  class SourceStub {
    calls = 0;
    subject = new Subject<string>();
    failWith: unknown = null;

    load(): Observable<string> {
      this.calls += 1;
      if (this.failWith) return throwError(() => this.failWith);
      this.subject = new Subject<string>();
      return this.subject.asObservable();
    }
  }

  function createHost(): { host: Host; source: SourceStub; destroy: () => void } {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    return { host, source: host.source, destroy: () => fixture.destroy() };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SourceStub] });
  });

  it('starts in the loading state and issues the request immediately', () => {
    const { host, source } = createHost();

    expect(host.loader.loading()).toBe(true);
    expect(host.loader.failed()).toBe(false);
    expect(source.calls).toBe(1);
  });

  it('applies the payload and clears loading on success', () => {
    const { host, source } = createHost();

    source.subject.next('payload');
    source.subject.complete();

    expect(host.applied).toEqual(['payload']);
    expect(host.loader.loading()).toBe(false);
    expect(host.loader.failed()).toBe(false);
  });

  it('clears loading and flags failure when the request errors', () => {
    TestBed.overrideProvider(SourceStub, { useValue: Object.assign(new SourceStub(), { failWith: new Error('boom') }) });
    const { host } = createHost();

    // The whole point: a failure must end the spinner, not run it forever.
    expect(host.loader.loading()).toBe(false);
    expect(host.loader.failed()).toBe(true);
    expect(host.applied).toEqual([]);
  });

  it('does not apply a partial payload when the request errors', () => {
    const { host, source } = createHost();

    source.subject.error(new Error('one source died'));

    expect(host.applied).toEqual([]);
    expect(host.loader.failed()).toBe(true);
  });

  it('retries on reload and recovers', () => {
    const { host, source } = createHost();
    source.subject.error(new Error('boom'));
    expect(host.loader.failed()).toBe(true);

    host.loader.reload();

    expect(source.calls).toBe(2);
    expect(host.loader.loading()).toBe(true);
    // The failure flag clears while the retry is in flight, so the banner and
    // the spinner are never on screen at the same time.
    expect(host.loader.failed()).toBe(false);

    source.subject.next('second attempt');
    expect(host.applied).toEqual(['second attempt']);
    expect(host.loader.loading()).toBe(false);
    expect(host.loader.failed()).toBe(false);
  });

  it('ignores reload while a request is already in flight', () => {
    const { host, source } = createHost();

    host.loader.reload();
    host.loader.reload();

    // A double-click on Try Again must not fan out duplicate requests.
    expect(source.calls).toBe(1);
  });

  it('stops writing state once the component is destroyed', () => {
    const { host, source, destroy } = createHost();
    destroy();

    source.subject.next('late response');

    expect(host.applied).toEqual([]);
    expect(host.loader.loading()).toBe(true);
  });
});
