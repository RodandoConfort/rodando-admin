import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { ApiClient } from '../../../../core/api/api-client.service';
import { QueryParams } from '../../../../core/api/query-builder.util';

import {
  UpdateVehiclePayload,
  Vehicle,
  VehicleCategoryOption,
  VehicleServiceClassOption,
  VehicleTypeOption,
  VehiclesQuery,
} from './vehicles.models';

const VEHICLES_URL = '/vehicles';
const VEHICLE_TYPES_URL = '/vehicle-types';
const VEHICLE_CATEGORIES_URL = '/vehicle-categories';
const VEHICLE_SERVICE_CLASSES_URL = '/vehicle-service-classes';

@Injectable()
export class VehiclesHttp {
  private readonly api = inject(ApiClient);

  getVehicles(query: VehiclesQuery) {
    return this.api
      .getPaginated<Vehicle>(VEHICLES_URL, {
        params: this.buildQueryParams(query),
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((vehicle) =>
            this.normalizeVehicle(vehicle),
          ),
        })),
      );
  }

  getVehicleById(id: string) {
    return this.api
      .getData<Vehicle>(`${VEHICLES_URL}/${id}`)
      .pipe(
        map((vehicle) =>
          this.normalizeVehicle(vehicle),
        ),
      );
  }

  updateVehicle(id: string, payload: UpdateVehiclePayload) {
    return this.api
      .patch<Vehicle, UpdateVehiclePayload>(`${VEHICLES_URL}/${id}`, payload)
      .pipe(
        map((result) =>
          this.normalizeVehicle(result.data),
        ),
      );
  }

  getCategoryOptions() {
    return this.api
      .getPaginated<VehicleCategoryOption>(VEHICLE_CATEGORIES_URL, {
        params: {
          isActive: true,
          limit: 100,
        },
      })
      .pipe(map((response) => response.items));
  }

  getServiceClassOptions() {
    return this.api
      .getPaginated<VehicleServiceClassOption>(VEHICLE_SERVICE_CLASSES_URL, {
        params: {
          isActive: true,
          limit: 100,
        },
      })
      .pipe(map((response) => response.items));
  }

  getVehicleTypeOptions() {
    return this.api
      .getPaginated<VehicleTypeOption>(VEHICLE_TYPES_URL, {
        params: {
          isActive: true,
          limit: 100,
        },
      })
      .pipe(
        map((response) =>
          response.items.map((type) =>
            this.normalizeVehicleTypeOption(type),
          ),
        ),
      );
  }

  private buildQueryParams(query: VehiclesQuery): QueryParams | undefined {
    const params: QueryParams = {};

    const search = query.search?.trim();

    if (search) {
      params['search'] = search;
    }

    if (query.categoryId) {
      params['categoryId'] = query.categoryId;
    }

    if (query.serviceClassId) {
      params['serviceClassId'] = query.serviceClassId;
    }

    if (query.vehicleTypeId) {
      params['vehicleTypeId'] = query.vehicleTypeId;
    }

    if (query.status) {
      params['status'] = query.status;
    }

    if (query.isActive !== undefined && query.isActive !== null) {
      params['isActive'] = query.isActive;
    }

    if (query.page && query.page > 1) {
      params['page'] = query.page;
    }

    if (query.limit && query.limit !== 10) {
      params['limit'] = query.limit;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }

  private normalizeVehicle(vehicle: Vehicle): Vehicle {
    const driverId = vehicle.driverId ?? vehicle.driver?.id ?? null;
    const driverName = vehicle.driverName ?? vehicle.driver?.name ?? null;

    const driverProfileId =
      vehicle.driverProfileId ?? vehicle.driverProfile?.id ?? null;

    const vehicleTypeId =
      vehicle.vehicleTypeId ?? vehicle.vehicleType?.id ?? null;

    const vehicleTypeName =
      vehicle.vehicleTypeName ?? vehicle.vehicleType?.name ?? null;

    const categoryId =
      vehicle.categoryId ??
      vehicle.vehicleType?.category?.id ??
      null;

    const categoryName =
      vehicle.categoryName ??
      vehicle.vehicleType?.category?.name ??
      null;

    const serviceClassIds =
      vehicle.serviceClassIds?.length
        ? vehicle.serviceClassIds
        : vehicle.vehicleType?.serviceClasses?.map((serviceClass) => serviceClass.id) ?? [];

    const serviceClassNames =
      vehicle.serviceClassNames?.length
        ? vehicle.serviceClassNames
        : vehicle.vehicleType?.serviceClasses?.map((serviceClass) => serviceClass.name) ?? [];

    return {
      ...vehicle,
      driverId,
      driverName,
      driverProfileId,
      vehicleTypeId,
      vehicleTypeName,
      categoryId,
      categoryName,
      serviceClassIds,
      serviceClassNames,
    };
  }

  private normalizeVehicleTypeOption(
    type: VehicleTypeOption,
  ): VehicleTypeOption {
    const categoryId =
      type.categoryId ??
      type.category?.id ??
      null;

    const categoryName =
      type.categoryName ??
      type.category?.name ??
      null;

    const serviceClassIds =
      type.serviceClassIds?.length
        ? type.serviceClassIds
        : type.serviceClasses?.map((serviceClass) => serviceClass.id) ?? [];

    const serviceClassNames =
      type.serviceClassNames?.length
        ? type.serviceClassNames
        : type.serviceClasses?.map((serviceClass) => serviceClass.name) ?? [];

    return {
      ...type,
      categoryId,
      categoryName,
      serviceClassIds,
      serviceClassNames,
    };
  }
}
