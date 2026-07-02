import { AppRoutes } from '../../core/router/app-route-data.model';
import { provideAdminDashboardEcharts } from './admin-dashboard-echarts.provider';

import { DASHBOARD_PROVIDERS } from './dashboard.providers';

export const DASHBOARD_ROUTES: AppRoutes = [
  {
    path: '',
    providers: [DASHBOARD_PROVIDERS, provideAdminDashboardEcharts()],
    data: {
      title: 'Dashboard',
      breadcrumb: 'Dashboard',
      permission: 'dashboard.read',
    },
    loadComponent: () =>
      import('./pages/dashboard.page').then((m) => m.DashboardPage),
  },
];
