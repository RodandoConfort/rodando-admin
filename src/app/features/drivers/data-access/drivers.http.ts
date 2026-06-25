import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

import { ApiClient } from '../../../core/api/api-client.service';
import { QueryParams } from '../../../core/api/query-builder.util';

import {
  CreateDriverProfilePayload,
  DriverProfile,
  DriversQuery,
  UpdateDriverProfilePayload,
  VehicleTypeOption,
} from './drivers.models';

const DRIVER_PROFILES_URL = '/drivers';
const VEHICLE_TYPES_URL = '/vehicle-types';

@Injectable()
export class DriversHttp {
  private readonly api = inject(ApiClient);

  getDrivers(query: DriversQuery) {
    return this.api.getPaginated<DriverProfile>(DRIVER_PROFILES_URL, {
      params: this.buildDriversQueryParams(query),
    });
  }

  getDriverById(id: string) {
    return this.api.getData<DriverProfile>(`${DRIVER_PROFILES_URL}/${id}`);
  }

  createDriverProfile(payload: CreateDriverProfilePayload) {
    return this.api.postData<DriverProfile, CreateDriverProfilePayload>(
      DRIVER_PROFILES_URL,
      payload,
    );
  }

  updateDriverProfile(id: string, payload: UpdateDriverProfilePayload) {
    return this.api
      .patch<DriverProfile, UpdateDriverProfilePayload>(
        `${DRIVER_PROFILES_URL}/${id}`,
        payload,
      )
      .pipe(map((result) => result.data));
  }

  deleteDriverProfile(id: string) {
    return this.api
      .delete<null>(`${DRIVER_PROFILES_URL}/${id}`)
      .pipe(map(() => void 0));
  }

  getVehicleTypeOptions() {
    return this.api
      .getPaginated<VehicleTypeOption>(VEHICLE_TYPES_URL, {
        params: {
          isActive: true,
          limit: 100,
        },
      })
      .pipe(map((response) => response.items));
  }

  private buildDriversQueryParams(query: DriversQuery): QueryParams | undefined {
    const params: QueryParams = {};

    const search = query.search?.trim();

    if (search) {
      params['search'] = search;
    }

    if (query.backgroundCheckStatus) {
      params['backgroundCheckStatus'] = query.backgroundCheckStatus;
    }

    if (query.driverStatus) {
      params['driverStatus'] = query.driverStatus;
    }

    if (query.isApproved !== undefined && query.isApproved !== null) {
      params['isApproved'] = query.isApproved;
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
