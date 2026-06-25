import { PaginationMeta } from '../../../core/api/pagination.model';
import { DataTableConfig, TableBadgeTone } from '../../../shared/table/table.types';
import { AdminTrip, AdminTripsQuery, AdminTripStatus } from '../data-access/admin-trips.models';

function statusLabel(status: AdminTripStatus): string {
  const labels: Record<AdminTripStatus, string> = {
    pending: 'Pendiente',
    assigning: 'Buscando',
    accepted: 'Aceptado',
    arriving: 'En camino',
    in_progress: 'En viaje',
    completed: 'Completado',
    cancelled: 'Cancelado',
    no_drivers_found: 'Sin conductores',
  };

  return labels[status];
}

function statusTone(status: AdminTripStatus): TableBadgeTone {
  const tones: Record<AdminTripStatus, TableBadgeTone> = {
    pending: 'warning',
    assigning: 'info',
    accepted: 'success',
    arriving: 'info',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'danger',
    no_drivers_found: 'warning',
  };

  return tones[status];
}

function canRetryMatching(trip: AdminTrip): boolean {
  return ['pending', 'assigning', 'no_drivers_found'].includes(trip.currentStatus);
}

function canCancel(trip: AdminTrip): boolean {
  return ['pending', 'assigning', 'accepted', 'arriving', 'in_progress'].includes(
    trip.currentStatus,
  );
}

export function buildAdminTripsTableConfig(
  query: AdminTripsQuery,
  pagination: PaginationMeta,
  processingTripId: string | null,
): DataTableConfig<AdminTrip> {
  const hasActiveCriteria = Boolean(
    query.search?.trim() || query.status || query.onlyStuck || query.onlyActive === false,
  );

  return {
    columns: [
      {
        key: 'currentStatus',
        label: 'Estado',
        type: 'badge',
        value: (trip) => trip.currentStatus,
        badge: {
          label: (value) => statusLabel(value as AdminTripStatus),
          tone: (value) => statusTone(value as AdminTripStatus),
        },
      },
      {
        key: 'warning',
        label: 'Advertencia',
        type: 'badge',
        value: (trip) => {
          const warning = getTripWarningForTable(trip);

          return warning?.label ?? 'Normal';
        },
        badge: {
          label: (value) => String(value),
          tone: (_value, trip) => {
            const warning = getTripWarningForTable(trip);

            return warning?.tone ?? 'neutral';
          },
        },
      },
      {
        key: 'passengerName',
        label: 'Pasajero',
        value: (trip) => trip.passengerName ?? trip.passengerId,
      },
      {
        key: 'driver',
        label: 'Driver',
        value: (trip) => trip.driverName ?? 'Sin asignar',
      },
      {
        key: 'pickupAddress',
        label: 'Origen',
        value: (trip) => trip.pickupAddress ?? 'Sin dirección',
      },
      {
        key: 'fareEstimatedTotal',
        label: 'Estimado',
        value: (trip) =>
          trip.fareEstimatedTotal != null
            ? `${trip.fareEstimatedTotal} ${trip.fareFinalCurrency ?? ''}`
            : '—',
      },
      {
        key: 'requestedAt',
        label: 'Solicitado',
        type: 'date',
        value: (trip) => trip.requestedAt,
        dateFormat: 'dd/MM/yyyy HH:mm',
      },
    ],

    actions: [
      {
        key: 'detail',
        label: 'Ver detalle',
        icon: 'visibility',
        color: 'primary',
      },
      {
        key: 'retry_matching',
        label: 'Reintentar matching',
        icon: 'sync',
        color: 'primary',
        disabled: (trip) => !canRetryMatching(trip) || processingTripId === trip.id,
      },
      // {
      //   key: 'cancel',
      //   label: 'Cancelar',
      //   icon: 'cancel',
      //   color: 'danger',
      //   disabled: (trip) => !canCancel(trip) || processingTripId === trip.id,
      // },
    ],

    trackBy: (trip) => trip.id,

    toolbar: {
      search: {
        value: query.search ?? '',
        placeholder: 'Buscar por pasajero, driver, dirección...',
        ariaLabel: 'Buscar viajes',
        clearAriaLabel: 'Limpiar búsqueda de viajes',
      },
      filters: [
        {
          key: 'status',
          label: 'Estado',
          placeholder: 'Todos',
          value: query.status ?? null,
          options: [
            { label: 'Todos', value: null },
            { label: 'Pendiente', value: 'pending' },
            { label: 'Buscando', value: 'assigning' },
            { label: 'Aceptado', value: 'accepted' },
            { label: 'En camino', value: 'arriving' },
            { label: 'En viaje', value: 'in_progress' },
            { label: 'Sin conductores', value: 'no_drivers_found' },
            { label: 'Completado', value: 'completed' },
            { label: 'Cancelado', value: 'cancelled' },
          ],
        },
      ],
    },

    pagination: {
      length: pagination.total,
      pageIndex: Math.max(0, pagination.page - 1),
      pageSize: pagination.limit,
      pageSizeOptions: [10, 25, 50],
      showFirstLastButtons: true,
    },

    emptyTitle: hasActiveCriteria ? 'No hay viajes que coincidan' : 'No hay viajes registrados',

    emptyDescription: hasActiveCriteria
      ? 'Ajusta la búsqueda o los filtros para volver a ver resultados.'
      : 'Cuando los pasajeros soliciten viajes, aparecerán aquí en tiempo real.',

    loadingRows: 8,
  };
}

function minutesSince(iso?: string | null): number {
  if (!iso) {
    return 0;
  }

  const time = new Date(iso).getTime();

  if (!Number.isFinite(time)) {
    return 0;
  }

  return Math.floor((Date.now() - time) / 60000);
}

function getTripWarningForTable(trip: AdminTrip): {
  label: string;
  tone: 'warning' | 'danger';
} | null {
  const fareBreakdown = trip.fareBreakdown as any;

  if (
    fareBreakdown?.admin_attention === true ||
    fareBreakdown?.requires_admin_attention === true ||
    fareBreakdown?.admin_incident?.status === 'open'
  ) {
    return {
      label: 'Atención',
      tone: 'danger',
    };
  }

  if (trip.currentStatus === 'pending' && minutesSince(trip.requestedAt) >= 2) {
    return {
      label: 'Pendiente prolongado',
      tone: 'warning',
    };
  }

  if (trip.currentStatus === 'assigning' && minutesSince(trip.requestedAt) >= 3) {
    return {
      label: 'Matching prolongado',
      tone: 'warning',
    };
  }

  if (
    trip.currentStatus === 'accepted' &&
    minutesSince(trip.acceptedAt ?? trip.requestedAt) >= 10
  ) {
    return {
      label: 'Sin avance',
      tone: 'warning',
    };
  }

  if (
    trip.currentStatus === 'arriving' &&
    minutesSince(trip.pickupEtaAt ?? trip.acceptedAt ?? trip.requestedAt) >= 20
  ) {
    return {
      label: 'Llegada prolongada',
      tone: 'warning',
    };
  }

  if (
    trip.currentStatus === 'in_progress' &&
    minutesSince(trip.startedAt ?? trip.requestedAt) >= 180
  ) {
    return {
      label: 'Viaje prolongado',
      tone: 'danger',
    };
  }

  return null;
}
