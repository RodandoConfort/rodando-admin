import {
  PricePolicy,
  PricePolicyPrice,
  PricePolicyScopeType,
} from '../data-access/price-policies.models';

const r2 = (n: number) => Number(Number(n).toFixed(2));
const r4 = (n: number) => Number(Number(n).toFixed(4));

export interface PricePolicySimulatorInput {
  baseFare: number;
  perKm: number;
  perMinute: number;
  minFare: number;

  serviceBaseMultiplier: number;
  servicePerKmMultiplier: number;
  servicePerMinuteMultiplier: number;
  serviceMinFareMultiplier: number;

  distanceKm: number;
  durationMin: number;

  surgeMultiplier: number;
  extrasTotal: number;

  fuelPrice: number | null;
  fuelReferencePrice: number | null;
  fuelSensitivity: number;
  fuelMinMultiplier: number;
  fuelMaxMultiplier: number;

  demandMultiplier: number | null;
  demandMaxMultiplier: number;

  policy: PricePolicy | null;
}

export interface PricePolicySimulatorResult {
  total: number;
  totalNoExtras: number;
  subtotal: number;
  distanceAmount: number;
  timeAmount: number;
  base: number;
  perKm: number;
  perMin: number;
  minFare: number;
  finalMultiplier: number;
  policyMultiplier: number;
  fuelMultiplier: number;
  demandMultiplier: number;
  hourMultiplier: number;
  minimumFareApplied: boolean;
  capApplied: boolean;
  cap: number | null;
  rateCard: Record<string, unknown>;
}

export function simulatePricePolicyQuote(
  input: PricePolicySimulatorInput,
): PricePolicySimulatorResult {
  const rateCard = buildRateCard(input);

  const base0 = input.baseFare * input.serviceBaseMultiplier;
  const perKm0 = input.perKm * input.servicePerKmMultiplier;
  const perMin0 = input.perMinute * input.servicePerMinuteMultiplier;
  const minFare0 = input.minFare * input.serviceMinFareMultiplier;

  const base = base0 * Number(rateCard.base_fare ?? 1);
  const perKm = perKm0 * Number(rateCard.per_km ?? 1);
  const perMin = perMin0 * Number(rateCard.per_minute ?? 1);
  const minFare = minFare0 * Number(rateCard.minimum_fare ?? 1);

  const bookingFee = Number(rateCard.booking_fee ?? 0);
  const fixedSurcharge = Number(rateCard.fixed_surcharge ?? 0);
  const nightSurcharge = Number(rateCard.night_surcharge ?? 0);

  const distanceAmount = perKm * input.distanceKm;
  const timeAmount = perMin * input.durationMin;

  const subtotal =
    base +
    distanceAmount +
    timeAmount +
    bookingFee +
    fixedSurcharge +
    nightSurcharge;

  let totalBase = Math.max(subtotal, minFare);
  const minimumFareApplied = totalBase === minFare && minFare > subtotal;

  const policyMultiplier = Number(rateCard.policy_multiplier ?? 1);
  const hourMultiplier = Number(rateCard.hour_multiplier ?? 1);
  const fuelMultiplier = calculateFuelMultiplier(input.fuelPrice, rateCard);
  const demandMultiplier = calculateDemandMultiplier(
    input.demandMultiplier,
    rateCard,
  );

  const finalMultiplier = r4(
    Number(input.surgeMultiplier ?? 1) *
      policyMultiplier *
      fuelMultiplier *
      demandMultiplier *
      hourMultiplier,
  );

  totalBase *= finalMultiplier;

  const cap = rateCard.cap != null ? Number(rateCard.cap) : null;
  const totalNoExtras = cap != null ? Math.min(totalBase, cap) : totalBase;
  const capApplied = cap != null && totalBase > cap;

  const total = totalNoExtras + Number(input.extrasTotal ?? 0);

  return {
    total: r2(total),
    totalNoExtras: r2(totalNoExtras),
    subtotal: r2(subtotal),
    distanceAmount: r2(distanceAmount),
    timeAmount: r2(timeAmount),
    base: r2(base),
    perKm: r4(perKm),
    perMin: r4(perMin),
    minFare: r2(minFare),
    finalMultiplier,
    policyMultiplier: r4(policyMultiplier),
    fuelMultiplier: r4(fuelMultiplier),
    demandMultiplier: r4(demandMultiplier),
    hourMultiplier: r4(hourMultiplier),
    minimumFareApplied,
    capApplied,
    cap: cap != null ? r2(cap) : null,
    rateCard,
  };
}

function buildRateCard(input: PricePolicySimulatorInput) {
  const policy = input.policy;
  const price: PricePolicyPrice = policy?.price ?? {};
  const scope = policy?.scopeType ?? PricePolicyScopeType.GLOBAL;

  const baseFactor =
    price.base_fare !== undefined ? factorFromPolicy(price.base_fare) : 1;

  const perKmFactor =
    price.per_km !== undefined ? factorFromPolicy(price.per_km) : 1;

  const perMinFactor =
    price.per_minute !== undefined ? factorFromPolicy(price.per_minute) : 1;

  const minFareFactor =
    price.minimum_fare !== undefined
      ? factorFromPolicy(price.minimum_fare)
      : 1;

  const policyMultiplier =
    price.multiplier !== undefined
      ? clampPolicyMultiplierByScope(Number(price.multiplier), scope)
      : 1;

  const fuelReferencePrice =
    price.fuel_reference_price !== undefined
      ? toMoney(price.fuel_reference_price)
      : input.fuelReferencePrice;

  const fuelSensitivity =
    price.fuel_sensitivity !== undefined
      ? clamp(Number(price.fuel_sensitivity), 0, 3)
      : input.fuelSensitivity;

  const fuelMinMultiplier =
    price.fuel_min_multiplier !== undefined
      ? clamp(Number(price.fuel_min_multiplier), 0.5, 1)
      : input.fuelMinMultiplier;

  const fuelMaxMultiplier =
    price.fuel_max_multiplier !== undefined
      ? clamp(Number(price.fuel_max_multiplier), 1, 4)
      : input.fuelMaxMultiplier;

  const demandMaxMultiplier =
    price.demand_max_multiplier !== undefined
      ? clamp(Number(price.demand_max_multiplier), 1, 5)
      : input.demandMaxMultiplier;

  return {
    base_fare: r4(baseFactor),
    per_km: r4(perKmFactor),
    per_minute: r4(perMinFactor),
    minimum_fare: r4(minFareFactor),

    booking_fee: r2(toMoney(price.booking_fee)),
    fixed_surcharge: r2(toMoney(price.fixed_surcharge)),
    night_surcharge: r2(toMoney(price.night_surcharge)),

    policy_multiplier: r4(policyMultiplier),
    hour_multiplier:
      price.hour_multiplier !== undefined
        ? r4(clamp(Number(price.hour_multiplier), 0.5, 2))
        : 1,

    fuel_reference_price:
      fuelReferencePrice !== null && Number.isFinite(Number(fuelReferencePrice))
        ? r2(Number(fuelReferencePrice))
        : null,
    fuel_sensitivity: r4(fuelSensitivity),
    fuel_min_multiplier: r4(fuelMinMultiplier),
    fuel_max_multiplier: r4(fuelMaxMultiplier),

    demand_multiplier:
      price.demand_multiplier !== undefined
        ? r4(clamp(Number(price.demand_multiplier), 0.5, 5))
        : 1,
    demand_max_multiplier: r4(demandMaxMultiplier),

    cap:
      price.cap !== undefined && price.cap !== null
        ? r2(toMoney(price.cap))
        : null,
  };
}

function factorFromPolicy(value: unknown, fallback = 1): number {
  const n = Number(value);

  if (!Number.isFinite(n) || n <= 0) {
    return fallback;
  }

  if (n >= 5) {
    return r4(1 + n / 100);
  }

  return r4(n);
}

function calculateFuelMultiplier(
  fuelPrice: number | null | undefined,
  rateCard: Record<string, unknown>,
): number {
  const reference = Number(rateCard['fuel_reference_price'] ?? 0);

  if (
    fuelPrice === null ||
    fuelPrice === undefined ||
    !Number.isFinite(Number(fuelPrice)) ||
    !Number.isFinite(reference) ||
    reference <= 0
  ) {
    return 1;
  }

  const sensitivity = Number(rateCard['fuel_sensitivity'] ?? 1);
  const min = Number(rateCard['fuel_min_multiplier'] ?? 0.75);
  const max = Number(rateCard['fuel_max_multiplier'] ?? 2.25);

  const ratio = Number(fuelPrice) / reference;
  const raw = 1 + (ratio - 1) * sensitivity;

  return r4(clamp(raw, min, max));
}

function calculateDemandMultiplier(
  demandMultiplier: number | null | undefined,
  rateCard: Record<string, unknown>,
): number {
  const configured = Number(rateCard['demand_multiplier'] ?? 1);
  const max = Number(rateCard['demand_max_multiplier'] ?? 2.5);

  const value =
    demandMultiplier !== null &&
    demandMultiplier !== undefined &&
    Number.isFinite(Number(demandMultiplier))
      ? Number(demandMultiplier)
      : configured;

  return r4(clamp(value, 0.5, max));
}

function clampPolicyMultiplierByScope(
  multiplier: number,
  scope: PricePolicyScopeType,
): number {
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    return 1;
  }

  if (scope === PricePolicyScopeType.CITY) {
    return clamp(multiplier, 0.9, 1.1);
  }

  if (scope === PricePolicyScopeType.ZONE) {
    return clamp(multiplier, 0.75, 1.35);
  }

  return clamp(multiplier, 0.5, 3);
}

function toMoney(value: unknown): number {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return r2(n);
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}
