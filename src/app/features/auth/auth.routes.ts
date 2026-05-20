import { AppRoutes } from '../../core/router/app-route-data.model';

export const AUTH_ROUTES: AppRoutes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    data: {
      title: 'Iniciar sesión',
      breadcrumb: 'Login',
    },
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
];