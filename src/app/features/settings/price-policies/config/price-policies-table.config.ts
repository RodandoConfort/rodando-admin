import { PaginationMeta } from '../../../../core/api/pagination.model';

import {
  formatPricePolicyPrice,
  formatPricePolicyScopeTarget,
  getPricePolicyScopeLabel,
  PRICE_POLICY_SCOPE_OPTIONS,
  PricePoliciesQuery,
  PricePolicy,
} from '../data-access/price-policies.models';

export function buildPricePoliciesTableConfig(
  query: PricePoliciesQuery,
  pagination: PaginationMeta,
  activeSavingId: string | null,
) {
  return {
    search: {
      enabled: true,
      placeholder: 'Buscar por nombre...',
      value: query.search ?? '',
    },
    filters: [
      {
        key: 'scopeType',
        label: 'Alcance',
        type: 'select',
        value: query.scopeType ?? null,
        options: [
          {
            label: 'Todos',
            value: null,
          },
          ...PRICE_POLICY_SCOPE_OPTIONS,
        ],
      },
      {
        key: 'active',
        label: 'Estado',
        type: 'select',
        value: query.active ?? null,
        options: [
          {
            label: 'Todos',
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
    columns: [
      {
        key: 'name',
        label: 'Nombre',
        value: (row: PricePolicy) => row.name,
      },
      {
        key: 'scopeType',
        label: 'Alcance',
        value: (row: PricePolicy) => getPricePolicyScopeLabel(row.scopeType),
      },
      {
        key: 'target',
        label: 'Destino',
        value: (row: PricePolicy) => formatPricePolicyScopeTarget(row),
      },
      {
        key: 'price',
        label: 'Precio',
        value: (row: PricePolicy) => formatPricePolicyPrice(row),
      },
      {
        key: 'priority',
        label: 'Prioridad',
        value: (row: PricePolicy) => row.priority,
      },
      {
        key: 'active',
        label: 'Activa',
        type: 'boolean',
        value: (row: PricePolicy) => row.active,
      },
    ],
    actions: [
      {
        key: 'detail',
        label: 'Ver detalle',
        icon: 'visibility',
      },
      {
        key: 'edit',
        label: 'Editar',
        icon: 'edit',
      },
      {
        key: 'toggle-active',
        label: 'Activar/desactivar',
        icon: 'power_settings_new',
        disabled: (row: PricePolicy) => activeSavingId === row.id,
      },
    ],
    pagination,
    emptyState: {
      icon: 'payments',
      title: 'No hay políticas de precio',
      description: 'No se encontraron políticas con los filtros seleccionados.',
    },
    createButtonLabel: 'Nueva política',
  } as any;
}
