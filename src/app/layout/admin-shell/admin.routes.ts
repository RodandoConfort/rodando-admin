import { UserType } from '../../core/auth/auth.models';
import { roleGuard } from '../../core/guards/role.guard';
import { AppRoutes } from '../../core/router/app-route-data.model';
import { ADMIN_PATHS } from '../../core/router/app-paths';

export const ADMIN_ROUTES: AppRoutes = [
  {
    path: '',
    canMatch: [roleGuard],
    data: {
      role: UserType.Admin,
    },
    loadComponent: () => import('./admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: ADMIN_PATHS.dashboard,
      },
      {
        path: ADMIN_PATHS.dashboard,
        data: {
          title: 'Dashboard',
          breadcrumb: 'Dashboard',
          icon: 'dashboard',
          showInSidebar: true,
        },
        loadChildren: () =>
          import('../../features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: ADMIN_PATHS.users,
        data: {
          title: 'Usuarios',
          breadcrumb: 'Usuarios',
          icon: 'group',
          showInSidebar: true,
        },
        loadChildren: () =>
          import('../../features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: ADMIN_PATHS.drivers,
        data: {
          title: 'Conductores',
          breadcrumb: 'Conductores',
          icon: 'local_shipping',
          showInSidebar: true,
        },
        loadChildren: () =>
          import('../../features/drivers/drivers.routes').then(
            (m) => m.DRIVERS_ROUTES,
          ),
      },
    ],
  },
];