import { AppRoutes } from '../../core/router/app-route-data.model';
import { VehicleCategoriesListPage } from './categories/pages/vehicle-categories-list.page';
import { VehicleCategoryCreatePage } from './categories/pages/vehicle-category-create.page';
import { VehicleCategoryEditPage } from './categories/pages/vehicle-category-edit-page';
import { VEHICLE_CATEGORIES_PROVIDERS } from './categories/vehicle-categories.providers';
import { VehicleServiceClassCreatePage } from './service-classes/pages/service-class-create.page';
import { VehicleServiceClassDetailPage } from './service-classes/pages/service-class-detail.page';
import { VehicleServiceClassEditPage } from './service-classes/pages/service-class-edit.page';
import { VehicleServiceClassesListPage } from './service-classes/pages/service-classes-list';
import { VEHICLE_SERVICE_CLASSES_PROVIDERS } from './service-classes/vehicle-service-classes.providers';
import { VehicleTypeCreatePage } from './vehicle-types/pages/vehicle-type-create.page';
import { VehicleTypeDetailPage } from './vehicle-types/pages/vehicle-type-detail.page';
import { VehicleTypeEditPage } from './vehicle-types/pages/vehicle-type-edit.page';
import { VehicleTypesListPage } from './vehicle-types/pages/vehicle-types-list.page';
import { VEHICLE_TYPES_PROVIDERS } from './vehicle-types/vehicle-types.providers';
import { VehicleDetailPage } from './vehicles/pages/vehicle-detail.page';
import { VehicleEditPage } from './vehicles/pages/vehicle-edit.page';
import { VehiclesListPage } from './vehicles/pages/vehicles-list.page';
import { VEHICLES_PROVIDERS } from './vehicles/vehicles.providers';

export const FLEET_ROUTES: AppRoutes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'vehicles',
      },

      // Vehicles: al tocar Flota en sidebar cae aquí
      {
        path: 'vehicles',
        providers: VEHICLES_PROVIDERS,
        children: [
          {
            path: '',
            component: VehiclesListPage,
          },
          {
            path: ':id',
            component: VehicleDetailPage,
          },
          {
            path: ':id/edit',
            component: VehicleEditPage,
          },
        ],
      },

      // Categories
      {
        path: 'categories',
        providers: VEHICLE_CATEGORIES_PROVIDERS,
        children: [
          {
            path: '',
            component: VehicleCategoriesListPage,
          },
          {
            path: 'create',
            component: VehicleCategoryCreatePage,
          },
          // {
          //   path: ':id',
          //   component: CategoryDetailPage,
          // },
          {
            path: ':id/edit',
            component: VehicleCategoryEditPage,
          },
        ],
      },

      // Vehicle types
      {
        path: 'vehicle-types',
        providers: VEHICLE_TYPES_PROVIDERS,
        children: [
          {
            path: '',
            component: VehicleTypesListPage,
          },
          {
            path: 'create',
            component: VehicleTypeCreatePage,
          },
          {
            path: ':id/edit',
            component: VehicleTypeEditPage,
          },
          {
            path: ':id',
            component: VehicleTypeDetailPage,
          },
        ],
      },

      // Service classes
      {
        path: 'service-classes',
        providers: VEHICLE_SERVICE_CLASSES_PROVIDERS,
        children: [
          {
            path: '',
            component: VehicleServiceClassesListPage,
          },
          {
            path: 'create',
            component: VehicleServiceClassCreatePage,
          },
          {
            path: ':id',
            component: VehicleServiceClassDetailPage,
          },
          {
            path: ':id/edit',
            component: VehicleServiceClassEditPage,
          },
        ],
      },
    ],
  },
];
