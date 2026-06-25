import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { ApiClient } from '../../../../core/api/api-client.service';
import { QueryParams } from '../../../../core/api/query-builder.util';

import {
  CreateVehicleTypePayload,
  UpdateVehicleTypePayload,
  VehicleCategoryOption,
  VehicleServiceClassOption,
  VehicleType,
  VehicleTypesQuery,
} from './vehicle-types.models';

const VEHICLE_TYPES_URL = '/vehicle-types';
const VEHICLE_CATEGORIES_URL = '/vehicle-categories';
const VEHICLE_SERVICE_CLASSES_URL = '/vehicle-service-classes';

@Injectable()
export class VehicleTypesHttp {
  private readonly api = inject(ApiClient);

  getTypes(query: VehicleTypesQuery) {
    return this.api
      .getPaginated<VehicleType>(VEHICLE_TYPES_URL, {
        params: this.buildQueryParams(query),
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((item) => this.normalizeVehicleType(item)),
        })),
      );
  }

  getTypeById(id: string) {
    return this.api
      .getData<VehicleType>(`${VEHICLE_TYPES_URL}/${id}`)
      .pipe(map((item) => this.normalizeVehicleType(item)));
  }

  createType(payload: CreateVehicleTypePayload) {
    return this.api.postData<VehicleType, CreateVehicleTypePayload>(
      VEHICLE_TYPES_URL,
      payload,
    );
  }

  updateType(id: string, payload: UpdateVehicleTypePayload) {
    return this.api
      .patch<VehicleType, UpdateVehicleTypePayload>(
        `${VEHICLE_TYPES_URL}/${id}`,
        payload,
      )
      .pipe(map((result) => this.normalizeVehicleType(result.data)));
  }

  deleteType(id: string) {
    return this.api
      .delete<null>(`${VEHICLE_TYPES_URL}/${id}`)
      .pipe(map(() => void 0));
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

  private buildQueryParams(query: VehicleTypesQuery): QueryParams | undefined {
    const params: QueryParams = {};

    const name = query.name?.trim();

    if (name) {
      params['name'] = name;
    }

    if (query.isActive !== undefined && query.isActive !== null) {
      params['isActive'] = query.isActive;
    }

    if (query.categoryId) {
      params['categoryId'] = query.categoryId;
    }

    if (query.serviceClassIds?.length) {
      params['serviceClassIds'] = query.serviceClassIds.join(',');
    }

    if (query.page && query.page > 1) {
      params['page'] = query.page;
    }

    if (query.limit && query.limit !== 10) {
      params['limit'] = query.limit;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }

  private normalizeVehicleType(type: VehicleType): VehicleType {
    const categoryId = type.categoryId ?? type.category?.id ?? null;
    const categoryName = type.categoryName ?? type.category?.name ?? null;

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
