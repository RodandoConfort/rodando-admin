import { Provider } from '@angular/core';

import { AdminDashboardHttp } from './data-access/admin-dashboard.http';
import { AdminDashboardStore } from './data-access/admin-dashboard.store';
import { provideAdminDashboardEcharts } from './admin-dashboard-echarts.provider';

export const DASHBOARD_PROVIDERS: Provider[] = [
  AdminDashboardHttp,
  AdminDashboardStore,
  provideAdminDashboardEcharts()
];
