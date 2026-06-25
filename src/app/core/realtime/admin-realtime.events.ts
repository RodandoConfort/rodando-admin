export const ADMIN_REALTIME_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  TRIP_REQUESTED: 'trip:requested',
  TRIP_ASSIGNING_STARTED: 'trip:assigning_started',
  TRIP_ASSIGNMENT_OFFERED: 'trip:assignment:offered',
  TRIP_ASSIGNMENT_ACCEPTED: 'trip:assignment:accepted',
  TRIP_DRIVER_ASSIGNED: 'trip:driver_assigned',
  TRIP_NO_DRIVERS_FOUND: 'trip:no_drivers_found',
  TRIP_DRIVER_EN_ROUTE: 'trip:driver_en_route',
  TRIP_DRIVER_ARRIVED_PICKUP: 'trip:driver_arrived_pickup',
  TRIP_WAITING_SURCHARGE_APPLIED: 'trip:waiting_surcharge_applied',
  TRIP_STARTED: 'trip:started',
  TRIP_COMPLETED: 'trip:completed',
  TRIP_CANCELLED: 'trip:cancelled',

  ADMIN_TRIP_ACTION_ISSUED: 'admin:trip:action_issued',
  ADMIN_TRIP_MESSAGE_SENT: 'admin:trip:message_sent',
} as const;

export type AdminRealtimeEventName =
  typeof ADMIN_REALTIME_EVENTS[keyof typeof ADMIN_REALTIME_EVENTS];

export type AdminRealtimeConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface AdminRealtimeBasePayload {
  at?: string;
  tripId?: string;
}

export interface AdminTripRealtimePayload extends AdminRealtimeBasePayload {
  passengerId?: string | null;
  driverId?: string | null;
  vehicleId?: string | null;
  status?: string;
  currentStatus?: string;
  reason?: string | null;
  message?: string | null;
  [key: string]: unknown;
}
