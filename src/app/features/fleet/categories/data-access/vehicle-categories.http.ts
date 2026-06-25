import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { ApiClient } from '../../../../core/api/api-client.service';
import { QueryParams } from '../../../../core/api/query-builder.util';
import {
  CreateVehicleCategoryPayload,
  UpdateVehicleCategoryPayload,
  VehicleCategoriesQuery,
  VehicleCategory,
} from './vehicle-categories.models';

const VEHICLE_CATEGORIES_URL = '/vehicle-categories';

@Injectable()
export class VehicleCategoriesHttp {
  private readonly api = inject(ApiClient);

  getCategories(query: VehicleCategoriesQuery) {
    return this.api.getPaginated<VehicleCategory>(VEHICLE_CATEGORIES_URL, {
      params: this.buildQueryParams(query),
    });
  }

  getCategoryById(id: string) {
    return this.api.getData<VehicleCategory>(`${VEHICLE_CATEGORIES_URL}/${id}`);
  }

  createCategory(payload: CreateVehicleCategoryPayload) {
    return this.api.postData<
      VehicleCategory,
      CreateVehicleCategoryPayload
    >(VEHICLE_CATEGORIES_URL, payload);
  }

  updateCategory(id: string, payload: UpdateVehicleCategoryPayload) {
    return this.api
      .patch<VehicleCategory, UpdateVehicleCategoryPayload>(
        `${VEHICLE_CATEGORIES_URL}/${id}`,
        payload,
      )
      .pipe(map((result) => result.data));
  }

  deleteCategory(id: string) {
    return this.api
      .delete<null>(`${VEHICLE_CATEGORIES_URL}/${id}`)
      .pipe(map(() => void 0));
  }

  private buildQueryParams(
    query: VehicleCategoriesQuery,
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
