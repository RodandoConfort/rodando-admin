import { PaginationMeta } from '../../../../core/api/pagination.model';
import {
  DataTableConfig,
  TableBadgeTone,
} from '../../../../shared/table/table.types';

import {
  VehicleServiceClass,
  VehicleServiceClassesQuery,
} from '../data-access/vehicle-service-classes.models';

function getActiveTone(isActive: boolean): TableBadgeTone {
  return isActive ? 'success' : 'warning';
}

function formatMultiplier(value: number): string {
  return `x${Number(value ?? 0).toFixed(2)}`;
}

export function buildVehicleServiceClassesTableConfig(
  query: VehicleServiceClassesQuery,
  pagination: PaginationMeta,
  deletingServiceClassId: string | null,
): DataTableConfig<VehicleServiceClass> {
  const hasActiveCriteria = Boolean(
    query.name?.trim() ||
      (query.isActive !== undefined && query.isActive !== null),
  );

  return {
    columns: [
      {
        key: 'icon',
        label: '',
        type: 'avatar',
        value: (serviceClass) => serviceClass.iconUrl,
        fallbackText: (serviceClass) => serviceClass.name,
        imageAlt: (serviceClass) => `Ícono de ${serviceClass.name}`,
      },
      {
        key: 'name',
        label: 'Clase',
        value: (serviceClass) => serviceClass.name,
      },
      {
        key: 'capacity',
        label: 'Capacidad',
        align: 'center',
        value: (serviceClass) =>
          `${serviceClass.minCapacity} - ${serviceClass.maxCapacity}`,
      },
      {
        key: 'baseFareMultiplier',
        label: 'Tarifa base',
        align: 'end',
        value: (serviceClass) =>
          formatMultiplier(serviceClass.baseFareMultiplier),
      },
      {
        key: 'displayOrder',
        label: 'Orden',
        type: 'number',
        align: 'center',
        value: (serviceClass) => serviceClass.displayOrder ?? '—',
      },
      {
        key: 'isActive',
        label: 'Estado',
        type: 'badge',
        value: (serviceClass) => serviceClass.isActive,
        badge: {
          label: (value) => (value ? 'Activa' : 'Inactiva'),
          tone: (value) => getActiveTone(Boolean(value)),
        },
      },
      {
        key: 'createdAt',
        label: 'Creada',
        type: 'date',
        value: (serviceClass) => serviceClass.createdAt,
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
        disabled: (serviceClass) =>
          deletingServiceClassId === serviceClass.id,
      },
    ],

    trackBy: (serviceClass) => serviceClass.id,

    toolbar: {
      search: {
        value: query.name ?? '',
        placeholder: 'Buscar por nombre...',
        ariaLabel: 'Buscar clases de servicio por nombre',
        clearAriaLabel: 'Limpiar búsqueda de clases de servicio',
      },
      filters: [
        {
          key: 'isActive',
          label: 'Estado',
          placeholder: 'Todas',
          value: query.isActive ?? null,
          options: [
            {
              label: 'Todas',
              value: null,
            },
            {
              label: 'Activas',
              value: true,
            },
            {
              label: 'Inactivas',
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
      ? 'No hay clases de servicio que coincidan'
      : 'No hay clases de servicio registradas',

    emptyDescription: hasActiveCriteria
      ? 'Ajusta la búsqueda o los filtros para volver a ver resultados.'
      : 'Crea la primera clase de servicio desde el panel administrativo.',

    emptyActionLabel: hasActiveCriteria ? undefined : 'Crear clase',

    loadingRows: 6,
  };
}
