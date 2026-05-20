import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthStore } from '../auth/auth.store';
import { ROUTE_COMMANDS } from '../router/app-paths';

export const authGuard: CanMatchFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  return authStore.refreshSilently().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(ROUTE_COMMANDS.auth.login))),
  );
};
