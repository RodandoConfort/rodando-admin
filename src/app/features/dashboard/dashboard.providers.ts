import { Provider } from '@angular/core';

import { AdminDashboardHttp } from './data-access/admin-dashboard.http';
import { AdminDashboardStore } from './data-access/admin-dashboard.store';

export const DASHBOARD_PROVIDERS: Provider[] = [
  AdminDashboardHttp,
  AdminDashboardStore,
];
