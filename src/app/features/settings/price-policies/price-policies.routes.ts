import { AppRoutes } from '../../../core/router/app-route-data.model';

import { PRICE_POLICIES_PROVIDERS } from './price-policies.providers';

export const PRICE_POLICIES_ROUTES: AppRoutes = [
  {
    path: '',
    providers: PRICE_POLICIES_PROVIDERS,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'policies',
      },
      {
        path: 'policies',
        data: {
          title: 'Políticas de precio',
          breadcrumb: 'Políticas',
          icon: 'payments',
        },
        loadComponent: () =>
          import('./pages/price-policies-list-page').then(
            (m) => m.PricePoliciesListPage,
          ),
      },
      {
        path: 'policies/create',
        data: {
          title: 'Crear política',
          breadcrumb: 'Crear',
          icon: 'add_circle',
        },
        loadComponent: () =>
          import('./pages/price-policy-create-page').then(
            (m) => m.PricePolicyCreatePage,
          ),
      },
      {
        path: 'policies/:id/edit',
        data: {
          title: 'Editar política',
          breadcrumb: 'Editar',
          icon: 'edit',
        },
        loadComponent: () =>
          import('./pages/price-policy-edit-page').then(
            (m) => m.PricePolicyEditPage,
          ),
      },
      {
        path: 'policies/:id',
        data: {
          title: 'Detalle de política',
          breadcrumb: 'Detalle',
          icon: 'payments',
        },
        loadComponent: () =>
          import('./pages/price-policy-detail-page').then(
            (m) => m.PricePolicyDetailPage,
          ),
      },
      {
        path: 'simulator',
        data: {
          title: 'Simulador de precios',
          breadcrumb: 'Simulador',
          icon: 'calculate',
        },
        loadComponent: () =>
          import('./pages/price-policy-simulator-page').then(
            (m) => m.PricePolicySimulatorPage,
          ),
      },
    ],
  },
];
