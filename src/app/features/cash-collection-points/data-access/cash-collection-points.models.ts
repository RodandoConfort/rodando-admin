import { PaginationQuery } from '../../../core/api/pagination.model';

export interface CashCollectionPoint {
  id: string;
  name: string;
  address?: string | null;
  contactPhone?: string | null;
  location?: [number, number] | null; // [longitude, latitude]
  openingHours?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CashCollectionPointsQuery extends PaginationQuery {
  search?: string;
  isActive?: boolean | null;
}

export interface CreateCashCollectionPointPayload {
  name: string;
  address?: string | null;
  contactPhone?: string | null;
  location?: [number, number] | null;
  openingHours?: Record<string, unknown> | null;
  isActive?: boolean;
}

export type UpdateCashCollectionPointPayload =
  Partial<CreateCashCollectionPointPayload>;

export type CashCollectionRecordStatus = 'pending' | 'completed';

export interface CashCollectionRecord {
  id: string;

  driverId: string;
  driverName?: string | null;

  collectedByUserId: string;
  collectedByName?: string | null;

  collectionPointId: string;

  amount: number;
  currency: string;
  status: CashCollectionRecordStatus;

  transactionId: string;
  notes?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CashCollectionRecordsQuery extends PaginationQuery {
  search?: string;
  status?: CashCollectionRecordStatus | null;
  from?: string | null;
  to?: string | null;
  sortBy?: 'createdAt' | 'amount';
  sortDir?: 'asc' | 'desc';
}
