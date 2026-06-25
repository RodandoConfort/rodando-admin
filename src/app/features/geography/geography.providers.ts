import { Provider } from '@angular/core';

import { GeographyHttp } from './data-access/geography.http';
import { CitiesStore } from './data-access/cities.store';
import { ZonesStore } from './data-access/zones.store';

export function provideGeographyFeature(): Provider[] {
  return [
    GeographyHttp,
    CitiesStore,
    ZonesStore,
  ];
}
