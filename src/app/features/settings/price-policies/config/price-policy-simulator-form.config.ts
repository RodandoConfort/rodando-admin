import { PricePolicy } from '../data-access/price-policies.models';

export function buildPricePolicySimulatorFormConfig(
  policies: readonly PricePolicy[],
) {
  return {
    fields: [
      {
        key: 'policyId',
        label: 'Política de precio',
        type: 'select',
        required: true,
        fullWidth: true,
        options: policies.map((policy) => ({
          label: `${policy.name} · ${policy.scopeType} · prioridad ${policy.priority}`,
          value: policy.id,
        })),
      },

      {
        key: 'baseFare',
        label: 'Tarifa base del vehículo',
        type: 'number',
        required: true,
        defaultValue: 80,
      },
      {
        key: 'perKm',
        label: 'Precio por kilómetro',
        type: 'number',
        required: true,
        defaultValue: 35,
      },
      {
        key: 'perMinute',
        label: 'Precio por minuto',
        type: 'number',
        required: true,
        defaultValue: 8,
      },
      {
        key: 'minFare',
        label: 'Tarifa mínima',
        type: 'number',
        required: true,
        defaultValue: 150,
      },

      {
        key: 'serviceBaseMultiplier',
        label: 'Multiplicador base del servicio',
        type: 'number',
        required: true,
        defaultValue: 1,
      },
      {
        key: 'servicePerKmMultiplier',
        label: 'Multiplicador por km del servicio',
        type: 'number',
        required: true,
        defaultValue: 1,
      },
      {
        key: 'servicePerMinuteMultiplier',
        label: 'Multiplicador por minuto del servicio',
        type: 'number',
        required: true,
        defaultValue: 1,
      },
      {
        key: 'serviceMinFareMultiplier',
        label: 'Multiplicador de tarifa mínima',
        type: 'number',
        required: true,
        defaultValue: 1,
      },

      {
        key: 'distanceKm',
        label: 'Distancia del viaje en km',
        type: 'number',
        required: true,
        defaultValue: 8,
      },
      {
        key: 'durationMin',
        label: 'Duración estimada en minutos',
        type: 'number',
        required: true,
        defaultValue: 18,
      },
      {
        key: 'extrasTotal',
        label: 'Extras del viaje',
        type: 'number',
        required: true,
        defaultValue: 0,
      },

      {
        key: 'surgeMultiplier',
        label: 'Surge / alta demanda global',
        type: 'number',
        required: true,
        defaultValue: 1,
      },
      {
        key: 'demandMultiplier',
        label: 'Demanda actual',
        type: 'number',
        defaultValue: 1,
      },
      {
        key: 'demandMaxMultiplier',
        label: 'Límite máximo de demanda',
        type: 'number',
        defaultValue: 2.5,
      },

      {
        key: 'fuelPrice',
        label: 'Precio actual del combustible',
        type: 'number',
        defaultValue: 180,
      },
      {
        key: 'fuelReferencePrice',
        label: 'Precio de referencia del combustible',
        type: 'number',
        defaultValue: 180,
      },
      {
        key: 'fuelSensitivity',
        label: 'Sensibilidad al combustible',
        type: 'number',
        defaultValue: 1,
      },
      {
        key: 'fuelMinMultiplier',
        label: 'Multiplicador mínimo combustible',
        type: 'number',
        defaultValue: 0.75,
      },
      {
        key: 'fuelMaxMultiplier',
        label: 'Multiplicador máximo combustible',
        type: 'number',
        defaultValue: 2.25,
      },
    ],
    submitLabel: 'Simular precio',
    cancelLabel: 'Limpiar resultado',
  } as any;
}
