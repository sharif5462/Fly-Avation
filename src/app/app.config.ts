import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';

import { routes } from './app.routes';
import { AviationPreset } from './core/theme/aviation-preset';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { mockApiInterceptor } from './core/mock/mock-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    // Not provideAnimationsAsync(): its lazy dynamic import of
    // @angular/animations/browser never resolved under the dev server here,
    // which left every PrimeNG overlay's close animation waiting forever on
    // an event that never fires — the mask gets stuck at opacity 0 with
    // pointer-events still on, silently blocking the whole page. The
    // synchronous provider trades a slightly larger initial bundle for
    // actually working reliably.
    provideAnimations(),
    // Order matters: errorInterceptor is outermost so it sees failures from
    // everything below it; mockApiInterceptor short-circuits requests when
    // environment.useMockApi is true (no .NET/Oracle backend yet); authInterceptor
    // attaches the bearer token to whatever actually goes out.
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor, mockApiInterceptor])),
    providePrimeNG({
      theme: {
        preset: AviationPreset,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'primeng, app-overrides'
          }
        }
      },
      ripple: true
    }),
    MessageService,
    ConfirmationService
  ]
};
