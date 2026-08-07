import { Injectable, computed, inject } from '@angular/core';

import { ModuleAccessService } from '../auth/module-access.service';
import { MODULES, isRoutedUnderModule } from '../data/module-manifest';

/** One navigable screen, flattened out of the module manifest. */
export interface ScreenEntry {
  /** Route path, e.g. '/procurement/purchase-orders'. */
  path: string;
  /** The screen's own name, e.g. 'Purchase Orders'. */
  label: string;
  /** Owning module's name, shown as context because labels repeat. */
  moduleLabel: string;
  moduleKey: string;
  icon: string;
}

export interface ScreenMatch extends ScreenEntry {
  score: number;
}

/**
 * Search across every screen in the app.
 *
 * With 43 modules and 432 nav entries, expanding sidebar groups to hunt for a
 * screen does not scale — and several labels repeat across modules ("Dashboard",
 * "Incident Reporting"), so the module name has to travel with the result or
 * the user cannot tell two hits apart.
 *
 * Results are filtered by module access, so the palette never offers a screen
 * that would bounce the user to /403.
 */
@Injectable({ providedIn: 'root' })
export class ScreenSearchService {
  private readonly access = inject(ModuleAccessService);

  /** Every screen the signed-in user may open, recomputed as access changes. */
  readonly screens = computed<ScreenEntry[]>(() =>
    MODULES.filter((mod) => this.access.canAccessModule(mod.key)).flatMap((mod) =>
      mod.items
        .filter((item) => isRoutedUnderModule(mod.key, item.key))
        .map((item) => ({
          path: `/${mod.key}/${item.key}`,
          label: item.label,
          moduleLabel: mod.label,
          moduleKey: mod.key,
          icon: item.icon
        }))
    )
  );

  /**
   * Ranked matches for `query`. Ranking matters more than filtering here:
   * typing "purchase" hits Purchase Orders, Purchase Requests and three
   * modules containing them, and the exact-prefix match has to come first.
   */
  search(query: string, limit = 30): ScreenMatch[] {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const matches: ScreenMatch[] = [];
    for (const screen of this.screens()) {
      const score = this.scoreOf(screen, term);
      if (score > 0) matches.push({ ...screen, score });
    }

    return matches
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
      .slice(0, limit);
  }

  /**
   * Higher is better. Ordered so the most specific reason to match wins:
   * the screen's own name beats its module's, and a prefix beats a
   * mid-string hit — "bag" should surface "Bag Tracking" above "Mishandled
   * Baggage".
   */
  private scoreOf(screen: ScreenEntry, term: string): number {
    const label = screen.label.toLowerCase();
    const moduleLabel = screen.moduleLabel.toLowerCase();

    if (label === term) return 100;
    if (label.startsWith(term)) return 80;

    // Start of any word in the label — "purchase orders" matched by "ord".
    if (label.split(/[\s/&(),.-]+/).some((word) => word.startsWith(term))) return 60;
    if (label.includes(term)) return 40;

    if (moduleLabel.startsWith(term)) return 25;
    if (moduleLabel.includes(term)) return 15;

    // Last resort: every character of the term appears in order. Catches
    // acronym-ish typing like "por" for "Purchase Orders" without letting
    // loose subsequence hits outrank real ones.
    return this.isSubsequence(term, label) ? 5 : 0;
  }

  private isSubsequence(term: string, target: string): boolean {
    let i = 0;
    for (const char of target) {
      if (char === term[i]) i++;
      if (i === term.length) return true;
    }
    return false;
  }
}
