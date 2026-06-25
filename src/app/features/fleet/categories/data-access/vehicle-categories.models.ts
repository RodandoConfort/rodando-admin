import { PaginationQuery } from '../../../../core/api/pagination.model';

export interface VehicleCategory {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface VehicleCategoriesQuery extends PaginationQuery {
  name?: string;
  isActive?: boolean | null;
}

export interface CreateVehicleCategoryPayload {
  name: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}

export interface UpdateVehicleCategoryPayload {
  name?: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}
