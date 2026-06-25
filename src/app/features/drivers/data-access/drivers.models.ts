import { PaginationQuery } from '../../../core/api/pagination.model';
import { AdminUser } from '../../users/data-access/users.models';

export type BackgroundCheckStatus =
  | 'pending_background_check'
  | 'approved'
  | 'rejected';

export type DriverStatus =
  | 'active'
  | 'suspended'
  | 'on_vacation'
  | 'pending_docs'
  | 'deactivated';

export type VehicleStatus =
  | 'pending_review'
  | 'approved'
  | 'in_service'
  | 'rejected'
  | 'maintenance'
  | 'unavailable';

export interface EmergencyContactPayload {
  name: string;
  phoneNumber: string;
  relationship: string;
}

export interface CreateVehicleOnboardingPayload {
  vehicleTypeId: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color?: string;
  capacity?: number;
  isActive?: boolean;
  status?: VehicleStatus;
  inspectionDate?: string;
  lastMaintenanceDate?: string;
  mileage?: number;
}

export interface CreateDriverProfilePayload {
  userId: string;
  driverLicenseNumber: string;
  driverLicenseExpirationDate: string;
  driverLicensePictureUrl?: string;
  backgroundCheckStatus?: BackgroundCheckStatus;
  backgroundCheckDate?: string;
  isApproved?: boolean;
  emergencyContactInfo?: EmergencyContactPayload;
  driverStatus?: DriverStatus;
  paidPriorityUntil?: string;
  initialVehicle?: CreateVehicleOnboardingPayload;
}

export interface UpdateDriverProfilePayload {
  driverLicenseNumber?: string;
  driverLicenseExpirationDate?: string;
  driverLicensePictureUrl?: string;
  backgroundCheckStatus?: BackgroundCheckStatus;
  backgroundCheckDate?: string;
  isApproved?: boolean;
  emergencyContactInfo?: EmergencyContactPayload;
  driverStatus?: DriverStatus;
  paidPriorityUntil?: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  user?: AdminUser | null;

  driverLicenseNumber: string;
  driverLicenseExpirationDate: string;
  driverLicensePictureUrl?: string | null;

  backgroundCheckStatus: BackgroundCheckStatus;
  backgroundCheckDate?: string | null;
  isApproved: boolean;

  emergencyContactInfo?: EmergencyContactPayload | null;

  driverStatus: DriverStatus;
  paidPriorityUntil?: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface DriversQuery extends PaginationQuery {
  search?: string;
  backgroundCheckStatus?: BackgroundCheckStatus | null;
  driverStatus?: DriverStatus | null;
  isApproved?: boolean | null;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface VehicleTypeOption {
  id: string;
  name: string;
  isActive: boolean;
}
