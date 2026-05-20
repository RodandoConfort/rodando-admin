import { AppRoutes } from './core/router/app-route-data.model';
import { APP_PATHS } from './core/router/app-paths';
import { authGuard } from './core/guards/auth.guard';

export const APP_ROUTES: AppRoutes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: `${APP_PATHS.admin}/dashboard`,
  },
  {
    path: APP_PATHS.auth,
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: APP_PATHS.admin,
    canMatch: [authGuard],
    loadChildren: () =>
      import('./layout/admin-shell/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    redirectTo: `${APP_PATHS.admin}/dashboard`,
  },
];