import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';

import { CommandPaletteService } from '../../core/services/command-palette.service';
import { RecentScreensService } from '../../core/services/recent-screens.service';
import { ScreenEntry, ScreenSearchService } from '../../core/services/screen-search.service';

/**
 * Ctrl/Cmd+K → go anywhere.
 *
 * The sidebar lists 432 entries across 43 collapsible groups; finding a screen
 * by expanding groups is slow even when you know where it lives, and hopeless
 * when you don't. This is the primary way to navigate the app — the sidebar is
 * for browsing, this is for arriving.
 *
 * Opens on recently visited screens, because ERP work returns to the same few
 * screens all day.
 */
@Component({
  selector: 'app-command-palette',
  imports: [DialogModule],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.scss',
  host: {
    '(document:keydown)': 'onGlobalKeydown($event)'
  }
})
export class CommandPalette {
  private readonly router = inject(Router);
  private readonly screens = inject(ScreenSearchService);
  private readonly recentScreens = inject(RecentScreensService);
  private readonly palette = inject(CommandPaletteService);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly open = this.palette.open;
  readonly query = signal('');
  readonly activeIndex = signal(0);

  /** Search hits, or the recent list when nothing has been typed. */
  readonly results = computed<ScreenEntry[]>(() => {
    const term = this.query().trim();
    return term ? this.screens.search(term) : this.recentScreens.recent();
  });

  readonly showingRecent = computed(() => !this.query().trim());
  readonly totalScreens = computed(() => this.screens.screens().length);

  constructor() {
    // Opened from the topbar button rather than through show(): reset and
    // focus here too, so both entry points behave identically.
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => setTimeout(() => this.searchInput()?.nativeElement.focus(), 0));
      }
    });

    // Keep the highlight inside the list as it shrinks under typing, or Enter
    // would navigate to whatever happens to sit at a stale index.
    effect(() => {
      const count = this.results().length;
      if (this.activeIndex() >= count) this.activeIndex.set(Math.max(0, count - 1));
    });
  }

  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggle();
      return;
    }
    if (event.key === 'Escape' && this.open()) {
      this.close();
    }
  }

  toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.show();
    }
  }

  show(): void {
    this.query.set('');
    this.activeIndex.set(0);
    this.palette.show();
    // The dialog animates in; focus has to wait for the input to exist.
    queueMicrotask(() => setTimeout(() => this.searchInput()?.nativeElement.focus(), 0));
  }

  close(): void {
    this.palette.close();
  }

  onQueryInput(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  /** Arrow keys move the highlight; Enter opens it. Wraps at both ends. */
  onKeydown(event: KeyboardEvent): void {
    const count = this.results().length;
    if (count === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update((i) => (i + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((i) => (i - 1 + count) % count);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(count - 1);
        break;
      case 'Enter': {
        event.preventDefault();
        const screen = this.results()[this.activeIndex()];
        if (screen) this.go(screen);
        break;
      }
    }
  }

  go(screen: ScreenEntry): void {
    this.close();
    this.router.navigateByUrl(screen.path);
  }
}
