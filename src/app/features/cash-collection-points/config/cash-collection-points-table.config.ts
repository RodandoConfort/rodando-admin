import { PaginationMeta } from '../../../core/api/pagination.model';
import {
  DataTableConfig,
  TableBadgeTone,
} from '../../../shared/table/table.types';

import {
  CashCollectionPoint,
  CashCollectionPointsQuery,
} from '../data-access/cash-collection-points.models';

function getActiveTone(isActive: boolean): TableBadgeTone {
  return isActive ? 'success' : 'warning';
}

function formatLocation(location?: [number, number] | null): string {
  if (!location) {
    return '—';
  }

  return `${location[1]}, ${location[0]}`;
}

export function buildCashCollectionPointsTableConfig(
  query: CashCollectionPointsQuery,
  pagination: PaginationMeta,
  deletingPointId: string | null,
): DataTableConfig<CashCollectionPoint> {
  const hasActiveCriteria = Boolean(
    query.search?.trim() ||
      (query.isActive !== undefined && query.isActive !== null),
  );

  return {
    columns: [
      {
        key: 'name',
        label: 'Nombre',
        value: (point) => point.name,
      },
      {
        key: 'address',
        label: 'Dirección',
        value: (point) => point.address || '—',
      },
      {
        key: 'contactPhone',
        label: 'Teléfono',
        value: (point) => point.contactPhone || '—',
      },
      {
        key: 'isActive',
        label: 'Estado',
        type: 'badge',
        value: (point) => point.isActive,
        badge: {
          label: (value) => (value ? 'Activo' : 'Inactivo'),
          tone: (value) => getActiveTone(Boolean(value)),
        },
      },
      {
        key: 'createdAt',
        label: 'Creado',
        type: 'date',
        value: (point) => point.createdAt,
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
        disabled: (point) => deletingPointId === point.id,
      },
    ],

    trackBy: (point) => point.id,

    toolbar: {
      search: {
        value: query.search ?? '',
        placeholder: 'Buscar por nombre, dirección o teléfono...',
        ariaLabel: 'Buscar puntos de recaudo',
        clearAriaLabel: 'Limpiar búsqueda de puntos de recaudo',
      },
      filters: [
        {
          key: 'isActive',
          label: 'Estado',
          placeholder: 'Todos',
          value: query.isActive ?? null,
          options: [
            {
              label: 'Todos',
              value: null,
            },
            {
              label: 'Activos',
              value: true,
            },
            {
              label: 'Inactivos',
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
      ? 'No hay puntos de recaudo que coincidan'
      : 'No hay puntos de recaudo registrados',

    emptyDescription: hasActiveCriteria
      ? 'Ajusta la búsqueda o los filtros para volver a ver resultados.'
      : 'Crea el primer punto de recaudo desde el panel administrativo.',

    emptyActionLabel: hasActiveCriteria ? undefined : 'Crear punto',

    loadingRows: 6,
  };
}
