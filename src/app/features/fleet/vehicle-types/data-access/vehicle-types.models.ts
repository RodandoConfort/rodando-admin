import { PaginationQuery } from '../../../../core/api/pagination.model';

export interface VehicleTypeCategoryRef {
  id: string;
  name: string;
}

export interface VehicleTypeServiceClassRef {
  id: string;
  name: string;
}

export interface VehicleType {
  id: string;

  name: string;
  description?: string | null;

  baseFare: number;
  costPerKm: number;
  costPerMinute: number;
  minFare: number;
  defaultCapacity: number;

  iconUrl?: string | null;
  isActive: boolean;

  categoryId?: string | null;
  categoryName?: string | null;

  serviceClassIds?: string[];
  serviceClassNames?: string[];

  category?: VehicleTypeCategoryRef | null;
  serviceClasses?: VehicleTypeServiceClassRef[];

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface VehicleTypesQuery extends PaginationQuery {
  name?: string;
  isActive?: boolean | null;
  categoryId?: string | null;
  serviceClassIds?: string[];
}

export interface CreateVehicleTypePayload {
  categoryId: string;
  serviceClassIds: string[];

  name: string;
  description?: string;

  baseFare: number;
  costPerKm: number;
  costPerMinute: number;
  minFare: number;
  defaultCapacity: number;

  iconUrl?: string;
  isActive?: boolean;
}

export interface UpdateVehicleTypePayload {
  categoryId?: string;
  serviceClassIds?: string[];

  name?: string;
  description?: string;

  baseFare?: number;
  costPerKm?: number;
  costPerMinute?: number;
  minFare?: number;
  defaultCapacity?: number;

  iconUrl?: string;
  isActive?: boolean;
}

export interface VehicleCategoryOption {
  id: string;
  name: string;
  isActive: boolean;
}

export interface VehicleServiceClassOption {
  id: string;
  name: string;
  isActive: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}
