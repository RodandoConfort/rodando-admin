import { PaginationQuery } from '../../../../core/api/pagination.model';

export type VehicleStatus =
  | 'pending_review'
  | 'approved'
  | 'in_service'
  | 'rejected'
  | 'maintenance'
  | 'unavailable';

export interface VehicleDriverRef {
  id: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface VehicleDriverProfileRef {
  id: string;
}

export interface VehicleCategoryRef {
  id: string;
  name: string;
}

export interface VehicleServiceClassRef {
  id: string;
  name: string;
}

export interface VehicleTypeRef {
  id: string;
  name: string;
  category?: VehicleCategoryRef | null;
  serviceClasses?: VehicleServiceClassRef[];
}

export interface Vehicle {
  id: string;

  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color?: string | null;
  capacity: number;

  isActive: boolean;
  status: VehicleStatus;

  driverId?: string | null;
  driverName?: string | null;
  driverProfileId?: string | null;

  vehicleTypeId?: string | null;
  vehicleTypeName?: string | null;

  categoryId?: string | null;
  categoryName?: string | null;

  serviceClassIds?: string[];
  serviceClassNames?: string[];

  driver?: VehicleDriverRef | null;
  driverProfile?: VehicleDriverProfileRef | null;
  vehicleType?: VehicleTypeRef | null;

  inspectionDate?: string | null;
  lastMaintenanceDate?: string | null;
  mileage?: number | null;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface VehiclesQuery extends PaginationQuery {
  search?: string;
  categoryId?: string | null;
  serviceClassId?: string | null;
  vehicleTypeId?: string | null;
  status?: VehicleStatus | null;
  isActive?: boolean | null;
}

export interface UpdateVehiclePayload {
  vehicleTypeId?: string;
  make?: string;
  model?: string;
  year?: number;
  plateNumber?: string;
  color?: string;
  capacity?: number;
  isActive?: boolean;
  status?: VehicleStatus;
  inspectionDate?: string;
  lastMaintenanceDate?: string;
  mileage?: number;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface VehicleTypeOption {
  id: string;
  name: string;
  isActive: boolean;
  categoryId?: string | null;
  categoryName?: string | null;
  serviceClassIds?: string[];
  serviceClassNames?: string[];

  category?: VehicleCategoryRef | null;
  serviceClasses?: VehicleServiceClassRef[];
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
