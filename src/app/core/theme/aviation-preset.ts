import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Aviation ERP theme preset.
 * Built on PrimeNG's Aura base with a navy/sky-blue brand scale that reads
 * as "airline ops console" rather than generic admin-template blue.
 */
export const AviationPreset = definePreset(Aura, {
  semantic: {
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
  }
});
