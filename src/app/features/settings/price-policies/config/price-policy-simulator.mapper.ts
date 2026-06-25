import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import { PricePolicy } from '../data-access/price-policies.models';
import { PricePolicySimulatorInput } from '../simulator/price-policy-simulator.util';

export function mapPricePolicySimulatorFormToInput(
  value: DynamicFormValue,
  policy: PricePolicy | null,
): PricePolicySimulatorInput {
  return {
    baseFare: readNumber(value, 'baseFare', 80),
    perKm: readNumber(value, 'perKm', 35),
    perMinute: readNumber(value, 'perMinute', 8),
    minFare: readNumber(value, 'minFare', 150),

    serviceBaseMultiplier: readNumber(value, 'serviceBaseMultiplier', 1),
    servicePerKmMultiplier: readNumber(value, 'servicePerKmMultiplier', 1),
    servicePerMinuteMultiplier: readNumber(
      value,
      'servicePerMinuteMultiplier',
      1,
    ),
    serviceMinFareMultiplier: readNumber(
      value,
      'serviceMinFareMultiplier',
      1,
    ),

    distanceKm: readNumber(value, 'distanceKm', 0),
    durationMin: readNumber(value, 'durationMin', 0),

    surgeMultiplier: readNumber(value, 'surgeMultiplier', 1),
    extrasTotal: readNumber(value, 'extrasTotal', 0),

    fuelPrice: readNullableNumber(value, 'fuelPrice'),
    fuelReferencePrice: readNullableNumber(value, 'fuelReferencePrice'),
    fuelSensitivity: readNumber(value, 'fuelSensitivity', 1),
    fuelMinMultiplier: readNumber(value, 'fuelMinMultiplier', 0.75),
    fuelMaxMultiplier: readNumber(value, 'fuelMaxMultiplier', 2.25),

    demandMultiplier: readNullableNumber(value, 'demandMultiplier'),
    demandMaxMultiplier: readNumber(value, 'demandMaxMultiplier', 2.5),

    policy,
  };
}

export function readSimulatorPolicyId(value: DynamicFormValue): string | null {
  const policyId = value['policyId'];

  return typeof policyId === 'string' && policyId.trim()
    ? policyId
    : null;
}

function readNumber(
  value: DynamicFormValue,
  key: string,
  fallback: number,
): number {
  const raw = Number(value[key]);

  return Number.isFinite(raw) ? raw : fallback;
}

function readNullableNumber(
  value: DynamicFormValue,
  key: string,
): number | null {
  const raw = value[key];

  if (raw === null || raw === undefined || raw === '') {
    return null;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : null;
}
