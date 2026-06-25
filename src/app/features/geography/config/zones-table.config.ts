import { PaginationMeta } from '../../../core/api/pagination.model';
import { DataTableConfig, TableBadgeTone } from '../../../shared/table/table.types';

import {
  SelectOption,
  Zone,
  ZonesQuery,
} from '../data-access/geography.models';

function activeTone(active: boolean): TableBadgeTone {
  return active ? 'success' : 'warning';
}

function getCityName(zone: Zone): string {
  return zone.city?.name ?? zone.cityName ?? '—';
}

export function buildZonesTableConfig(
  query: ZonesQuery,
  pagination: PaginationMeta,
  cityOptions: readonly SelectOption[],
): DataTableConfig<Zone> {
  const hasCriteria = Boolean(
    query.q?.trim() ||
      query.cityId ||
      query.kind ||
      (query.active !== undefined && query.active !== null),
  );

  return {
    columns: [
      {
        key: 'name',
        label: 'Zona',
        value: (zone) => zone.name,
      },
      {
        key: 'city',
        label: 'Ciudad',
        value: (zone) => getCityName(zone),
      },
      {
        key: 'kind',
        label: 'Tipo',
        value: (zone) => zone.kind || '—',
      },
      {
        key: 'priority',
        label: 'Prioridad',
        type: 'number',
        align: 'center',
        value: (zone) => zone.priority,
      },
      {
        key: 'active',
        label: 'Estado',
        type: 'badge',
        value: (zone) => zone.active,
        badge: {
          label: (value) => (value ? 'Activa' : 'Inactiva'),
          tone: (value) => activeTone(Boolean(value)),
        },
      },
      {
        key: 'createdAt',
        label: 'Creada',
        type: 'date',
        value: (zone) => zone.createdAt,
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

    trackBy: (zone) => zone.id,

    toolbar: {
      search: {
        value: query.q ?? '',
        placeholder: 'Buscar por nombre...',
        ariaLabel: 'Buscar zonas',
        clearAriaLabel: 'Limpiar búsqueda de zonas',
      },
      filters: [
        {
          key: 'cityId',
          label: 'Ciudad',
          placeholder: 'Todas',
          value: query.cityId ?? null,
          options: [
            {
              label: 'Todas',
              value: null,
            },
            ...cityOptions,
          ],
        },
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
      ? 'No hay zonas que coincidan'
      : 'No hay zonas registradas',

    emptyDescription: hasCriteria
      ? 'Ajusta la búsqueda o los filtros para volver a ver resultados.'
      : 'Crea la primera zona para segmentar cobertura, prioridad y precios.',

    emptyActionLabel: hasCriteria ? undefined : 'Crear zona',

    loadingRows: 6,
  };
}
