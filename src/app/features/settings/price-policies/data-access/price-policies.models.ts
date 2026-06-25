export enum PricePolicyScopeType {
  GLOBAL = 'GLOBAL',
  CITY = 'CITY',
  ZONE = 'ZONE',
}

export type PricePolicyConditions = {
  days_of_week?: number[];
  time_ranges?: { start: string; end: string }[];
  dates?: string[];
  date_ranges?: { from: string; to: string }[];
  exclude_dates?: string[];
};

export type PricePolicyPrice = {
  base_fare?: number;
  per_km?: number;
  per_minute?: number;
  minimum_fare?: number;

  booking_fee?: number;
  fixed_surcharge?: number;
  night_surcharge?: number;

  multiplier?: number;

  fuel_reference_price?: number;
  fuel_sensitivity?: number;
  fuel_min_multiplier?: number;
  fuel_max_multiplier?: number;

  demand_multiplier?: number;
  demand_max_multiplier?: number;

  hour_multiplier?: number;

  cap?: number;
};

export interface PricePolicyRelation {
  id: string;
  name?: string;
  description?: string | null;
}

export interface PricePolicy {
  id: string;
  name: string;
  scopeType: PricePolicyScopeType;
  cityId: string | null;
  city?: PricePolicyRelation | null;
  zoneId: string | null;
  zone?: PricePolicyRelation | null;
  active: boolean;
  priority: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  timezone: string;
  conditions: PricePolicyConditions;
  price: PricePolicyPrice;
  updatedBy: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricePoliciesQuery {
  search?: string;
  scopeType?: PricePolicyScopeType | null;
  cityId?: string | null;
  zoneId?: string | null;
  active?: boolean | null;
  page?: number;
  limit?: number;
}

export interface CreatePricePolicyPayload {
  name: string;
  scopeType: PricePolicyScopeType;
  cityId?: string | null;
  zoneId?: string | null;
  active?: boolean;
  priority?: number;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  timezone?: string;
  conditions?: PricePolicyConditions;
  price: PricePolicyPrice;
  updatedBy?: string | null;
}

export interface UpdatePricePolicyPayload
  extends Partial<CreatePricePolicyPayload> {}

export interface PricePolicyFormValue extends Record<string, unknown> {
  name: string;
  scopeType: PricePolicyScopeType;
  cityId: string | null;
  zoneId: string | null;
  active: boolean;
  priority: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  timezone: string;
  conditionsJson: string;
  priceJson: string;
}

export const PRICE_POLICY_SCOPE_OPTIONS = [
  {
    label: 'Global',
    value: PricePolicyScopeType.GLOBAL,
  },
  {
    label: 'Ciudad',
    value: PricePolicyScopeType.CITY,
  },
  {
    label: 'Zona',
    value: PricePolicyScopeType.ZONE,
  },
] as const;

export function getPricePolicyScopeLabel(scope: PricePolicyScopeType): string {
  return PRICE_POLICY_SCOPE_OPTIONS.find((item) => item.value === scope)?.label ?? scope;
}

export function formatPricePolicyScopeTarget(policy: PricePolicy): string {
  if (policy.scopeType === PricePolicyScopeType.GLOBAL) {
    return 'Global';
  }

  if (policy.scopeType === PricePolicyScopeType.CITY) {
    return policy.city?.name ?? policy.cityId ?? 'Ciudad';
  }

  return policy.zone?.name ?? policy.zoneId ?? 'Zona';
}

export function formatPricePolicyPrice(policy: PricePolicy): string {
  const price = policy.price ?? {};
  const parts: string[] = [];

  if (price.multiplier !== undefined) {
    parts.push(`Mult. ${price.multiplier}`);
  }

  if (price.booking_fee !== undefined) {
    parts.push(`Reserva ${price.booking_fee}`);
  }

  if (price.fixed_surcharge !== undefined) {
    parts.push(`Fijo ${price.fixed_surcharge}`);
  }

  if (price.fuel_reference_price !== undefined) {
    parts.push(`Fuel ref. ${price.fuel_reference_price}`);
  }

  if (price.demand_multiplier !== undefined) {
    parts.push(`Demanda ${price.demand_multiplier}`);
  }

  return parts.length ? parts.join(' · ') : '—';
}
