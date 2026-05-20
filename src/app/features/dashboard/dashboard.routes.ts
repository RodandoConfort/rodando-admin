import { AppRoutes } from '../../core/router/app-route-data.model';

export const DASHBOARD_ROUTES: AppRoutes = [
  {
    path: '',
    data: {
      title: 'Dashboard',
      breadcrumb: 'Dashboard',
      permission: 'dashboard.read',
    },
    loadComponent: () =>
      import('./pages/dashboard.page').then((m) => m.DashboardPage),
  },
];
