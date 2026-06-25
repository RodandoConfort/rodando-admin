import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';

import {
  City,
  CreateCityPayload,
  CreateZonePayload,
  GeoJsonMultiPolygon,
  UpdateCityPayload,
  UpdateZonePayload,
  Zone,
} from '../data-access/geography.models';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

function parseMultiPolygon(value: unknown): GeoJsonMultiPolygon | undefined {
  const raw = asString(value);

  if (!raw) {
    return undefined;
  }

  const parsed = JSON.parse(raw);

  if (
    parsed?.type !== 'MultiPolygon' ||
    !Array.isArray(parsed.coordinates)
  ) {
    return undefined;
  }

  return parsed as GeoJsonMultiPolygon;
}

function removeUndefined<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as T;
}

export function mapCityFormToCreatePayload(
  value: DynamicFormValue,
): CreateCityPayload {
  return removeUndefined({
    name: asString(value['name']) ?? '',
    countryCode: (asString(value['countryCode']) ?? '').toUpperCase(),
    timezone: asString(value['timezone']) ?? '',
    geom: parseMultiPolygon(value['geomJson']),
    active: asBoolean(value['active']) ?? true,
  });
}

export function mapCityFormToUpdatePayload(
  value: DynamicFormValue,
): UpdateCityPayload {
  return mapCityFormToCreatePayload(value);
}

export function mapCityToFormValue(city: City): DynamicFormValue {
  return {
    name: city.name,
    countryCode: city.countryCode,
    timezone: city.timezone,
    active: city.active,
    geomJson: city.geom ? JSON.stringify(city.geom, null, 2) : '',
  };
}

export function mapZoneFormToCreatePayload(
  value: DynamicFormValue,
): CreateZonePayload {
  return removeUndefined({
    cityId: asString(value['cityId']) ?? '',
    name: asString(value['name']) ?? '',
    kind: asString(value['kind']) ?? null,
    priority: asNumber(value['priority']) ?? 100,
    geom: parseMultiPolygon(value['geomJson']) as GeoJsonMultiPolygon,
    active: asBoolean(value['active']) ?? true,
  });
}

export function mapZoneFormToUpdatePayload(
  value: DynamicFormValue,
): UpdateZonePayload {
  return removeUndefined({
    name: asString(value['name']),
    kind: asString(value['kind']) ?? null,
    priority: asNumber(value['priority']),
    geom: parseMultiPolygon(value['geomJson']),
    active: asBoolean(value['active']),
  });
}

export function mapZoneToFormValue(zone: Zone): DynamicFormValue {
  return {
    name: zone.name,
    kind: zone.kind ?? '',
    priority: zone.priority,
    active: zone.active,
    geomJson: zone.geom ? JSON.stringify(zone.geom, null, 2) : '',
  };
}
