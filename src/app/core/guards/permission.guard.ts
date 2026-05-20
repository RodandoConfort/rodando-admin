// import { inject } from '@angular/core';
// import { CanMatchFn, Route, Router } from '@angular/router';

// import { AppRouteData } from '../router/app-route-data.model';
// import { ROUTE_COMMANDS } from '../router/app-paths';
// import { AuthStore } from '../auth/auth.store';

// export const permissionGuard: CanMatchFn = (route: Route) => {
//   const authStore = inject(AuthStore);
//   const router = inject(Router);
//   const data = route.data as AppRouteData | undefined;

//   const requiredPermission = data?.permission;
//   const requiredPermissions = data?.permissions ?? [];

//   if (!requiredPermission && requiredPermissions.length === 0) {
//     return true;
//   }

//   const hasAccess = requiredPermission
//     ? authStore.hasPermission(requiredPermission)
//     : requiredPermissions.every((permission) => authStore.hasPermission(permission));

//   if (hasAccess) {
//     return true;
//   }

//   return router.createUrlTree(ROUTE_COMMANDS.admin.dashboard);
// };
