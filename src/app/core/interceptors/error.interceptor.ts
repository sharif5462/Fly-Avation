import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';

/**
 * Centralized HTTP failure handling so individual services/components don't
 * each need their own 401/403/5xx logic. Runs outermost in the interceptor
 * chain (see app.config.ts) so it sees errors from everything after it.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          auth.logout();
          break;
        case 403:
          router.navigate(['/403']);
          break;
        case 0:
          messageService.add({
            severity: 'error',
            summary: 'Network error',
            detail: 'Could not reach the API server.'
          });
          break;
        default:
          if (error.status >= 500) {
            messageService.add({
              severity: 'error',
              summary: 'Server error',
              detail: (error.error?.message as string) ?? 'Unexpected server error.'
            });
          }
      }
      return throwError(() => error);
    })
  );
};
