import { PaginationMeta } from '../../../../core/api/pagination.model';
import {
  DataTableConfig,
  TableBadgeTone,
} from '../../../../shared/table/table.types';

import {
  SelectOption,
  VehicleType,
  VehicleTypesQuery,
} from '../data-access/vehicle-types.models';

function getActiveTone(isActive: boolean): TableBadgeTone {
  return isActive ? 'success' : 'warning';
}

function formatMoney(value: number): string {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function getCategoryLabel(
  type: VehicleType,
  categoryOptions: readonly SelectOption[],
): string {
  if (type.categoryName) {
    return type.categoryName;
  }

  if (type.category?.name) {
    return type.category.name;
  }

  if (!type.categoryId) {
    return '—';
  }

  return (
    categoryOptions.find((option) => option.value === type.categoryId)?.label ??
    '—'
  );
}

function getServiceClassLabel(type: VehicleType): string {
  const names =
    type.serviceClassNames?.length
      ? type.serviceClassNames
      : type.serviceClasses?.map((serviceClass) => serviceClass.name) ?? [];

  return names.length > 0 ? names.join(', ') : '—';
}

export function buildVehicleTypesTableConfig(
  query: VehicleTypesQuery,
  pagination: PaginationMeta,
  deletingTypeId: string | null,
  categoryOptions: readonly SelectOption[],
): DataTableConfig<VehicleType> {
  const hasActiveCriteria = Boolean(
    query.name?.trim() ||
      query.categoryId ||
      (query.isActive !== undefined && query.isActive !== null),
  );

  return {
    columns: [
      {
        key: 'icon',
        label: '',
        type: 'avatar',
        value: (type) => type.iconUrl,
        fallbackText: (type) => type.name,
        imageAlt: (type) => `Ícono de ${type.name}`,
      },
      {
        key: 'name',
        label: 'Tipo',
        value: (type) => type.name,
      },
      {
        key: 'categoryName',
        label: 'Categoría',
        value: (type) => getCategoryLabel(type, categoryOptions),
      },
      {
        key: 'serviceClasses',
        label: 'Clases de servicio',
        value: (type) => getServiceClassLabel(type),
      },
      {
        key: 'defaultCapacity',
        label: 'Capacidad',
        type: 'number',
        align: 'center',
        value: (type) => type.defaultCapacity,
      },
      {
        key: 'baseFare',
        label: 'Tarifa base',
        align: 'end',
        value: (type) => formatMoney(type.baseFare),
      },
      {
        key: 'isActive',
        label: 'Estado',
        type: 'badge',
        value: (type) => type.isActive,
        badge: {
          label: (value) => (value ? 'Activo' : 'Inactivo'),
          tone: (value) => getActiveTone(Boolean(value)),
        },
      },
      {
        key: 'createdAt',
        label: 'Creado',
        type: 'date',
        value: (type) => type.createdAt,
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
        disabled: (type) => deletingTypeId === type.id,
      },
    ],

    trackBy: (type) => type.id,

    toolbar: {
      search: {
        value: query.name ?? '',
        placeholder: 'Buscar por nombre...',
        ariaLabel: 'Buscar tipos de vehículos por nombre',
        clearAriaLabel: 'Limpiar búsqueda de tipos de vehículos',
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
      ? 'No hay tipos de vehículos que coincidan'
      : 'No hay tipos de vehículos registrados',

    emptyDescription: hasActiveCriteria
      ? 'Ajusta la búsqueda o los filtros para volver a ver resultados.'
      : 'Crea el primer tipo de vehículo desde el panel administrativo.',

    emptyActionLabel: hasActiveCriteria ? undefined : 'Crear tipo',

    loadingRows: 6,
  };
}
