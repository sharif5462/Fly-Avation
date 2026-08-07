import { Injectable, signal } from '@angular/core';

/**
 * Open/closed state for the command palette.
 *
 * Lives in a service rather than in the component because two unrelated places
 * open it — the global Ctrl/Cmd+K handler and the topbar's search button — and
 * neither can reach the other through the component tree.
 */
@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  private readonly _open = signal(false);

  readonly open = this._open.asReadonly();

  show(): void {
    this._open.set(true);
  }

  close(): void {
    this._open.set(false);
  }

  toggle(): void {
    this._open.update((open) => !open);
  }
}
