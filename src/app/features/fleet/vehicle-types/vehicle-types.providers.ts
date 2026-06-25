import { Provider } from '@angular/core';

import { VehicleTypesHttp } from './data-access/vehicle-types.http';
import { VehicleTypesStore } from './data-access/vehicle-types.store';

export const VEHICLE_TYPES_PROVIDERS: Provider[] = [
  VehicleTypesHttp,
  VehicleTypesStore,
];
