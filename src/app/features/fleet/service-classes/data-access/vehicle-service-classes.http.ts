import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { ApiClient } from '../../../../core/api/api-client.service';
import { QueryParams } from '../../../../core/api/query-builder.util';

import {
  CreateVehicleServiceClassPayload,
  UpdateVehicleServiceClassPayload,
  VehicleServiceClass,
  VehicleServiceClassesQuery,
} from './vehicle-service-classes.models';

const VEHICLE_SERVICE_CLASSES_URL = '/vehicle-service-classes';

@Injectable()
export class VehicleServiceClassesHttp {
  private readonly api = inject(ApiClient);

  getServiceClasses(query: VehicleServiceClassesQuery) {
    return this.api.getPaginated<VehicleServiceClass>(
      VEHICLE_SERVICE_CLASSES_URL,
      {
        params: this.buildQueryParams(query),
      },
    );
  }

  getServiceClassById(id: string) {
    return this.api.getData<VehicleServiceClass>(
      `${VEHICLE_SERVICE_CLASSES_URL}/${id}`,
    );
  }

  createServiceClass(payload: CreateVehicleServiceClassPayload) {
    return this.api.postData<
      VehicleServiceClass,
      CreateVehicleServiceClassPayload
    >(VEHICLE_SERVICE_CLASSES_URL, payload);
  }

  updateServiceClass(id: string, payload: UpdateVehicleServiceClassPayload) {
    return this.api
      .patch<VehicleServiceClass, UpdateVehicleServiceClassPayload>(
        `${VEHICLE_SERVICE_CLASSES_URL}/${id}`,
        payload,
      )
      .pipe(map((result) => result.data));
  }

  deleteServiceClass(id: string) {
    return this.api
      .delete<null>(`${VEHICLE_SERVICE_CLASSES_URL}/${id}`)
      .pipe(map(() => void 0));
  }

  private buildQueryParams(
    query: VehicleServiceClassesQuery,
  ): QueryParams | undefined {
    const params: QueryParams = {};

    const name = query.name?.trim();

    if (name) {
      params['name'] = name;
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
}
