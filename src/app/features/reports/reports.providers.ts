import { Provider } from '@angular/core';

import { ReportsHttp } from './data-access/reports.http';
import { ReportsStore } from './data-access/reports.store';
import { provideReportsEcharts } from './reports-echarts.provider';

export const REPORTS_PROVIDERS: Provider[] = [
  ReportsHttp,
  ReportsStore,
  provideReportsEcharts(),
];
