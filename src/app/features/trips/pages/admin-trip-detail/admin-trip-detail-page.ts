import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
} from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { PageLoader } from '../../../../shared/feedback/page-loader/page-loader';
import { AdminTripActionsPanel } from '../../components/admin-trip-actions-panel';
import { AdminTripsStore } from '../../data-access/admin-trips.store';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import {
  AdminOverrideTripStatusPayload,
  AdminSendTripMessagePayload,
  AdminTrip,
  AdminTripStatus,
  AdminTripStop,
} from '../../data-access/admin-trips.models';

type TripWarning = {
  label: string;
  description: string;
  tone: 'warning' | 'danger';
};

@Component({
  selector: 'app-admin-trip-detail-page',
  standalone: true,
  imports: [
    DatePipe,
    JsonPipe,
    MatIconModule,
    MatButtonModule,
    EntityPageCard,
    PageLoader,
    AdminTripActionsPanel,
  ],
  templateUrl: './admin-trip-detail-page.html',
  styleUrl: './admin-trip-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTripDetailPage {
  readonly store = inject(AdminTripsStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly tripId = computed(() => this.paramMap().get('id'));

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'back',
      label: 'Volver',
      icon: 'arrow_back',
      placement: 'header',
      variant: 'text',
      tone: 'neutral',
    },
    {
      key: 'refresh',
      label: 'Actualizar',
      icon: 'refresh',
      placement: 'header',
      variant: 'text',
      tone: 'neutral',
    },
  ]);

  readonly tripWarning = computed(() => {
    const trip = this.store.selectedTrip();

    return trip ? this.getTripWarning(trip) : null;
  });

  private readonly loadTripEffect = effect(() => {
    const id = this.tripId();

    if (!id) {
      return;
    }

    this.store.enterMonitor();
    this.store.loadTripDetail(id);
    this.store.loadTripEvents(id);
    this.store.watchTrip(id);
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.store.unwatchTrip();
    });
  }

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
      return;
    }

    if (actionKey === 'refresh') {
      this.reloadDetail();
    }
  }

  reloadDetail(): void {
    const id = this.tripId();

    if (!id) {
      return;
    }

    this.store.loadTripDetail(id);
    this.store.loadTripEvents(id);
  }

  reloadTimeline(): void {
    const id = this.tripId();

    if (!id) {
      return;
    }

    this.store.loadTripEvents(id);
  }

  hasDestination(trip: AdminTrip): boolean {
  if (!['completed', 'cancelled'].includes(trip.currentStatus)) {
    return false;
  }

  const directDestination = trip.destinationAddress?.trim();

  if (directDestination) {
    return true;
  }

  const lastStop = this.lastStop(trip);

  return Boolean(lastStop?.address?.trim());
}

destinationLabel(trip: AdminTrip): string {
  const directDestination = trip.destinationAddress?.trim();

  if (directDestination) {
    return directDestination;
  }

  const lastStop = this.lastStop(trip);

  return lastStop?.address?.trim() || 'Destino no registrado';
}

private lastStop(trip: AdminTrip): AdminTripStop | null {
  if (!Array.isArray(trip.stops) || trip.stops.length === 0) {
    return null;
  }

  return [...trip.stops].sort(
    (a, b) => Number(a.seq ?? 0) - Number(b.seq ?? 0),
  )[trip.stops.length - 1];
}

  goBack(): void {
    this.store.unwatchTrip();

    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  }

  handleOverrideStatus(tripId: string, payload: AdminOverrideTripStatusPayload): void {
    this.store.overrideStatus(tripId, payload);
  }

  handleSendMessage(tripId: string, payload: AdminSendTripMessagePayload): void {
    this.store.sendMessage(tripId, payload);
  }

  statusLabel(status: AdminTripStatus): string {
    const labels: Record<AdminTripStatus, string> = {
      pending: 'Pendiente',
      assigning: 'Buscando conductor',
      accepted: 'Aceptado',
      arriving: 'Driver en camino',
      in_progress: 'En viaje',
      completed: 'Completado',
      cancelled: 'Cancelado',
      no_drivers_found: 'Sin conductores',
    };

    return labels[status] ?? status;
  }

  paymentModeLabel(paymentMode: string): string {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      wallet: 'Billetera',
    };

    return labels[paymentMode] ?? paymentMode;
  }

  eventLabel(eventType: string): string {
    return eventType
      .replaceAll('_', ' ')
      .replaceAll('.', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  moneyLabel(value?: number | null, currency?: string | null): string {
    if (value === null || value === undefined) {
      return '—';
    }

    return `${value} ${currency ?? ''}`.trim();
  }

  vehicleLabel(trip: AdminTrip): string {
    const vehicle = [trip.vehicleMake, trip.vehicleModel].filter(Boolean).join(' ');

    if (vehicle) {
      return vehicle;
    }

    if (trip.vehiclePlateNumber) {
      return trip.vehiclePlateNumber;
    }

    return 'Sin vehículo asignado';
  }

  stopsCount(trip: AdminTrip): number {
    return Array.isArray(trip.stops) ? trip.stops.length : 0;
  }

  isSuccessStatus(status: AdminTripStatus): boolean {
    return ['accepted', 'completed'].includes(status);
  }

  isWarningStatus(status: AdminTripStatus): boolean {
    return ['pending', 'assigning', 'no_drivers_found'].includes(status);
  }

  isDangerStatus(status: AdminTripStatus): boolean {
    return status === 'cancelled';
  }

  isInfoStatus(status: AdminTripStatus): boolean {
    return ['arriving', 'in_progress'].includes(status);
  }

  private getTripWarning(trip: AdminTrip): TripWarning | null {
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
        label: 'Requiere atención administrativa',
        description: 'Este viaje fue marcado para revisión por soporte.',
        tone: 'danger',
      };
    }

    if (trip.currentStatus === 'pending' && this.minutesSince(trip.requestedAt) >= 2) {
      return {
        label: 'Pendiente prolongado',
        description: 'El viaje lleva demasiado tiempo pendiente.',
        tone: 'warning',
      };
    }

    if (trip.currentStatus === 'assigning' && this.minutesSince(trip.requestedAt) >= 3) {
      return {
        label: 'Matching prolongado',
        description: 'El viaje lleva demasiado tiempo buscando conductor.',
        tone: 'warning',
      };
    }

    if (
      trip.currentStatus === 'accepted' &&
      this.minutesSince(trip.acceptedAt ?? trip.requestedAt) >= 10
    ) {
      return {
        label: 'Aceptado sin avance',
        description: 'El driver aceptó, pero el viaje no ha avanzado.',
        tone: 'warning',
      };
    }

    if (
      trip.currentStatus === 'arriving' &&
      this.minutesSince(trip.pickupEtaAt ?? trip.acceptedAt ?? trip.requestedAt) >= 20
    ) {
      return {
        label: 'Llegada prolongada',
        description: 'El driver lleva demasiado tiempo en camino al punto de recogida.',
        tone: 'warning',
      };
    }

    if (
      trip.currentStatus === 'in_progress' &&
      this.minutesSince(trip.startedAt ?? trip.requestedAt) >= 180
    ) {
      return {
        label: 'Viaje prolongado',
        description: 'El viaje lleva más de 3 horas en progreso.',
        tone: 'danger',
      };
    }

    return null;
  }

  private minutesSince(iso?: string | null): number {
    if (!iso) {
      return 0;
    }

    const timestamp = new Date(iso).getTime();

    if (!Number.isFinite(timestamp)) {
      return 0;
    }

    return Math.floor((Date.now() - timestamp) / 60000);
  }
}
