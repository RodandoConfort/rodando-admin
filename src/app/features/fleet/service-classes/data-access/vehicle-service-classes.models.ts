import { PaginationQuery } from '../../../../core/api/pagination.model';

export interface VehicleServiceClass {
  id: string;

  name: string;
  description?: string | null;

  baseFareMultiplier: number;
  costPerKmMultiplier: number;
  costPerMinuteMultiplier: number;
  minFareMultiplier: number;

  minCapacity: number;
  maxCapacity: number;

  iconUrl?: string | null;
  displayOrder?: number | null;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;

  vehicleTypeIds?: string[];
  vehicleTypeNames?: string[];
}

export interface VehicleServiceClassesQuery extends PaginationQuery {
  name?: string;
  isActive?: boolean | null;
}

export interface CreateVehicleServiceClassPayload {
  name: string;
  description?: string;

  baseFareMultiplier: number;
  costPerKmMultiplier: number;
  costPerMinuteMultiplier: number;
  minFareMultiplier: number;

  minCapacity: number;
  maxCapacity: number;

  iconUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateVehicleServiceClassPayload {
  name?: string;
  description?: string;

  baseFareMultiplier?: number;
  costPerKmMultiplier?: number;
  costPerMinuteMultiplier?: number;
  minFareMultiplier?: number;

  minCapacity?: number;
  maxCapacity?: number;

  iconUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}
