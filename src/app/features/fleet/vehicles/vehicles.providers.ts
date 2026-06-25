import { Provider } from '@angular/core';

import { VehiclesHttp } from './data-access/vehicles.http';
import { VehiclesStore } from './data-access/vehicles.store';

export const VEHICLES_PROVIDERS: Provider[] = [
  VehiclesHttp,
  VehiclesStore,
];
