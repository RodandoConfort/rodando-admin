import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import {
  CreatePricePolicyPayload,
  PricePolicy,
  PricePolicyConditions,
  PricePolicyFormValue,
  PricePolicyPrice,
  PricePolicyScopeType,
  UpdatePricePolicyPayload,
} from '../data-access/price-policies.models';

export function mapPricePolicyToFormValue(
  policy?: PricePolicy | null,
): PricePolicyFormValue | null {
  if (!policy) {
    return null;
  }

  return {
    name: policy.name,
    scopeType: policy.scopeType,
    cityId: policy.cityId,
    zoneId: policy.zoneId,
    active: policy.active,
    priority: policy.priority,
    effectiveFrom: policy.effectiveFrom,
    effectiveTo: policy.effectiveTo,
    timezone: policy.timezone,
    conditionsJson: JSON.stringify(policy.conditions ?? {}, null, 2),
    priceJson: JSON.stringify(policy.price ?? {}, null, 2),
  };
}

export function mapPricePolicyFormToCreatePayload(
  value: DynamicFormValue,
): CreatePricePolicyPayload {
  const scopeType = readScope(value);
  const cityId = normalizeNullableText(value['cityId']);
  const zoneId = normalizeNullableText(value['zoneId']);

  return {
    name: readString(value, 'name').trim(),
    scopeType,
    cityId: scopeType === PricePolicyScopeType.CITY ? cityId : null,
    zoneId: scopeType === PricePolicyScopeType.ZONE ? zoneId : null,
    active: readBoolean(value, 'active', true),
    priority: readNumber(value, 'priority', 100),
    effectiveFrom: normalizeNullableText(value['effectiveFrom']),
    effectiveTo: normalizeNullableText(value['effectiveTo']),
    timezone: readString(value, 'timezone', 'America/Havana').trim() || 'UTC',
    conditions: parseJsonObject<PricePolicyConditions>(
      readString(value, 'conditionsJson', '{}'),
      'Las condiciones deben ser un JSON válido.',
    ),
    price: parseJsonObject<PricePolicyPrice>(
      readString(value, 'priceJson', '{}'),
      'El precio debe ser un JSON válido.',
    ),
  };
}

export function mapPricePolicyFormToUpdatePayload(
  value: DynamicFormValue,
): UpdatePricePolicyPayload {
  return mapPricePolicyFormToCreatePayload(value);
}

function readScope(value: DynamicFormValue): PricePolicyScopeType {
  const scope = value['scopeType'];

  if (
    scope === PricePolicyScopeType.GLOBAL ||
    scope === PricePolicyScopeType.CITY ||
    scope === PricePolicyScopeType.ZONE
  ) {
    return scope;
  }

  return PricePolicyScopeType.GLOBAL;
}

function readString(
  value: DynamicFormValue,
  key: string,
  fallback = '',
): string {
  const raw = value[key];

  return typeof raw === 'string' ? raw : fallback;
}

function readNumber(
  value: DynamicFormValue,
  key: string,
  fallback: number,
): number {
  const raw = Number(value[key]);

  return Number.isFinite(raw) ? raw : fallback;
}

function readBoolean(
  value: DynamicFormValue,
  key: string,
  fallback: boolean,
): boolean {
  const raw = value[key];

  return typeof raw === 'boolean' ? raw : fallback;
}

function normalizeNullableText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized ? normalized : null;
}

function parseJsonObject<T>(
  value: string,
  errorMessage: string,
): T {
  try {
    const parsed = JSON.parse(value || '{}');

    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      throw new Error();
    }

    return parsed as T;
  } catch {
    throw new Error(errorMessage);
  }
}
