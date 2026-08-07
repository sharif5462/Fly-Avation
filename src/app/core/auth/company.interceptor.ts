import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { CompanyContextService } from './company-context.service';
import { COMPANY_HEADER } from '../models/company.model';
import { environment } from '../../../environments/environment';

/** Pre-session endpoints — there is no company chosen yet when these run. */
function isAuthEndpoint(url: string): boolean {
  return url.startsWith(`${environment.apiUrl}/auth/`);
}

/**
 * Tells the API which company each request is for.
 *
 * A header rather than a path segment or query parameter, so none of the ~400
 * resource URLs change and `ApiService` stays the single place that builds
 * them. The alternative — `/{companyId}/{resource}` — would have meant
 * rewriting every route and every call site for a value that is ambient to
 * the whole session.
 *
 * The API must treat this as a *request* and validate it against the
 * companies the token's user belongs to. Anything else is a data leak: the
 * header is entirely under the client's control.
 */
export const companyInterceptor: HttpInterceptorFn = (req, next) => {
  const companyId = inject(CompanyContextService).activeCompanyId();

  if (companyId && req.url.startsWith(environment.apiUrl) && !isAuthEndpoint(req.url)) {
    req = req.clone({ setHeaders: { [COMPANY_HEADER]: companyId } });
  }
  return next(req);
};
