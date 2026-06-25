import {
  PRICE_POLICY_SCOPE_OPTIONS,
  PricePolicyScopeType,
} from '../data-access/price-policies.models';

const DEFAULT_PRICE_JSON = JSON.stringify(
  {
    multiplier: 1,
    booking_fee: 0,
    fixed_surcharge: 0,
    fuel_reference_price: 180,
    fuel_sensitivity: 1,
    fuel_min_multiplier: 0.75,
    fuel_max_multiplier: 2.25,
    demand_multiplier: 1,
    demand_max_multiplier: 2.5,
  },
  null,
  2,
);

export const PRICE_POLICY_FORM_FIELDS = [
  {
    key: 'name',
    label: 'Nombre',
    type: 'text',
    required: true,
    maxLength: 140,
    fullWidth: true,
  },
  {
    key: 'scopeType',
    label: 'Alcance',
    type: 'select',
    required: true,
    options: PRICE_POLICY_SCOPE_OPTIONS,
    defaultValue: PricePolicyScopeType.GLOBAL,
  },
  {
    key: 'cityId',
    label: 'ID de ciudad',
    type: 'text',
    placeholder: 'Solo si el alcance es CITY',
    fullWidth: true,
  },
  {
    key: 'zoneId',
    label: 'ID de zona',
    type: 'text',
    placeholder: 'Solo si el alcance es ZONE',
    fullWidth: true,
  },
  {
    key: 'priority',
    label: 'Prioridad',
    type: 'number',
    defaultValue: 100,
    min: 0,
    max: 100000,
  },
  {
    key: 'timezone',
    label: 'Zona horaria',
    type: 'text',
    defaultValue: 'America/Havana',
    placeholder: 'America/Havana',
  },
  {
    key: 'effectiveFrom',
    label: 'Vigente desde',
    type: 'text',
    placeholder: '2026-06-16T00:00:00.000Z',
  },
  {
    key: 'effectiveTo',
    label: 'Vigente hasta',
    type: 'text',
    placeholder: 'Opcional',
  },
  {
    key: 'conditionsJson',
    label: 'Condiciones JSON',
    type: 'textarea',
    rows: 8,
    fullWidth: true,
    defaultValue: '{}',
  },
  {
    key: 'priceJson',
    label: 'Precio JSON',
    type: 'textarea',
    rows: 12,
    fullWidth: true,
    required: true,
    defaultValue: DEFAULT_PRICE_JSON,
  },
  {
    key: 'active',
    label: 'Activa',
    type: 'checkbox',
    defaultValue: true,
  },
] as const;

export const CREATE_PRICE_POLICY_FORM_CONFIG = {
  fields: PRICE_POLICY_FORM_FIELDS,
  submitLabel: 'Crear política',
  cancelLabel: 'Cancelar',
} as any;

export const EDIT_PRICE_POLICY_FORM_CONFIG = {
  fields: PRICE_POLICY_FORM_FIELDS,
  submitLabel: 'Guardar cambios',
  cancelLabel: 'Cancelar',
} as any;
