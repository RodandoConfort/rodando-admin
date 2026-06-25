import { AppRoutes } from '../../core/router/app-route-data.model';
import { provideGeographyFeature } from './geography.providers';

export const GEOGRAPHY_ROUTES: AppRoutes = [
  {
    path: '',
    providers: [
      provideGeographyFeature(),
    ],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'cities',
      },

      {
        path: 'cities',
        data: {
          title: 'Ciudades',
          breadcrumb: 'Ciudades',
        },
        loadComponent: () =>
          import('./pages/cities/cities-list.page').then((m) => m.CitiesListPage),
      },
      {
        path: 'cities/create',
        data: {
          title: 'Crear ciudad',
          breadcrumb: 'Crear ciudad',
        },
        loadComponent: () =>
          import('./pages/cities/city-create.page').then((m) => m.CityCreatePage),
      },
      {
        path: 'cities/:id/edit',
        data: {
          title: 'Editar ciudad',
          breadcrumb: 'Editar ciudad',
        },
        loadComponent: () =>
          import('./pages/cities/city-edit.page').then((m) => m.CityEditPage),
      },
      {
        path: 'cities/:id',
        data: {
          title: 'Detalle de ciudad',
          breadcrumb: 'Detalle de ciudad',
        },
        loadComponent: () =>
          import('./pages/cities/city-detail.page').then((m) => m.CityDetailPage),
      },

      {
        path: 'zones',
        data: {
          title: 'Zonas',
          breadcrumb: 'Zonas',
        },
        loadComponent: () =>
          import('./pages/zones/zones-list.page').then((m) => m.ZonesListPage),
      },
      {
        path: 'zones/create',
        data: {
          title: 'Crear zona',
          breadcrumb: 'Crear zona',
        },
        loadComponent: () =>
          import('./pages/zones/zone-create.page').then((m) => m.ZoneCreatePage),
      },
      {
        path: 'zones/:id/edit',
        data: {
          title: 'Editar zona',
          breadcrumb: 'Editar zona',
        },
        loadComponent: () =>
          import('./pages/zones/zone-edit.page').then((m) => m.ZoneEditPage),
      },
      {
        path: 'zones/:id',
        data: {
          title: 'Detalle de zona',
          breadcrumb: 'Detalle de zona',
        },
        loadComponent: () =>
          import('./pages/zones/zone-detail.page').then((m) => m.ZoneDetailPage),
      },
    ],
  },
];
