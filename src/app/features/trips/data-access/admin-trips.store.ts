import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { Subscription, finalize } from 'rxjs';

import { AdminTripsHttp } from './admin-trips-http.service';
import {
  AdminCancelTripPayload,
  AdminMarkNoDriversPayload,
  AdminOverrideTripStatusPayload,
  AdminRetryMatchingPayload,
  AdminSendTripMessagePayload,
  AdminTrip,
  AdminTripEvent,
  AdminTripsQuery,
  AdminTripsState,
  AdminTripWarning,
} from './admin-trips.models';

import { PaginationMeta } from '../../../core/api/pagination.model';
import { AdminRealtimeService } from '../../../core/realtime/admin-realtime.service';
import { AuthStore } from '../../../core/auth/auth.store';
import {
  ADMIN_REALTIME_EVENTS,
  AdminTripRealtimePayload,
} from '../../../core/realtime/admin-realtime.events';

const DEFAULT_PAGINATION: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  pageCount: 0,
  hasNext: false,
  hasPrev: false,
  nextPage: null,
  prevPage: null,
};

const DEFAULT_QUERY: AdminTripsQuery = {
  page: 1,
  limit: 10,
  search: null,
  status: null,
  paymentMode: null,
  passengerId: null,
  driverId: null,
  vehicleId: null,
  requestedFrom: null,
  requestedTo: null,
  onlyActive: true,
  onlyStuck: null,
};

const initialState: AdminTripsState = {
  trips: [],
  selectedTrip: null,
  events: [],

  query: DEFAULT_QUERY,
  pagination: DEFAULT_PAGINATION,

  listLoading: false,
  listError: null,

  detailLoading: false,
  detailError: null,

  eventsLoading: false,
  eventsError: null,

  actionLoading: false,
  actionError: null,
  actionSuccess: null,

  realtimeStatus: 'idle',
  realtimeLastEvent: null,
  realtimeError: null,

  processingTripId: null,
};

@Injectable()
export class AdminTripsStore {
  private readonly http = inject(AdminTripsHttp);
  private readonly realtime = inject(AdminRealtimeService);
  private readonly authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);

  private readonly state = signal<AdminTripsState>(initialState);
  private readonly realtimeEnabled = signal(false);
  private readonly watchedTripId = signal<string | null>(null);

  private realtimeSubscriptions: Subscription[] = [];

  readonly trips = computed(() => this.state().trips);
  readonly selectedTrip = computed(() => this.state().selectedTrip);
  readonly events = computed(() => this.state().events);

  readonly query = computed(() => this.state().query);
  readonly pagination = computed(() => this.state().pagination);

  readonly listLoading = computed(() => this.state().listLoading);
  readonly listError = computed(() => this.state().listError);

  readonly detailLoading = computed(() => this.state().detailLoading);
  readonly detailError = computed(() => this.state().detailError);

  readonly eventsLoading = computed(() => this.state().eventsLoading);
  readonly eventsError = computed(() => this.state().eventsError);

  readonly actionLoading = computed(() => this.state().actionLoading);
  readonly actionError = computed(() => this.state().actionError);
  readonly actionSuccess = computed(() => this.state().actionSuccess);

  readonly realtimeStatus = computed(() => this.state().realtimeStatus);
  readonly realtimeLastEvent = computed(() => this.state().realtimeLastEvent);
  readonly realtimeError = computed(() => this.state().realtimeError);

  readonly processingTripId = computed(() => this.state().processingTripId);

  readonly activeTripsCount = computed(
    () =>
      this.trips().filter((trip) =>
        ['pending', 'assigning', 'accepted', 'arriving', 'in_progress'].includes(
          trip.currentStatus,
        ),
      ).length,
  );

  readonly attentionTripsCount = computed(
    () => this.trips().filter((trip) => this.requiresAdminAttention(trip)).length,
  );

  private readonly realtimeConnectionEffect = effect(() => {
    if (!this.realtimeEnabled()) {
      return;
    }

    const token = this.authStore.accessToken();

    if (!token) {
      this.patchState({
        realtimeStatus: 'error',
        realtimeError: 'No hay token de autenticación para conectar WS.',
      });

      this.disconnectRealtime();
      return;
    }

    this.connectRealtime(token);
  });

  readonly warningTripsCount = computed(
    () => this.trips().filter((trip) => this.getTripWarning(trip) !== null).length,
  );

  getTripWarning(trip: AdminTrip): AdminTripWarning | null {
    const now = Date.now();

    const minutesSince = (iso?: string | null) => {
      if (!iso) {
        return 0;
      }

      const time = new Date(iso).getTime();

      if (!Number.isFinite(time)) {
        return 0;
      }

      return Math.floor((now - time) / 60000);
    };

    const fareBreakdown = trip.fareBreakdown as
      | {
          admin_attention?: boolean;
          requires_admin_attention?: boolean;
          admin_incident?: {
            status?: string;
          };
        }
      | null
      | undefined;

    if (
      fareBreakdown?.admin_attention === true ||
      fareBreakdown?.requires_admin_attention === true ||
      fareBreakdown?.admin_incident?.status === 'open'
    ) {
      return {
        code: 'admin_attention',
        label: 'Requiere atención',
        description: 'Este viaje fue marcado para revisión administrativa.',
        tone: 'danger',
      };
    }

    if (trip.currentStatus === 'pending' && minutesSince(trip.requestedAt) >= 2) {
      return {
        code: 'pending_too_long',
        label: 'Pendiente prolongado',
        description: 'El viaje lleva más de 2 minutos pendiente.',
        tone: 'warning',
      };
    }

    if (trip.currentStatus === 'assigning' && minutesSince(trip.requestedAt) >= 3) {
      return {
        code: 'assigning_too_long',
        label: 'Matching prolongado',
        description: 'El viaje lleva más de 3 minutos buscando conductor.',
        tone: 'warning',
      };
    }

    if (
      trip.currentStatus === 'accepted' &&
      minutesSince(trip.acceptedAt ?? trip.requestedAt) >= 10
    ) {
      return {
        code: 'accepted_too_long',
        label: 'Aceptado sin avance',
        description: 'El driver aceptó, pero el viaje no avanza.',
        tone: 'warning',
      };
    }

    if (
      trip.currentStatus === 'arriving' &&
      minutesSince(trip.pickupEtaAt ?? trip.acceptedAt ?? trip.requestedAt) >= 20
    ) {
      return {
        code: 'arriving_too_long',
        label: 'Llegada prolongada',
        description: 'El driver lleva demasiado tiempo en camino.',
        tone: 'warning',
      };
    }

    if (
      trip.currentStatus === 'in_progress' &&
      minutesSince(trip.startedAt ?? trip.requestedAt) >= 180
    ) {
      return {
        code: 'in_progress_too_long',
        label: 'Viaje prolongado',
        description: 'El viaje lleva más de 3 horas en progreso.',
        tone: 'danger',
      };
    }

    return null;
  }

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disconnectRealtime();
    });
  }

  enterMonitor(): void {
    this.loadTrips();
    this.realtimeEnabled.set(true);
  }

  leaveMonitor(): void {
    this.realtimeEnabled.set(false);
    this.disconnectRealtime();
  }

  reloadTrips(): void {
    this.loadTrips();
  }

  setSearch(search: string): void {
    this.patchQuery({
      search,
      page: 1,
    });

    this.loadTrips();
  }

  setStatusFilter(status: AdminTripsQuery['status']): void {
    this.patchQuery({
      status,
      page: 1,
    });

    this.loadTrips();
  }

  setOnlyStuckFilter(onlyStuck: boolean | null): void {
    this.patchQuery({
      onlyStuck,
      page: 1,
    });

    this.loadTrips();
  }

  setPage(page: number, limit: number): void {
    this.patchQuery({
      page,
      limit,
    });

    this.loadTrips();
  }

  loadTripDetail(id: string): void {
    this.patchState({
      detailLoading: true,
      detailError: null,
    });

    this.http
      .getTripById(id)
      .pipe(
        finalize(() => {
          this.patchState({ detailLoading: false });
        }),
      )
      .subscribe({
        next: (trip) => {
          this.patchState({
            selectedTrip: trip,
          });

          this.upsertTrip(trip);
        },
        error: (error) => {
          this.patchState({
            detailError: this.toErrorMessage(error),
          });
        },
      });
  }

  loadTripEvents(id: string): void {
    this.patchState({
      eventsLoading: true,
      eventsError: null,
    });

    this.http
      .getTripEvents(id)
      .pipe(
        finalize(() => {
          this.patchState({ eventsLoading: false });
        }),
      )
      .subscribe({
        next: (events) => {
          this.patchState({
            events,
          });
        },
        error: (error) => {
          this.patchState({
            eventsError: this.toErrorMessage(error),
          });
        },
      });
  }

  watchTrip(id: string): void {
    const previousTripId = this.watchedTripId();

    if (previousTripId && previousTripId !== id) {
      this.realtime.leaveTripRoom(previousTripId);
    }

    this.watchedTripId.set(id);
    this.realtime.joinTripRoom(id);
  }

  unwatchTrip(): void {
    const tripId = this.watchedTripId();

    if (tripId) {
      this.realtime.leaveTripRoom(tripId);
    }

    this.watchedTripId.set(null);
  }

  retryMatching(tripId: string, payload: AdminRetryMatchingPayload): void {
    this.runTripAction(
      tripId,
      () => this.http.retryMatching(tripId, payload),
      'Reintento de matching ejecutado.',
    );
  }

  markNoDrivers(tripId: string, payload: AdminMarkNoDriversPayload): void {
    this.runTripAction(
      tripId,
      () => this.http.markNoDrivers(tripId, payload),
      'Viaje marcado como sin conductores disponibles.',
    );
  }

  cancelTrip(tripId: string, payload: AdminCancelTripPayload): void {
    this.runTripAction(
      tripId,
      () => this.http.cancelTrip(tripId, payload),
      'Viaje cancelado por administración.',
    );
  }

  sendMessage(tripId: string, payload: AdminSendTripMessagePayload): void {
    this.patchState({
      actionLoading: true,
      actionError: null,
      actionSuccess: null,
      processingTripId: tripId,
    });

    this.http
      .sendMessage(tripId, payload)
      .pipe(
        finalize(() => {
          this.patchState({
            actionLoading: false,
            processingTripId: null,
          });
        }),
      )
      .subscribe({
        next: () => {
          this.patchState({
            actionSuccess: 'Mensaje enviado correctamente.',
          });

          this.loadTripEvents(tripId);
        },
        error: (error) => {
          this.patchState({
            actionError: this.toErrorMessage(error),
          });
        },
      });
  }

  clearActionState(): void {
    this.patchState({
      actionError: null,
      actionSuccess: null,
    });
  }

  private loadTrips(): void {
    this.patchState({
      listLoading: true,
      listError: null,
    });

    this.http
      .getTrips(this.query())
      .pipe(
        finalize(() => {
          this.patchState({ listLoading: false });
        }),
      )
      .subscribe({
        next: (result) => {
          this.patchState({
            trips: result.items,
            pagination: result.meta,
          });
        },
        error: (error) => {
          this.patchState({
            listError: this.toErrorMessage(error),
          });
        },
      });
  }

  private runTripAction(
    tripId: string,
    request: () => ReturnType<AdminTripsHttp['retryMatching']>,
    successMessage: string,
  ): void {
    this.patchState({
      actionLoading: true,
      actionError: null,
      actionSuccess: null,
      processingTripId: tripId,
    });

    request()
      .pipe(
        finalize(() => {
          this.patchState({
            actionLoading: false,
            processingTripId: null,
          });
        }),
      )
      .subscribe({
        next: (trip) => {
          this.patchState({
            selectedTrip: this.selectedTrip()?.id === trip.id ? trip : this.selectedTrip(),
            actionSuccess: successMessage,
          });

          this.upsertTrip(trip);
          this.loadTripEvents(tripId);
        },
        error: (error) => {
          this.patchState({
            actionError: this.toErrorMessage(error),
          });
        },
      });
  }

  private connectRealtime(token: string): void {
    this.clearRealtimeSubscriptions();

    this.patchState({
      realtimeStatus: 'connecting',
      realtimeError: null,
    });

    this.realtime.connect(token);

    this.realtimeSubscriptions.push(
      this.realtime.connectionStatusChanges().subscribe((status) => {
        this.patchState({
          realtimeStatus: status,
          realtimeError:
            status === 'error' ? 'No se pudo conectar al canal realtime de administración.' : null,
        });
      }),
    );

    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_REQUESTED);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_ASSIGNING_STARTED);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_ASSIGNMENT_OFFERED);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_ASSIGNMENT_ACCEPTED);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_DRIVER_ASSIGNED);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_NO_DRIVERS_FOUND);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_DRIVER_EN_ROUTE);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_DRIVER_ARRIVED_PICKUP);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_WAITING_SURCHARGE_APPLIED);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_STARTED);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_COMPLETED);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.TRIP_CANCELLED);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.ADMIN_TRIP_ACTION_ISSUED);
    this.bindRealtimeEvent(ADMIN_REALTIME_EVENTS.ADMIN_TRIP_MESSAGE_SENT);
  }

  private bindRealtimeEvent(eventName: string): void {
    this.realtimeSubscriptions.push(
      this.realtime.on<AdminTripRealtimePayload>(eventName as never).subscribe((payload) => {
        this.handleRealtimePayload(eventName, payload);
      }),
    );
  }

  private requiresAdminAttention(trip: AdminTrip): boolean {
    const fareBreakdown = trip.fareBreakdown as
      | {
          admin_attention?: boolean;
          requires_admin_attention?: boolean;
          admin_incident?: {
            status?: string;
          };
        }
      | null
      | undefined;

    return (
      fareBreakdown?.admin_attention === true ||
      fareBreakdown?.requires_admin_attention === true ||
      fareBreakdown?.admin_incident?.status === 'open'
    );
  }

  private handleRealtimePayload(eventName: string, payload: AdminTripRealtimePayload): void {
    this.patchState({
      realtimeLastEvent: eventName,
    });

    const tripId = payload.tripId;

    if (!tripId) {
      this.loadTrips();
      return;
    }

    const selectedTrip = this.selectedTrip();

    if (selectedTrip?.id === tripId) {
      this.loadTripDetail(tripId);
      this.loadTripEvents(tripId);
    }

    this.loadTrips();
  }

  private disconnectRealtime(): void {
    this.clearRealtimeSubscriptions();

    const watchedTripId = this.watchedTripId();

    if (watchedTripId) {
      this.realtime.leaveTripRoom(watchedTripId);
      this.watchedTripId.set(null);
    }

    this.realtime.disconnect();

    this.patchState({
      realtimeStatus: 'disconnected',
    });
  }

  private clearRealtimeSubscriptions(): void {
    for (const subscription of this.realtimeSubscriptions) {
      subscription.unsubscribe();
    }

    this.realtimeSubscriptions = [];
  }

  private upsertTrip(trip: AdminTrip): void {
    this.state.update((state) => {
      const exists = state.trips.some((item) => item.id === trip.id);

      return {
        ...state,
        trips: exists
          ? state.trips.map((item) => (item.id === trip.id ? trip : item))
          : [trip, ...state.trips],
      };
    });
  }

  overrideStatus(tripId: string, payload: AdminOverrideTripStatusPayload): void {
    this.runTripAction(
      tripId,
      () => this.http.overrideStatus(tripId, payload),
      'Estado del viaje actualizado por administración.',
    );
  }

  private patchQuery(partial: Partial<AdminTripsQuery>): void {
    this.state.update((state) => ({
      ...state,
      query: {
        ...state.query,
        ...partial,
      },
    }));
  }

  private patchState(partial: Partial<AdminTripsState>): void {
    this.state.update((state) => ({
      ...state,
      ...partial,
    }));
  }

  private toErrorMessage(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }

    return 'Ocurrió un error inesperado.';
  }
}
