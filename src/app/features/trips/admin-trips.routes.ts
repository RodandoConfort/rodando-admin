import { Routes } from '@angular/router';

import { AdminTripsHttp } from './data-access/admin-trips-http.service';
import { AdminTripsStore } from './data-access/admin-trips.store';

export const ADMIN_TRIPS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      AdminTripsHttp,
      AdminTripsStore,
    ],
    children: [
      {
        path: '',
        title: 'Monitor de viajes',
        loadComponent: () =>
          import('./pages/admin-trips-monitor-page').then(
            (m) => m.AdminTripsMonitorPage,
          ),
      },
      {
        path: ':id',
        title: 'Detalle del viaje',
        loadComponent: () =>
          import('./pages/admin-trip-detail/admin-trip-detail-page').then(
            (m) => m.AdminTripDetailPage,
          ),
      },
    ],
  },
];
