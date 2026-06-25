import { PaginationMeta } from '../../../core/api/pagination.model';
import {
  DataTableConfig,
  TableBadgeTone,
} from '../../../shared/table/table.types';

import {
  BackgroundCheckStatus,
  DriverProfile,
  DriversQuery,
  DriverStatus,
} from '../data-access/drivers.models';

function getBackgroundCheckLabel(status: BackgroundCheckStatus): string {
  const labels: Record<BackgroundCheckStatus, string> = {
    pending_background_check: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  };

  return labels[status] ?? status;
}

function getBackgroundCheckTone(status: BackgroundCheckStatus): TableBadgeTone {
  const tones: Record<BackgroundCheckStatus, TableBadgeTone> = {
    pending_background_check: 'warning',
    approved: 'success',
    rejected: 'danger',
  };

  return tones[status] ?? 'neutral';
}

function getDriverStatusLabel(status: DriverStatus): string {
  const labels: Record<DriverStatus, string> = {
    active: 'Activo',
    suspended: 'Suspendido',
    on_vacation: 'De vacaciones',
    pending_docs: 'Pendiente de documentos',
    deactivated: 'Desactivado',
  };

  return labels[status] ?? status;
}

function getDriverStatusTone(status: DriverStatus): TableBadgeTone {
  const tones: Record<DriverStatus, TableBadgeTone> = {
    active: 'success',
    suspended: 'danger',
    on_vacation: 'info',
    pending_docs: 'warning',
    deactivated: 'neutral',
  };

  return tones[status] ?? 'neutral';
}

function getUserName(profile: DriverProfile): string {
  return profile.user?.name ?? '—';
}

function getUserPhone(profile: DriverProfile): string {
  return profile.user?.phoneNumber ?? '—';
}

export function buildDriversTableConfig(
  query: DriversQuery,
  pagination: PaginationMeta,
  deletingDriverId: string | null,
): DataTableConfig<DriverProfile> {
  const hasActiveCriteria = Boolean(
    query.search?.trim() ||
      query.backgroundCheckStatus ||
      query.driverStatus ||
      (query.isApproved !== undefined && query.isApproved !== null),
  );

  return {
    columns: [
      {
        key: 'user',
        label: 'Conductor',
        value: (profile) => getUserName(profile),
      },
      {
        key: 'phone',
        label: 'Teléfono',
        value: (profile) => getUserPhone(profile),
      },
      {
        key: 'driverLicenseNumber',
        label: 'Licencia',
        value: (profile) => profile.driverLicenseNumber,
      },
      {
        key: 'backgroundCheckStatus',
        label: 'Verificación',
        type: 'badge',
        value: (profile) => profile.backgroundCheckStatus,
        badge: {
          label: (value) =>
            getBackgroundCheckLabel(value as BackgroundCheckStatus),
          tone: (value) =>
            getBackgroundCheckTone(value as BackgroundCheckStatus),
        },
      },
      {
        key: 'isApproved',
        label: 'Aprobado',
        type: 'badge',
        value: (profile) => profile.isApproved,
        badge: {
          label: (value) => (value ? 'Sí' : 'No'),
          tone: (value) => (value ? 'success' : 'warning'),
        },
      },
      {
        key: 'driverStatus',
        label: 'Estado',
        type: 'badge',
        value: (profile) => profile.driverStatus,
        badge: {
          label: (value) => getDriverStatusLabel(value as DriverStatus),
          tone: (value) => getDriverStatusTone(value as DriverStatus),
        },
      },
      {
        key: 'createdAt',
        label: 'Creado',
        type: 'date',
        value: (profile) => profile.createdAt,
        dateFormat: 'dd/MM/yyyy',
      },
    ],

    actions: [
      {
        key: 'detail',
        label: 'Ver detalle',
        icon: 'visibility',
        color: 'neutral',
      },
      {
        key: 'edit',
        label: 'Editar',
        icon: 'edit',
        color: 'primary',
      },
      {
        key: 'delete',
        label: 'Eliminar',
        icon: 'delete',
        color: 'danger',
        disabled: (profile) => deletingDriverId === profile.id,
      },
    ],

    trackBy: (profile) => profile.id,

    toolbar: {
      search: {
        value: query.search ?? '',
        placeholder: 'Buscar por nombre, teléfono o licencia...',
        ariaLabel: 'Buscar conductores',
        clearAriaLabel: 'Limpiar búsqueda de conductores',
      },
      filters: [
        {
          key: 'backgroundCheckStatus',
          label: 'Verificación',
          placeholder: 'Todas',
          value: query.backgroundCheckStatus ?? null,
          options: [
            {
              label: 'Todas',
              value: null,
            },
            {
              label: 'Pendiente',
              value: 'pending_background_check',
            },
            {
              label: 'Aprobado',
              value: 'approved',
            },
            {
              label: 'Rechazado',
              value: 'rejected',
            },
          ],
        },
        {
          key: 'driverStatus',
          label: 'Estado',
          placeholder: 'Todos',
          value: query.driverStatus ?? null,
          options: [
            {
              label: 'Todos',
              value: null,
            },
            {
              label: 'Activo',
              value: 'active',
            },
            {
              label: 'Suspendido',
              value: 'suspended',
            },
            {
              label: 'De vacaciones',
              value: 'on_vacation',
            },
            {
              label: 'Pendiente docs',
              value: 'pending_docs',
            },
            {
              label: 'Desactivado',
              value: 'deactivated',
            },
          ],
        },
        {
          key: 'isApproved',
          label: 'Aprobado',
          placeholder: 'Todos',
          value: query.isApproved ?? null,
          options: [
            {
              label: 'Todos',
              value: null,
            },
            {
              label: 'Sí',
              value: true,
            },
            {
              label: 'No',
              value: false,
            },
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

    emptyTitle: hasActiveCriteria
      ? 'No hay conductores que coincidan'
      : 'No hay conductores registrados',

    emptyDescription: hasActiveCriteria
      ? 'Ajusta la búsqueda o los filtros para volver a ver resultados.'
      : 'Registra el primer conductor desde el onboarding.',

    emptyActionLabel: hasActiveCriteria ? undefined : 'Crear conductor',

    loadingRows: 6,
  };
}
