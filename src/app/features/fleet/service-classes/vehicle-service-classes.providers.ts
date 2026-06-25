import { Provider } from '@angular/core';

import { VehicleServiceClassesHttp } from './data-access/vehicle-service-classes.http';
import { VehicleServiceClassesStore } from './data-access/vehicle-service-classes.store';

export const VEHICLE_SERVICE_CLASSES_PROVIDERS: Provider[] = [
  VehicleServiceClassesHttp,
  VehicleServiceClassesStore,
];
