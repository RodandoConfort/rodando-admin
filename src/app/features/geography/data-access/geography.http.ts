import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { ApiClient } from '../../../core/api/api-client.service';
import { QueryParams } from '../../../core/api/query-builder.util';

import {
  CitiesQuery,
  City,
  CityOption,
  CreateCityPayload,
  CreateZonePayload,
  UpdateCityPayload,
  UpdateZonePayload,
  Zone,
  ZonesQuery,
} from './geography.models';

const CITIES_URL = '/cities';
const ZONES_URL = '/zones';

@Injectable()
export class GeographyHttp {
  private readonly api = inject(ApiClient);

  getCities(query: CitiesQuery) {
    return this.api.getPaginated<City>(CITIES_URL, {
      params: this.buildCitiesQueryParams(query),
    });
  }

  getCityById(id: string) {
    return this.api.getData<City>(`${CITIES_URL}/${id}`);
  }

  createCity(payload: CreateCityPayload) {
    return this.api.postData<City, CreateCityPayload>(CITIES_URL, payload);
  }

  updateCity(id: string, payload: UpdateCityPayload) {
    return this.api
      .patch<City, UpdateCityPayload>(`${CITIES_URL}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  setCityActive(id: string, active: boolean) {
    return this.api
      .patch<City, { active: boolean }>(`${CITIES_URL}/${id}/active`, {
        active,
      })
      .pipe(map((response) => response.data));
  }

  getCityOptions() {
    return this.api
      .getPaginated<CityOption>(CITIES_URL, {
        params: {
          active: true,
          limit: 100,
        },
      })
      .pipe(map((response) => response.items));
  }

  getZones(query: ZonesQuery) {
    return this.api.getPaginated<Zone>(ZONES_URL, {
      params: this.buildZonesQueryParams(query),
    });
  }

  getZoneById(id: string) {
    return this.api.getData<Zone>(`${ZONES_URL}/${id}`);
  }

  createZone(payload: CreateZonePayload) {
    return this.api.postData<Zone, CreateZonePayload>(ZONES_URL, payload);
  }

  updateZone(id: string, payload: UpdateZonePayload) {
    return this.api
      .patch<Zone, UpdateZonePayload>(`${ZONES_URL}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  setZoneActive(id: string, active: boolean) {
    return this.api
      .patch<Zone, { active: boolean }>(`${ZONES_URL}/${id}/active`, {
        active,
      })
      .pipe(map((response) => response.data));
  }

  private buildCitiesQueryParams(query: CitiesQuery): QueryParams | undefined {
    const params: QueryParams = {};

    const q = query.q?.trim();

    if (q) {
      params['q'] = q;
    }

    if (query.countryCode) {
      params['countryCode'] = query.countryCode;
    }

    if (query.timezone) {
      params['timezone'] = query.timezone;
    }

    if (query.active !== undefined && query.active !== null) {
      params['active'] = query.active;
    }

    if (query.page && query.page > 1) {
      params['page'] = query.page;
    }

    if (query.limit && query.limit !== 10) {
      params['limit'] = query.limit;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }

  private buildZonesQueryParams(query: ZonesQuery): QueryParams | undefined {
    const params: QueryParams = {};

    const q = query.q?.trim();

    if (q) {
      params['q'] = q;
    }

    if (query.cityId) {
      params['cityId'] = query.cityId;
    }

    if (query.kind) {
      params['kind'] = query.kind;
    }

    if (query.priorityGte !== undefined && query.priorityGte !== null) {
      params['priorityGte'] = query.priorityGte;
    }

    if (query.active !== undefined && query.active !== null) {
      params['active'] = query.active;
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
