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
    icon: 'directions_car',
    route: ROUTE_COMMANDS.admin.drivers,
    permission: 'drivers.read',
  },
  {
    label: 'Control de Flota',
    icon: 'local_shipping',
    route: ROUTE_COMMANDS.admin.fleet,
    // permission: 'drivers.read',
  },
  {
    label: 'Viajes',
    icon: 'route',
    route: ROUTE_COMMANDS.admin.trips,
  },
  {
    label: 'Geografía',
    icon: 'public',
    route: ROUTE_COMMANDS.admin.geography,
    exact: false,
  },
  {
    label: 'Puntos de Recaudo',
    icon: 'route',
    route: ROUTE_COMMANDS.admin.cashCollectionPoints,
  },
  {
    label: 'Configuración',
    icon: 'tune',
    route: ROUTE_COMMANDS.admin.systemSettings,
    exact: false,
  },
  {
    label: 'Políticas de precio',
    icon: 'payments',
    route: ROUTE_COMMANDS.admin.pricePolicies,
    exact: false,
  },
  {
    label: 'Reportes',
    icon: 'analytics',
    route: ROUTE_COMMANDS.admin.reports,
    exact: false,
  },
];
