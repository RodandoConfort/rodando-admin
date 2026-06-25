import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import {
  CreateVehicleServiceClassPayload,
  UpdateVehicleServiceClassPayload,
  VehicleServiceClass,
} from '../data-access/vehicle-service-classes.models';

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

export function mapCreateVehicleServiceClassFormToPayload(
  value: DynamicFormValue,
): CreateVehicleServiceClassPayload {
  return {
    iconUrl: asString(value['iconUrl']),
    name: asString(value['name']) ?? '',
    description: asString(value['description']),

    baseFareMultiplier: asNumber(value['baseFareMultiplier']) ?? 1,
    costPerKmMultiplier: asNumber(value['costPerKmMultiplier']) ?? 1,
    costPerMinuteMultiplier:
      asNumber(value['costPerMinuteMultiplier']) ?? 1,
    minFareMultiplier: asNumber(value['minFareMultiplier']) ?? 1,

    minCapacity: asNumber(value['minCapacity']) ?? 1,
    maxCapacity: asNumber(value['maxCapacity']) ?? 1,

    displayOrder: asNumber(value['displayOrder']) ?? 1,
    isActive: asBoolean(value['isActive']) ?? true,
  };
}

export function mapEditVehicleServiceClassFormToPayload(
  value: DynamicFormValue,
): UpdateVehicleServiceClassPayload {
  return {
    iconUrl: asString(value['iconUrl']),
    name: asString(value['name']),
    description: asString(value['description']),

    baseFareMultiplier: asNumber(value['baseFareMultiplier']),
    costPerKmMultiplier: asNumber(value['costPerKmMultiplier']),
    costPerMinuteMultiplier:
      asNumber(value['costPerMinuteMultiplier']),
    minFareMultiplier: asNumber(value['minFareMultiplier']),

    minCapacity: asNumber(value['minCapacity']),
    maxCapacity: asNumber(value['maxCapacity']),

    displayOrder: asNumber(value['displayOrder']),
    isActive: asBoolean(value['isActive']),
  };
}

export function mapVehicleServiceClassToEditFormValue(
  serviceClass: VehicleServiceClass,
): DynamicFormValue {
  return {
    iconUrl: serviceClass.iconUrl ?? '',
    name: serviceClass.name,
    description: serviceClass.description ?? '',

    baseFareMultiplier: serviceClass.baseFareMultiplier,
    costPerKmMultiplier: serviceClass.costPerKmMultiplier,
    costPerMinuteMultiplier: serviceClass.costPerMinuteMultiplier,
    minFareMultiplier: serviceClass.minFareMultiplier,

    minCapacity: serviceClass.minCapacity,
    maxCapacity: serviceClass.maxCapacity,

    displayOrder: serviceClass.displayOrder ?? 1,
    isActive: serviceClass.isActive,
  };
}
