import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { mapApiError } from '../api/api-error.mapper';
import { AlertService } from '../notifications/alert.service';
import { SHOW_ERROR_ALERT } from '../tokens/http-context.token';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const alert = inject(AlertService);
  const showErrorAlert = request.context.get(SHOW_ERROR_ALERT);

  return next(request).pipe(
    catchError((error) => {
      const mappedError = mapApiError(error);

      if (showErrorAlert) {
        alert.error(mappedError.message);
      }

      return throwError(() => mappedError);
    }),
  );
};