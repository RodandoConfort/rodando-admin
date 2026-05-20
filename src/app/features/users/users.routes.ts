import { Routes } from '@angular/router';

import { USERS_PROVIDERS } from './users.providers';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    providers: USERS_PROVIDERS,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/users-list.page').then(
            (m) => m.UsersListPage,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/user-profile.page').then(
            (m) => m.UserProfilePage,
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/user-create.page').then(
            (m) => m.UserCreatePage,
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/user-edit.page').then(
            (m) => m.UserEditPage,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/user-detail.page').then(
            (m) => m.UserDetailPage,
          ),
      },
    ],
  },
];
