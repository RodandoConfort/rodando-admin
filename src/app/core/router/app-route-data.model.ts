import { Route } from '@angular/router';

export type AppPermission =
  | 'dashboard.read'
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'drivers.read'
  | 'drivers.create'
  | 'drivers.update'
  | 'drivers.delete';

export interface AppRouteData {
  title?: string;
  breadcrumb?: string;
  icon?: string;
  permission?: AppPermission;
  permissions?: AppPermission[];
  showInSidebar?: boolean;
}

export type AppRoute = Route & {
  data?: AppRouteData;
  children?: AppRoute[];
};

export type AppRoutes = AppRoute[];
