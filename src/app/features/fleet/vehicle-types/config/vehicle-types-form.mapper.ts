import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import {
  CreateVehicleTypePayload,
  UpdateVehicleTypePayload,
  VehicleType,
} from '../data-access/vehicle-types.models';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
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

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return [];
}

export function mapCreateVehicleTypeFormToPayload(
  value: DynamicFormValue,
): CreateVehicleTypePayload {
  return {
    iconUrl: asString(value['iconUrl']),
    name: asString(value['name']) ?? '',
    categoryId: asString(value['categoryId']) ?? '',
    serviceClassIds: asStringArray(value['serviceClassIds']),
    description: asString(value['description']),

    defaultCapacity: asNumber(value['defaultCapacity']) ?? 1,
    baseFare: asNumber(value['baseFare']) ?? 0,
    costPerKm: asNumber(value['costPerKm']) ?? 0,
    costPerMinute: asNumber(value['costPerMinute']) ?? 0,
    minFare: asNumber(value['minFare']) ?? 0,

    isActive: asBoolean(value['isActive']) ?? true,
  };
}

export function mapEditVehicleTypeFormToPayload(
  value: DynamicFormValue,
): UpdateVehicleTypePayload {
  return {
    iconUrl: asString(value['iconUrl']),
    name: asString(value['name']),
    categoryId: asString(value['categoryId']),
    serviceClassIds: asStringArray(value['serviceClassIds']),
    description: asString(value['description']),

    defaultCapacity: asNumber(value['defaultCapacity']),
    baseFare: asNumber(value['baseFare']),
    costPerKm: asNumber(value['costPerKm']),
    costPerMinute: asNumber(value['costPerMinute']),
    minFare: asNumber(value['minFare']),

    isActive: asBoolean(value['isActive']),
  };
}

export function mapVehicleTypeToEditFormValue(
  type: VehicleType,
): DynamicFormValue {
  return {
    iconUrl: type.iconUrl ?? '',
    name: type.name,
    categoryId: type.categoryId ?? '',
    serviceClassIds: type.serviceClassIds ?? [],
    description: type.description ?? '',

    defaultCapacity: type.defaultCapacity,
    baseFare: type.baseFare,
    costPerKm: type.costPerKm,
    costPerMinute: type.costPerMinute,
    minFare: type.minFare,

    isActive: type.isActive,
  };
}
