import { AppRoutes } from '../../core/router/app-route-data.model';

import { REPORTS_PROVIDERS } from './reports.providers';

export const REPORTS_ROUTES: AppRoutes = [
  {
    path: '',
    providers: REPORTS_PROVIDERS,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'finance',
      },
      {
        path: 'finance',
        data: {
          title: 'Reportes financieros',
          breadcrumb: 'Finanzas',
          icon: 'payments',
        },
        loadComponent: () =>
          import('./pages/finances/reports-finance-page').then(
            (m) => m.ReportsFinancePage,
          ),
      },
      {
        path: 'drivers',
        data: {
          title: 'Reportes de drivers',
          breadcrumb: 'Drivers',
          icon: 'local_taxi',
        },
        loadComponent: () =>
          import('./pages/drivers/reports-drivers-page').then(
            (m) => m.ReportsDriversPage,
          ),
      },
      {
        path: 'vehicles',
        data: {
          title: 'Reportes de vehículos',
          breadcrumb: 'Vehículos',
          icon: 'directions_car',
        },
        loadComponent: () =>
          import('./pages/vehicles/reports-vehicles-page').then(
            (m) => m.ReportsVehiclesPage,
          ),
      },
      {
        path: 'users',
        data: {
          title: 'Reportes de usuarios',
          breadcrumb: 'Usuarios',
          icon: 'person',
        },
        loadComponent: () =>
          import('./pages/users/reports-users-page').then(
            (m) => m.ReportsUsersPage,
          ),
      },
      {
        path: 'operations',
        data: {
          title: 'Reportes operativos',
          breadcrumb: 'Operaciones',
          icon: 'fact_check',
        },
        loadComponent: () =>
          import('./pages/operations/reports-operations-page').then(
            (m) => m.ReportsOperationsPage,
          ),
      },
      {
        path: 'data-quality',
        data: {
          title: 'Calidad de datos',
          breadcrumb: 'Calidad de datos',
          icon: 'verified',
        },
        loadComponent: () =>
          import('./pages/data-quality/reports-data-quality-page').then(
            (m) => m.ReportsDataQualityPage,
          ),
      },
    ],
  },
];
