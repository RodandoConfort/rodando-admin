import { PaginationMeta } from '../../../core/api/pagination.model';
import { DataTableConfig, TableBadgeTone } from '../../../shared/table/table.types';

import { CitiesQuery, City } from '../data-access/geography.models';

function activeTone(active: boolean): TableBadgeTone {
  return active ? 'success' : 'warning';
}

export function buildCitiesTableConfig(
  query: CitiesQuery,
  pagination: PaginationMeta,
): DataTableConfig<City> {
  const hasCriteria = Boolean(
    query.q?.trim() ||
      query.countryCode ||
      (query.active !== undefined && query.active !== null),
  );

  return {
    columns: [
      {
        key: 'name',
        label: 'Ciudad',
        value: (city) => city.name,
      },
      {
        key: 'countryCode',
        label: 'País',
        value: (city) => city.countryCode,
      },
      {
        key: 'timezone',
        label: 'Zona horaria',
        value: (city) => city.timezone,
      },
      {
        key: 'active',
        label: 'Estado',
        type: 'badge',
        value: (city) => city.active,
        badge: {
          label: (value) => (value ? 'Activa' : 'Inactiva'),
          tone: (value) => activeTone(Boolean(value)),
        },
      },
      {
        key: 'createdAt',
        label: 'Creada',
        type: 'date',
        value: (city) => city.createdAt,
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

    trackBy: (city) => city.id,

    toolbar: {
      search: {
        value: query.q ?? '',
        placeholder: 'Buscar por nombre...',
        ariaLabel: 'Buscar ciudades',
        clearAriaLabel: 'Limpiar búsqueda de ciudades',
      },
      filters: [
        {
          key: 'active',
          label: 'Estado',
          placeholder: 'Todas',
          value: query.active ?? null,
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

    emptyTitle: hasCriteria
      ? 'No hay ciudades que coincidan'
      : 'No hay ciudades registradas',

    emptyDescription: hasCriteria
      ? 'Ajusta la búsqueda o los filtros para volver a ver resultados.'
      : 'Crea la primera ciudad para organizar zonas y políticas de precio.',

    emptyActionLabel: hasCriteria ? undefined : 'Crear ciudad',

    loadingRows: 6,
  };
}
