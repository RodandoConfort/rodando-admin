import { PaginationMeta } from '../../../../core/api/pagination.model';
import { DataTableConfig, TableBadgeTone } from '../../../../shared/table/table.types';

import {
  SelectOption,
  Vehicle,
  VehicleStatus,
  VehiclesQuery,
} from '../data-access/vehicles.models';

function getActiveTone(isActive: boolean): TableBadgeTone {
  return isActive ? 'success' : 'warning';
}

function getStatusLabel(status: VehicleStatus): string {
  const labels: Record<VehicleStatus, string> = {
    pending_review: 'Pendiente',
    approved: 'Aprobado',
    in_service: 'En servicio',
    rejected: 'Rechazado',
    maintenance: 'Mantenimiento',
    unavailable: 'No disponible',
  };

  return labels[status] ?? status;
}

function getStatusTone(status: VehicleStatus): TableBadgeTone {
  const tones: Record<VehicleStatus, TableBadgeTone> = {
    pending_review: 'warning',
    approved: 'success',
    in_service: 'info',
    rejected: 'danger',
    maintenance: 'warning',
    unavailable: 'neutral',
  };

  return tones[status] ?? 'neutral';
}

export function buildVehiclesTableConfig(
  query: VehiclesQuery,
  pagination: PaginationMeta,
  categoryOptions: readonly SelectOption[],
  serviceClassOptions: readonly SelectOption[],
  vehicleTypeOptions: readonly SelectOption[],
): DataTableConfig<Vehicle> {
  const hasActiveCriteria = Boolean(
    query.search?.trim() ||
      query.categoryId ||
      query.serviceClassId ||
      query.vehicleTypeId ||
      query.status ||
      (query.isActive !== undefined && query.isActive !== null),
  );

  return {
    columns: [
      {
        key: 'plateNumber',
        label: 'Placa',
        value: (vehicle) => vehicle.plateNumber,
      },
      {
        key: 'vehicle',
        label: 'Vehículo',
        value: (vehicle) => `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
      },
      {
        key: 'driverName',
        label: 'Conductor',
        value: (vehicle) => vehicle.driverName || vehicle.driver?.name || '—',
      },
      {
        key: 'vehicleTypeName',
        label: 'Tipo',
        value: (vehicle) => vehicle.vehicleTypeName || vehicle.vehicleType?.name || '—',
      },
      {
        key: 'capacity',
        label: 'Capacidad',
        type: 'number',
        align: 'center',
        value: (vehicle) => vehicle.capacity,
      },
      {
        key: 'status',
        label: 'Estado',
        type: 'badge',
        value: (vehicle) => vehicle.status,
        badge: {
          label: (value) => getStatusLabel(value as VehicleStatus),
          tone: (value) => getStatusTone(value as VehicleStatus),
        },
      },
      {
        key: 'isActive',
        label: 'Activo',
        type: 'badge',
        value: (vehicle) => vehicle.isActive,
        badge: {
          label: (value) => (value ? 'Sí' : 'No'),
          tone: (value) => getActiveTone(Boolean(value)),
        },
      },
      {
        key: 'createdAt',
        label: 'Creado',
        type: 'date',
        value: (vehicle) => vehicle.createdAt,
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
    ],

    trackBy: (vehicle) => vehicle.id,

    toolbar: {
      search: {
        value: query.search ?? '',
        placeholder: 'Buscar por placa, marca, modelo o conductor...',
        ariaLabel: 'Buscar vehículos',
        clearAriaLabel: 'Limpiar búsqueda de vehículos',
      },
      filters: [
        {
          key: 'categoryId',
          label: 'Categoría',
          placeholder: 'Todas',
          value: query.categoryId ?? null,
          options: [
            {
              label: 'Todas',
              value: null,
            },
            ...categoryOptions,
          ],
        },
        {
          key: 'serviceClassId',
          label: 'Clase',
          placeholder: 'Todas',
          value: query.serviceClassId ?? null,
          options: [
            {
              label: 'Todas',
              value: null,
            },
            ...serviceClassOptions,
          ],
        },
        {
          key: 'vehicleTypeId',
          label: 'Tipo',
          placeholder: 'Todos',
          value: query.vehicleTypeId ?? null,
          options: [
            {
              label: 'Todos',
              value: null,
            },
            ...vehicleTypeOptions,
          ],
        },
        {
          key: 'status',
          label: 'Estado',
          placeholder: 'Todos',
          value: query.status ?? null,
          options: [
            {
              label: 'Todos',
              value: null,
            },
            {
              label: 'Pendiente',
              value: 'pending_review',
            },
            {
              label: 'Aprobado',
              value: 'approved',
            },
            {
              label: 'En servicio',
              value: 'in_service',
            },
            {
              label: 'Rechazado',
              value: 'rejected',
            },
            {
              label: 'Mantenimiento',
              value: 'maintenance',
            },
            {
              label: 'No disponible',
              value: 'unavailable',
            },
          ],
        },
        {
          key: 'isActive',
          label: 'Activo',
          placeholder: 'Todos',
          value: query.isActive ?? null,
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
      ? 'No hay vehículos que coincidan'
      : 'No hay vehículos registrados',

    emptyDescription: hasActiveCriteria
      ? 'Ajusta la búsqueda o los filtros para volver a ver resultados.'
      : 'Los vehículos se registran desde el onboarding del conductor.',

    emptyActionLabel: undefined,

    loadingRows: 6,
  };
}
