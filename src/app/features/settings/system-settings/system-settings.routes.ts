import { AppRoutes } from '../../../core/router/app-route-data.model';

import { SYSTEM_SETTINGS_PROVIDERS } from './system-settings.providers';

export const SYSTEM_SETTINGS_ROUTES: AppRoutes = [
  {
    path: '',
    providers: SYSTEM_SETTINGS_PROVIDERS,
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: {
          title: 'Configuración',
          breadcrumb: 'Configuración',
          icon: 'tune',
        },
        loadComponent: () =>
          import('./pages/system-settings-list-page').then((m) => m.SystemSettingsListPage),
      },
      {
        path: 'create',
        data: {
          title: 'Crear configuración',
          breadcrumb: 'Crear',
          icon: 'add_circle',
        },
        loadComponent: () =>
          import('./pages/system-setting-create-page').then((m) => m.SystemSettingCreatePage),
      },
      {
        path: ':key/edit',
        data: {
          title: 'Editar configuración',
          breadcrumb: 'Editar',
          icon: 'edit',
        },
        loadComponent: () =>
          import('./pages/system-setting-edit-page').then((m) => m.SystemSettingEditPage),
      },
      {
        path: ':key',
        data: {
          title: 'Detalle de configuración',
          breadcrumb: 'Detalle',
          icon: 'tune',
        },
        loadComponent: () =>
          import('./pages/system-setting-detail-page').then((m) => m.SystemSettingDetailPage),
      },
    ],
  },
];
