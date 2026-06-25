import { PaginationQuery } from '../../../core/api/pagination.model';

export type DriverWalletStatus = 'active' | 'blocked';
export type WalletMovementDirection = 'credit' | 'debit' | 'zero';

export interface DriverWallet {
  id: string;
  driverId: string;

  currentWalletBalance: number;
  heldWalletBalance: number;
  totalEarnedFromTrips: number;

  currency: string;
  status: DriverWalletStatus;

  lastPayoutAt?: string | null;
  minPayoutThreshold: number;
  payoutMethodId?: string | null;

  blockedAt?: string | null;
  blockedReason?: string | null;
  unblockedAt?: string | null;
  unblockedBy?: string | null;

  allowedNegativeLimit?: number | null;

  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletMovement {
  id: string;
  walletId: string;
  transactionId?: string | null;

  amount: number;
  direction: WalletMovementDirection;

  previousBalance: number;
  newBalance: number;

  note?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface WalletMovementsQuery extends PaginationQuery {
  search?: string;
  transactionId?: string | null;
  from?: string | null;
  to?: string | null;
  amountMin?: string | null;
  amountMax?: string | null;
  sortBy?: 'createdAt' | 'amount';
  sortDir?: 'asc' | 'desc';
}

export interface AdminDriverWalletTopupPayload {
  collectionPointId: string;
  collectedByUserId: string;
  amount: string;
  currency?: string;
  reason?: string;
  notes?: string;
  externalReference?: string;
  metadata?: Record<string, unknown>;
}

export interface AdminDriverWalletTopupResponse {
  driverId: string;
  walletId: string;
  cashCollectionRecordId: string;
  transactionId: string;
  walletMovementId: string;
  status: 'completed';
  currency: string;
  amount: string;
  previousBalance: string;
  newBalance: string;
}

export interface BlockDriverWalletPayload {
  reason?: string;
  comment?: string;
}

export interface UnblockDriverWalletPayload {
  reason?: string;
  comment?: string;
}

export interface WalletStatusResponse {
  driverId: string;
  previousStatus: DriverWalletStatus;
  status: DriverWalletStatus;
  changed: boolean;
  changedAt: string;
}

export interface DriverWalletSelectOption {
  label: string;
  value: string;
}

export interface DriverWalletCollectionPointOption {
  id: string;
  name: string;
  address?: string | null;
  isActive: boolean;
}

export interface DriverWalletAdminCollectorOption {
  id: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  userType: 'admin' | string;
  status: 'active' | string;
}
