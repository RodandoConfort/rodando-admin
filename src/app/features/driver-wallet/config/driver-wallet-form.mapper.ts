import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';

import {
  AdminDriverWalletTopupPayload,
  BlockDriverWalletPayload,
} from '../data-access/driver-wallet.models';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function asAmountString(value: unknown): string {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }

  const raw = asString(value);

  if (!raw) {
    return '';
  }

  const amount = Number(raw);

  if (!Number.isFinite(amount)) {
    return raw;
  }

  return amount.toFixed(2);
}

function removeUndefined<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as T;
}

export function mapWalletTopupFormToPayload(
  value: DynamicFormValue,
): AdminDriverWalletTopupPayload {
  return removeUndefined({
    collectionPointId: asString(value['collectionPointId']) ?? '',
    collectedByUserId: asString(value['collectedByUserId']) ?? '',
    amount: asAmountString(value['amount']),
    currency: asString(value['currency']) ?? 'CUP',
    reason: asString(value['reason']),
    notes: asString(value['notes']),
    externalReference: asString(value['externalReference']),
    metadata: {
      source: 'driver-wallet-detail-panel',
    },
  });
}

export function mapWalletBlockFormToPayload(
  value: DynamicFormValue,
): BlockDriverWalletPayload {
  return removeUndefined({
    reason: asString(value['reason']),
    comment: asString(value['comment']),
  });
}
