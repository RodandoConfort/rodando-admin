import { PaginationMeta } from '../../../core/api/pagination.model';

export type AdminTripStatus =
  | 'pending'
  | 'assigning'
  | 'accepted'
  | 'arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_drivers_found';

export type AdminTripPaymentMode = 'cash' | 'card' | 'wallet';

export interface AdminTripPoint {
  lat: number;
  lng: number;
}

export interface AdminTripStop {
  seq: number;
  point: AdminTripPoint;
  address?: string | null;
  placeId?: string | null;
  notes?: string | null;
  plannedArrivalAt?: string | null;
  arrivedAt?: string | null;
  completedAt?: string | null;
}

export interface AdminTrip {
  id: string;

  passengerId: string;
  passengerName?: string | null;
  passengerPhone?: string | null;

  driverId?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;

  vehicleId?: string | null;
  vehiclePlateNumber?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleColor?: string | null;

  orderId?: string | null;

  currentStatus: AdminTripStatus;
  paymentMode: AdminTripPaymentMode;

  requestedVehicleCategoryId?: string | null;
  requestedVehicleCategoryName?: string | null;
  requestedServiceClassId?: string | null;
  requestedServiceClassName?: string | null;

  pickupPoint: AdminTripPoint;
  pickupAddress?: string | null;
  destinationPoint?: AdminTripPoint | null;
  destinationAddress?: string | null;
  stops: AdminTripStop[];

  fareEstimatedTotal?: number | null;
  fareFinalCurrency?: string | null;
  fareDistanceKm?: number | null;
  fareDurationMin?: number | null;
  fareSurgeMultiplier?: number | null;
  fareTotal?: number | null;
  fareBreakdown?: Record<string, unknown> | null;

  requestedAt: string;
  acceptedAt?: string | null;
  pickupEtaAt?: string | null;
  arrivedPickupAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  canceledAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface AdminOverrideTripStatusPayload {
  targetStatus: AdminTripStatus;
  reason: string;
  internalNote?: string | null;
  actualDistanceKm?: number | null;
  actualDurationMin?: number | null;
  fareTotal?: number | null;
}

export type AdminTripWarningCode =
  | 'pending_too_long'
  | 'assigning_too_long'
  | 'accepted_too_long'
  | 'arriving_too_long'
  | 'in_progress_too_long'
  | 'admin_attention';

export interface AdminTripWarning {
  code: AdminTripWarningCode;
  label: string;
  description: string;
  tone: 'warning' | 'danger';
}

export interface AdminTripsQuery {
  page: number;
  limit: number;

  search?: string | null;
  passengerId?: string | null;
  driverId?: string | null;
  vehicleId?: string | null;

  status?: AdminTripStatus | null;
  paymentMode?: AdminTripPaymentMode | null;

  requestedFrom?: string | null;
  requestedTo?: string | null;

  onlyActive?: boolean | null;
  onlyStuck?: boolean | null;
}

export interface AdminTripEvent {
  id: string;
  eventType: string;
  occurredAt: string | null;
  metadata: Record<string, unknown> | null;
}

export interface AdminRetryMatchingPayload {
  reason: string;
  searchRadiusMeters?: number;
  maxCandidates?: number;
  offerTtlSeconds?: number;
}

export interface AdminMarkNoDriversPayload {
  reason: string;
  internalNote?: string | null;
}

export interface AdminCancelTripPayload {
  reason: string;
  internalNote?: string | null;
}

export type AdminTripMessageTarget = 'passenger' | 'driver' | 'both';

export interface AdminSendTripMessagePayload {
  target: AdminTripMessageTarget;
  message: string;
}

export interface AdminTripsState {
  trips: AdminTrip[];
  selectedTrip: AdminTrip | null;
  events: AdminTripEvent[];

  query: AdminTripsQuery;
  pagination: PaginationMeta;

  listLoading: boolean;
  listError: string | null;

  detailLoading: boolean;
  detailError: string | null;

  eventsLoading: boolean;
  eventsError: string | null;

  actionLoading: boolean;
  actionError: string | null;
  actionSuccess: string | null;

  realtimeStatus: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  realtimeLastEvent: string | null;
  realtimeError: string | null;

  processingTripId: string | null;
}
