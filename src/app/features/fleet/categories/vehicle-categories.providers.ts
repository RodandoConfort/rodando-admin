import { Provider } from '@angular/core';

import { VehicleCategoriesHttp } from './data-access/vehicle-categories.http';
import { VehicleCategoriesStore } from './data-access/vehicle-categories.store';

export const VEHICLE_CATEGORIES_PROVIDERS: Provider[] = [
  VehicleCategoriesHttp,
  VehicleCategoriesStore,
];
