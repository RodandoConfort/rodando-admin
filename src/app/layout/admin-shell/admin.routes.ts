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
          import('../../features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: ADMIN_PATHS.users,
        data: {
          title: 'Usuarios',
          breadcrumb: 'Usuarios',
          icon: 'group',
          showInSidebar: true,
        },
        loadChildren: () => import('../../features/users/users.routes').then((m) => m.USERS_ROUTES),
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
          import('../../features/drivers/drivers.routes').then((m) => m.DRIVERS_ROUTES),
      },
      {
        path: ADMIN_PATHS.fleet,
        data: {
          title: 'Flota',
          breadcrumb: 'Flota',
          icon: 'directions_car',
          showInSidebar: true,
        },
        loadChildren: () => import('../../features/fleet/fleet.routes').then((m) => m.FLEET_ROUTES),
      },
      {
        path: ADMIN_PATHS.trips,
        title: 'Monitor de viajes',
        loadChildren: () =>
          import('../../features/trips/admin-trips.routes').then((m) => m.ADMIN_TRIPS_ROUTES),
      },
      {
        path: ADMIN_PATHS.geography,
        data: {
          title: 'Geografía',
          breadcrumb: 'Geografía',
          icon: 'public',
          showInSidebar: true,
        },
        loadChildren: () =>
          import('../../features/geography/geography.routes').then((m) => m.GEOGRAPHY_ROUTES),
      },
      {
        path: ADMIN_PATHS.cashCollectionPoints,
        title: 'Puntos de recaudo',
        loadChildren: () =>
          import('../../features/cash-collection-points/cash-collection-points.routes').then(
            (m) => m.CASH_COLLECTION_POINTS_ROUTES,
          ),
      },
      {
        path: ADMIN_PATHS.systemSettings,
        data: {
          title: 'Configuración',
          breadcrumb: 'Configuración',
          icon: 'tune',
          showInSidebar: true,
        },
        loadChildren: () =>
          import('../../features/settings/system-settings/system-settings.routes').then(
            (m) => m.SYSTEM_SETTINGS_ROUTES,
          ),
      },
      {
        path: ADMIN_PATHS.pricePolicies,
        data: {
          title: 'Políticas de precio',
          breadcrumb: 'Políticas de precio',
          icon: 'payments',
          showInSidebar: true,
        },
        loadChildren: () =>
          import('../../features/settings/price-policies/price-policies.routes').then(
            (m) => m.PRICE_POLICIES_ROUTES,
          ),
      },
    ],
  },
];
