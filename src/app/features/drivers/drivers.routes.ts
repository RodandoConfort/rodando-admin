import { AppRoutes } from '../../core/router/app-route-data.model';
import { DRIVER_WALLET_PROVIDERS } from '../driver-wallet/driver-wallet.providers';
import { DRIVERS_PROVIDERS } from './drivers.providers';

export const DRIVERS_ROUTES: AppRoutes = [
  {
    path: '',
    providers: [DRIVERS_PROVIDERS],
    children: [
      {
        path: '',
        data: {
          title: 'Conductores',
          breadcrumb: 'Listado',
          permission: 'drivers.read',
        },
        loadComponent: () => import('./pages/drivers-list.page').then((m) => m.DriversListPage),
      },
      {
        path: 'create',
        data: {
          title: 'Crear conductor',
          breadcrumb: 'Crear',
          permission: 'drivers.create',
        },
        loadComponent: () =>
          import('./pages/driver-create/driver-create.page').then((m) => m.DriverCreatePage),
      },
      {
        path: ':id/wallet',
        providers: DRIVER_WALLET_PROVIDERS,
        data: {
          title: 'Wallet del conductor',
          breadcrumb: 'Wallet',
        },
        loadComponent: () =>
          import('../driver-wallet/pages/driver-wallet-detail.page').then(
            (m) => m.DriverWalletDetailPage,
          ),
      },
      {
        path: ':id/edit',
        data: {
          title: 'Editar conductor',
          breadcrumb: 'Editar',
          permission: 'drivers.update',
        },
        loadComponent: () => import('./pages/driver-edit.page').then((m) => m.DriverEditPage),
      },
      {
        path: ':id',
        data: {
          title: 'Detalle de conductor',
          breadcrumb: 'Detalle',
          permission: 'drivers.read',
        },
        loadComponent: () => import('./pages/driver-detail.page').then((m) => m.DriverDetailPage),
      },
    ],
  },
];
