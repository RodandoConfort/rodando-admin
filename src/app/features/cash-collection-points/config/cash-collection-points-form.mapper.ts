import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';

import {
  CashCollectionPoint,
  CreateCashCollectionPointPayload,
  UpdateCashCollectionPointPayload,
} from '../data-access/cash-collection-points.models';

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

function parseOpeningHours(value: unknown): Record<string, unknown> | undefined {
  const raw = asString(value);

  if (!raw) {
    return undefined;
  }

  const parsed = JSON.parse(raw);

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    return undefined;
  }

  return parsed as Record<string, unknown>;
}

function mapLocation(value: DynamicFormValue): [number, number] | undefined {
  const longitude = asNumber(value['longitude']);
  const latitude = asNumber(value['latitude']);

  if (longitude === undefined || latitude === undefined) {
    return undefined;
  }

  return [
    longitude,
    latitude,
  ];
}

function removeUndefined<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as T;
}

export function mapCashCollectionPointFormToPayload(
  value: DynamicFormValue,
): CreateCashCollectionPointPayload {
  return removeUndefined({
    name: asString(value['name']) ?? '',
    address: asString(value['address']) ?? null,
    contactPhone: asString(value['contactPhone']) ?? null,
    location: mapLocation(value),
    openingHours: parseOpeningHours(value['openingHoursJson']),
    isActive: asBoolean(value['isActive']) ?? true,
  });
}

export function mapCashCollectionPointToFormValue(
  point: CashCollectionPoint,
): DynamicFormValue {
  return {
    name: point.name,
    address: point.address ?? '',
    contactPhone: point.contactPhone ?? '',
    longitude: point.location?.[0] ?? null,
    latitude: point.location?.[1] ?? null,
    openingHoursJson: point.openingHours
      ? JSON.stringify(point.openingHours, null, 2)
      : '',
    isActive: point.isActive,
  };
}

export function mapEditCashCollectionPointFormToPayload(
  value: DynamicFormValue,
): UpdateCashCollectionPointPayload {
  return mapCashCollectionPointFormToPayload(value);
}
