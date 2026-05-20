import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthStore } from '../auth/auth.store';
import { SKIP_AUTH_REFRESH } from '../tokens/http-context.token';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);

  return next(request).pipe(
    catchError((error) => {
      if (!isUnauthorizedError(error) || request.context.get(SKIP_AUTH_REFRESH)) {
        return throwError(() => error);
      }

      return authStore.forceRefreshSilently().pipe(
        switchMap((session) => {
          const retryRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });

          return next(retryRequest);
        }),
        catchError((refreshError) => {
          authStore.redirectToLogin();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof HttpErrorResponse) {
    return error.status === 401;
  }

  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 401
  );
}