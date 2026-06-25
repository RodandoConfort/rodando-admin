import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import {
  UpdateVehiclePayload,
  Vehicle,
  VehicleStatus,
} from '../data-access/vehicles.models';

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

function asDateString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return value.trim() || undefined;
}

export function mapEditVehicleFormToPayload(
  value: DynamicFormValue,
): UpdateVehiclePayload {
  return {
    vehicleTypeId: asString(value['vehicleTypeId']),
    make: asString(value['make']),
    model: asString(value['model']),
    year: asNumber(value['year']),
    plateNumber: asString(value['plateNumber']),
    color: asString(value['color']),
    capacity: asNumber(value['capacity']),
    status: asString(value['status']) as VehicleStatus | undefined,
    isActive: asBoolean(value['isActive']),
    inspectionDate: asDateString(value['inspectionDate']),
    lastMaintenanceDate: asDateString(value['lastMaintenanceDate']),
    mileage: asNumber(value['mileage']),
  };
}

export function mapVehicleToEditFormValue(vehicle: Vehicle): DynamicFormValue {
  return {
    vehicleTypeId: vehicle.vehicleTypeId ?? '',
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    plateNumber: vehicle.plateNumber,
    color: vehicle.color ?? '',
    capacity: vehicle.capacity,
    status: vehicle.status,
    isActive: vehicle.isActive,
    inspectionDate: vehicle.inspectionDate ?? '',
    lastMaintenanceDate: vehicle.lastMaintenanceDate ?? '',
    mileage: vehicle.mileage ?? '',
  };
}
