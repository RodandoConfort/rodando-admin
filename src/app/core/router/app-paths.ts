export const APP_PATHS = {
  auth: 'auth',
  admin: 'admin',
} as const;

export const ADMIN_PATHS = {
  dashboard: 'dashboard',
  users: 'users',
  drivers: 'drivers',
} as const;

export const ROUTE_COMMANDS = {
  auth: {
    login: ['/auth', 'login'] as const,
  },

  admin: {
    root: ['/admin'] as const,
    dashboard: ['/admin', 'dashboard'] as const,

    users: ['/admin', 'users'] as const,
    userCreate: ['/admin', 'users', 'create'] as const,
    userDetail: (id: string | number) => ['/admin', 'users', id] as const,
    userEdit: (id: string | number) => ['/admin', 'users', id, 'edit'] as const,

    drivers: ['/admin', 'drivers'] as const,
    driverCreate: ['/admin', 'drivers', 'create'] as const,
    driverDetail: (id: string | number) => ['/admin', 'drivers', id] as const,
    driverEdit: (id: string | number) => ['/admin', 'drivers', id, 'edit'] as const,
  },
} as const;
