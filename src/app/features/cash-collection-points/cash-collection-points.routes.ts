import { AppRoutes } from '../../core/router/app-route-data.model';
import { provideCashCollectionPointsFeature } from './cash-collection-points.providers';

export const CASH_COLLECTION_POINTS_ROUTES: AppRoutes = [
  {
    path: '',
    providers: provideCashCollectionPointsFeature(),
    children: [
      {
        path: '',
        data: {
          title: 'Puntos de recaudo',
          breadcrumb: 'Listado',
        },
        loadComponent: () =>
          import('./pages/cash-collection-points-list.page').then(
            (m) => m.CashCollectionPointsListPage,
          ),
      },
      {
        path: 'create',
        data: {
          title: 'Crear punto de recaudo',
          breadcrumb: 'Crear',
        },
        loadComponent: () =>
          import('./pages/cash-collection-point-create.page').then(
            (m) => m.CashCollectionPointCreatePage,
          ),
      },
      {
        path: ':id/edit',
        data: {
          title: 'Editar punto de recaudo',
          breadcrumb: 'Editar',
        },
        loadComponent: () =>
          import('./pages/cash-collection-point-edit.page').then(
            (m) => m.CashCollectionPointEditPage,
          ),
      },
      {
        path: ':id',
        data: {
          title: 'Detalle de punto de recaudo',
          breadcrumb: 'Detalle',
        },
        loadComponent: () =>
          import('./pages/cash-collection-point-detail.page').then(
            (m) => m.CashCollectionPointDetailPage,
          ),
      },
    ],
  },
];
