import { PaginationQuery } from '../../../core/api/pagination.model';

export interface GeoJsonMultiPolygon {
  type: 'MultiPolygon';
  coordinates: unknown[];
}

export interface City {
  id: string;
  name: string;
  countryCode: string;
  timezone: string;
  geom?: GeoJsonMultiPolygon | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CitiesQuery extends PaginationQuery {
  q?: string;
  name?: string;
  countryCode?: string | null;
  timezone?: string | null;
  active?: boolean | null;
}

export interface CreateCityPayload {
  name: string;
  countryCode: string;
  timezone: string;
  geom?: GeoJsonMultiPolygon | null;
  active?: boolean;
}

export type UpdateCityPayload = Partial<CreateCityPayload>;

export interface ZoneCityRef {
  id: string;
  name: string;
  countryCode?: string;
  timezone?: string;
  active?: boolean;
}

export interface Zone {
  id: string;
  cityId: string;
  city?: ZoneCityRef | null;
  cityName?: string | null;
  name: string;
  kind?: string | null;
  priority: number;
  geom?: GeoJsonMultiPolygon | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ZonesQuery extends PaginationQuery {
  cityId?: string | null;
  q?: string;
  name?: string;
  kind?: string | null;
  priorityGte?: number | null;
  active?: boolean | null;
}

export interface CreateZonePayload {
  cityId: string;
  name: string;
  kind?: string | null;
  priority?: number;
  geom: GeoJsonMultiPolygon;
  active?: boolean;
}

export interface UpdateZonePayload {
  name?: string;
  kind?: string | null;
  priority?: number;
  geom?: GeoJsonMultiPolygon;
  active?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface CityOption {
  id: string;
  name: string;
  countryCode: string;
  timezone: string;
  active: boolean;
}
