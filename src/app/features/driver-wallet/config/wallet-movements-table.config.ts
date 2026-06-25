import { PaginationMeta } from '../../../core/api/pagination.model';
import { DataTableConfig } from '../../../shared/table/table.types';

import { WalletMovement, WalletMovementsQuery } from '../data-access/driver-wallet.models';

function formatMoney(value: number, currency = 'CUP'): string {
  return `${Number(value ?? 0).toFixed(2)} ${currency}`;
}

export function buildWalletMovementsTableConfig(
  query: WalletMovementsQuery,
  pagination: PaginationMeta,
  currency: string,
): DataTableConfig<WalletMovement> {
  const hasActiveCriteria = Boolean(
    query.search?.trim() || query.transactionId || query.from || query.to,
  );

  return {
    columns: [
      {
        key: 'amount',
        label: 'Importe',
        align: 'end',
        value: (movement) => formatMoney(movement.amount, currency),
      },
      {
        key: 'previousBalance',
        label: 'Saldo anterior',
        align: 'end',
        value: (movement) => formatMoney(movement.previousBalance, currency),
      },
      {
        key: 'newBalance',
        label: 'Nuevo saldo',
        align: 'end',
        value: (movement) => formatMoney(movement.newBalance, currency),
      },
      {
        key: 'note',
        label: 'Nota',
        value: (movement) => movement.note || '—',
      },
      {
        key: 'transactionId',
        label: 'Transacción',
        value: (movement) => movement.transactionId || '—',
      },
      {
        key: 'createdAt',
        label: 'Fecha',
        type: 'date',
        value: (movement) => movement.createdAt,
        dateFormat: 'dd/MM/yyyy, HH:mm',
      },
    ],

    trackBy: (movement) => movement.id,

    toolbar: {
      search: {
        value: query.search ?? '',
        placeholder: 'Buscar por nota...',
        ariaLabel: 'Buscar movimientos por nota',
        clearAriaLabel: 'Limpiar búsqueda de movimientos',
      },
    },

    pagination: {
      length: pagination.total,
      pageIndex: Math.max(0, pagination.page - 1),
      pageSize: pagination.limit,
      pageSizeOptions: [10, 25, 50],
      showFirstLastButtons: true,
    },

    emptyTitle: hasActiveCriteria
      ? 'No hay movimientos que coincidan'
      : 'No hay movimientos registrados',

    emptyDescription: hasActiveCriteria
      ? 'Ajusta la búsqueda para volver a ver resultados.'
      : 'Cuando se realicen recargas, cobros o ajustes aparecerán aquí.',

    loadingRows: 5,
  };
}
