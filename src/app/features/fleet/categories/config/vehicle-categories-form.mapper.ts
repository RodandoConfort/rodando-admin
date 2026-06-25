import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';
import {
  CreateVehicleCategoryPayload,
  UpdateVehicleCategoryPayload,
  VehicleCategory,
} from '../data-access/vehicle-categories.models';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
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

export function mapCreateVehicleCategoryFormToPayload(
  value: DynamicFormValue,
): CreateVehicleCategoryPayload {
  return {
    name: asString(value['name']) ?? '',
    description: asString(value['description']),
    iconUrl: asString(value['iconUrl']),
    isActive: asBoolean(value['isActive']) ?? true,
  };
}

export function mapEditVehicleCategoryFormToPayload(
  value: DynamicFormValue,
): UpdateVehicleCategoryPayload {
  return {
    name: asString(value['name']),
    description: asString(value['description']),
    iconUrl: asString(value['iconUrl']),
    isActive: asBoolean(value['isActive']),
  };
}

export function mapVehicleCategoryToEditFormValue(
  category: VehicleCategory,
): DynamicFormValue {
  return {
    iconUrl: category.iconUrl ?? '',
    name: category.name,
    description: category.description ?? '',
    isActive: category.isActive,
  };
}
