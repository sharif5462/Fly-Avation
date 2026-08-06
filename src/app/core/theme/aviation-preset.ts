import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Aviation ERP theme preset.
 * Built on PrimeNG's Aura base with a navy/sky-blue brand scale that reads
 * as "airline ops console" rather than generic admin-template blue.
 */
export const AviationPreset = definePreset(Aura, {
  semantic: {
    /**
     * ── Light-mode contrast corrections ──────────────────────────────────
     * Aura reaches for `{surface.500}` for every kind of secondary text. On
     * this palette that is #7c8aa3, which scores 3.49:1 on a white card and
     * 3.28:1 on the page ground — under the WCAG AA minimum of 4.5:1 for
     * normal text. None of it is decorative: it carries page descriptions,
     * KPI labels, record counts, placeholders and secondary button labels.
     *
     * One step darker (`{surface.600}`, #5c6a83) clears AA on both grounds
     * at 5.46:1 and 5.13:1 while still reading as secondary. The dark-mode
     * values already pass and are left alone.
     *
     * `npm run test:contrast` measures all of this in a real browser.
     */
    text: {
      mutedColor: 'light-dark({surface.600}, {surface.400})',
      hoverMutedColor: 'light-dark({surface.700}, {surface.300})'
    },
    formField: {
      placeholderColor: 'light-dark({surface.600}, {surface.400})'
    },
    primary: {
      50: '#eef5ff',
      100: '#d9e8ff',
      200: '#b8d4ff',
      300: '#86b6ff',
      400: '#4d8fff',
      500: '#1f66f5',
      600: '#134bd1',
      700: '#123ca8',
      800: '#143386',
      900: '#152c6b',
      950: '#0c1838'
    },
    colorScheme: {
      light: {
        primary: {
          color: '#134bd1',
          contrastColor: '#ffffff',
          hoverColor: '#123ca8',
          activeColor: '#0f3389'
        },
        surface: {
          0: '#ffffff',
          50: '#f6f8fb',
          100: '#eef1f6',
          200: '#e2e7ef',
          300: '#c9d1de',
          400: '#a7b2c5',
          500: '#7c8aa3',
          600: '#5c6a83',
          700: '#465269',
          800: '#2f3849',
          900: '#1d2534',
          950: '#11161f'
        }
      },
      dark: {
        primary: {
          color: '#4d8fff',
          contrastColor: '#0c1838',
          hoverColor: '#86b6ff',
          activeColor: '#b8d4ff'
        },
        surface: {
          0: '#ffffff',
          50: '#f6f8fb',
          100: '#e2e7ef',
          200: '#c9d1de',
          300: '#a7b2c5',
          400: '#7c8aa3',
          500: '#5c6a83',
          600: '#465269',
          700: '#2f3849',
          800: '#1d2534',
          900: '#161d29',
          950: '#0d1219'
        }
      }
    }
  },
  components: {
    badge: {
      // White on {red.500} (#ef4444) is 3.76:1. The notification count is
      // text, not an icon, so it needs AA — {red.600} takes it to 4.83:1.
      danger: {
        background: 'light-dark({red.600}, {red.400})'
      }
    },
    button: {
      outlined: {
        // Same {surface.500} problem as muted text, on labels like "Clear
        // Filters" and every secondary dialog action.
        secondary: {
          color: 'light-dark({surface.600}, {surface.400})'
        }
      }
    }
  }
});
