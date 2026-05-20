import { AppPermission } from '../../core/router/app-route-data.model';
import { ROUTE_COMMANDS } from '../../core/router/app-paths';

export interface AdminNavigationItem {
  label: string;
  icon: string;
  route: readonly unknown[];
  permission?: AppPermission;
  exact?: boolean;
  badge?: string;
}

export const ADMIN_NAVIGATION: AdminNavigationItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: ROUTE_COMMANDS.admin.dashboard,
    permission: 'dashboard.read',
    exact: true,
  },
  {
    label: 'Usuarios',
    icon: 'group',
    route: ROUTE_COMMANDS.admin.users,
    permission: 'users.read',
  },
  {
    label: 'Conductores',
    icon: 'local_shipping',
    route: ROUTE_COMMANDS.admin.drivers,
    permission: 'drivers.read',
  },
];
