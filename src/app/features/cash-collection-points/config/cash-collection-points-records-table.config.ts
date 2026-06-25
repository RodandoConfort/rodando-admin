import { PaginationMeta } from '../../../core/api/pagination.model';
import {
  DataTableConfig,
  TableBadgeTone,
} from '../../../shared/table/table.types';

import {
  CashCollectionRecord,
  CashCollectionRecordsQuery,
} from '../data-access/cash-collection-points.models';

function getStatusTone(status: string): TableBadgeTone {
  return status === 'completed' ? 'success' : 'warning';
}

function formatMoney(value: number, currency: string): string {
  return `${Number(value ?? 0).toFixed(2)} ${currency}`;
}

function shortId(value?: string | null): string {
  if (!value) {
    return '—';
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export function buildCashCollectionPointRecordsTableConfig(
  query: CashCollectionRecordsQuery,
  pagination: PaginationMeta,
): DataTableConfig<CashCollectionRecord> {
  const hasActiveCriteria = Boolean(
    query.search?.trim() ||
      query.status,
  );

  return {
    columns: [
      {
        key: 'driverName',
        label: 'Driver',
        value: (record) => record.driverName || record.driverId,
      },
      {
        key: 'collectedByName',
        label: 'Cobrado por',
        value: (record) => record.collectedByName || record.collectedByUserId,
      },
      {
        key: 'amount',
        label: 'Monto',
        align: 'end',
        value: (record) => formatMoney(record.amount, record.currency),
      },
      {
        key: 'status',
        label: 'Estado',
        type: 'badge',
        value: (record) => record.status,
        badge: {
          label: (value) => value === 'completed' ? 'Completado' : 'Pendiente',
          tone: (value) => getStatusTone(String(value)),
        },
      },
      {
        key: 'transactionId',
        label: 'Transacción',
        value: (record) => shortId(record.transactionId),
      },
      {
        key: 'notes',
        label: 'Notas',
        value: (record) => record.notes || '—',
      },
      {
        key: 'createdAt',
        label: 'Fecha',
        type: 'date',
        value: (record) => record.createdAt,
        dateFormat: 'dd/MM/yyyy HH:mm',
      },
    ],

    trackBy: (record) => record.id,

    toolbar: {
      search: {
        value: query.search ?? '',
        placeholder: 'Buscar por notas, driver u operador...',
        ariaLabel: 'Buscar records del punto de recaudo',
        clearAriaLabel: 'Limpiar búsqueda de records',
      },
      filters: [
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
              label: 'Completados',
              value: 'completed',
            },
            {
              label: 'Pendientes',
              value: 'pending',
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
      ? 'No hay records que coincidan'
      : 'No hay records para este punto',

    emptyDescription: hasActiveCriteria
      ? 'Ajusta la búsqueda o los filtros para volver a ver resultados.'
      : 'Cuando se registren recargas en este punto aparecerán aquí.',

    loadingRows: 5,
  };
}
