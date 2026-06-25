import { Provider } from '@angular/core';

import { DriversHttp } from './data-access/drivers.http';
import { DriversStore } from './data-access/drivers.store';

export const DRIVERS_PROVIDERS: Provider[] = [
  DriversHttp,
  DriversStore,
];
