export const APP_PATHS = {
  auth: 'auth',
  admin: 'admin',
} as const;

export const ADMIN_PATHS = {
  dashboard: 'dashboard',
  users: 'users',
  drivers: 'drivers',
  fleet: 'fleet',
  trips: 'trips',
  cashCollectionPoints: 'cash-collection-points',
  geography: 'geography',
  systemSettings: 'system-settings',
  pricePolicies: 'price-policies',
  reports: 'reports',
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

    fleet: ['/admin', 'fleet'] as const,
    fleetCreate: ['/admin', 'fleet', 'create'] as const,
    fleetDetail: (id: string | number) => ['/admin', 'fleet', id] as const,
    fleetEdit: (id: string | number) => ['/admin', 'fleet', id, 'edit'] as const,

    trips: ['/admin', 'trips'] as const,
    tripDetail: (id: string | number) => ['/admin', 'trips', id] as const,

    cashCollectionPoints: ['/admin', 'cash-collection-points'] as const,
    cashCollectionPointCreate: ['/admin', 'cash-collection-points', 'create'] as const,
    cashCollectionPointDetail: (id: string | number) =>
      ['/admin', 'cash-collection-points', id] as const,
    cashCollectionPointEdit: (id: string | number) =>
      ['/admin', 'cash-collection-points', id, 'edit'] as const,

    geography: ['/admin', 'geography'] as const,

    geographyCities: ['/admin', 'geography', 'cities'] as const,
    geographyCityCreate: ['/admin', 'geography', 'cities', 'create'] as const,
    geographyCityDetail: (id: string | number) => ['/admin', 'geography', 'cities', id] as const,
    geographyCityEdit: (id: string | number) =>
      ['/admin', 'geography', 'cities', id, 'edit'] as const,

    geographyZones: ['/admin', 'geography', 'zones'] as const,
    geographyZoneCreate: ['/admin', 'geography', 'zones', 'create'] as const,
    geographyZoneDetail: (id: string | number) => ['/admin', 'geography', 'zones', id] as const,
    geographyZoneEdit: (id: string | number) =>
      ['/admin', 'geography', 'zones', id, 'edit'] as const,

    systemSettings: ['/admin', 'system-settings'] as const,
    systemSettingCreate: ['/admin', 'system-settings', 'create'] as const,
    systemSettingDetail: (key: string) => ['/admin', 'system-settings', key] as const,
    systemSettingEdit: (key: string) => ['/admin', 'system-settings', key, 'edit'] as const,

    pricePolicies: ['/admin', 'price-policies'] as const,

    pricePoliciesCrud: ['/admin', 'price-policies', 'policies'] as const,
    pricePolicyCreate: ['/admin', 'price-policies', 'policies', 'create'] as const,
    pricePolicyDetail: (id: string | number) =>
      ['/admin', 'price-policies', 'policies', id] as const,
    pricePolicyEdit: (id: string | number) =>
      ['/admin', 'price-policies', 'policies', id, 'edit'] as const,

    pricePoliciesSimulator: ['/admin', 'price-policies', 'simulator'] as const,

    reports: ['/admin', 'reports'] as const,
    reportsFinance: ['/admin', 'reports', 'finance'] as const,
    reportsDrivers: ['/admin', 'reports', 'drivers'] as const,
    reportsVehicles: ['/admin', 'reports', 'vehicles'] as const,
    reportsUsers: ['/admin', 'reports', 'users'] as const,
    reportsOperations: ['/admin', 'reports', 'operations'] as const,
    reportsDataQuality: ['/admin', 'reports', 'data-quality'] as const,
  },
} as const;
