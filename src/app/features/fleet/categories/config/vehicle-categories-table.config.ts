import { PaginationMeta } from '../../../../core/api/pagination.model';
import {
  DataTableConfig,
  TableBadgeTone,
} from '../../../../shared/table/table.types';
import {
  VehicleCategoriesQuery,
  VehicleCategory,
} from '../data-access/vehicle-categories.models';

function getActiveTone(isActive: boolean): TableBadgeTone {
  return isActive ? 'success' : 'warning';
}

export function buildVehicleCategoriesTableConfig(
  query: VehicleCategoriesQuery,
  pagination: PaginationMeta,
  deletingCategoryId: string | null,
): DataTableConfig<VehicleCategory> {
  const hasActiveCriteria = Boolean(
    query.name?.trim() ||
    query.isActive !== undefined && query.isActive !== null,
  );

  return {
    columns: [
      {
        key: 'icon',
        label: '',
        type: 'avatar',
        value: (category) => category.iconUrl,
        fallbackText: (category) => category.name,
        imageAlt: (category) => `Ícono de ${category.name}`,
      },
      {
        key: 'name',
        label: 'Categoría',
        value: (category) => category.name,
      },
      {
        key: 'description',
        label: 'Descripción',
        value: (category) => category.description,
      },
      {
        key: 'isActive',
        label: 'Estado',
        type: 'badge',
        value: (category) => category.isActive,
        badge: {
          label: (value) => value ? 'Activa' : 'Inactiva',
          tone: (value) => getActiveTone(Boolean(value)),
        },
      },
      {
        key: 'createdAt',
        label: 'Creada',
        type: 'date',
        value: (category) => category.createdAt,
        dateFormat: 'dd/MM/yyyy',
      },
    ],

    actions: [
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
        disabled: (category) => deletingCategoryId === category.id,
      },
    ],

    trackBy: (category) => category.id,

    toolbar: {
      search: {
        value: query.name ?? '',
        placeholder: 'Buscar por nombre...',
        ariaLabel: 'Buscar categorías por nombre',
        clearAriaLabel: 'Limpiar búsqueda de categorías',
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
      ? 'No hay categorías que coincidan'
      : 'No hay categorías registradas',

    emptyDescription: hasActiveCriteria
      ? 'Ajusta la búsqueda o los filtros para volver a ver resultados.'
      : 'Crea la primera categoría de vehículos desde el panel administrativo.',

    emptyActionLabel: hasActiveCriteria ? undefined : 'Crear categoría',

    loadingRows: 6,
  };
}
