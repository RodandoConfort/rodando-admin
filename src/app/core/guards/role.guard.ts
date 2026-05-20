import { inject } from '@angular/core';
import { CanMatchFn, Route, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthStore } from '../auth/auth.store';
import { UserType } from '../auth/auth.models';
import { ROUTE_COMMANDS } from '../router/app-paths';

export const roleGuard: CanMatchFn = (route: Route) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const expectedRole = route.data?.['role'] as UserType | undefined;

  if (!expectedRole) {
    return true;
  }

  if (authStore.userType() === expectedRole) {
    return true;
  }

  return authStore.refreshSilently().pipe(
    map(() => {
      if (authStore.userType() === expectedRole) {
        return true;
      }

      return router.createUrlTree(ROUTE_COMMANDS.admin.dashboard);
    }),
    catchError(() => of(router.createUrlTree(ROUTE_COMMANDS.auth.login))),
  );
};
