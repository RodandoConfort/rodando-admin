export enum SystemSettingValueType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

export enum SystemSettingGroup {
  GENERAL = 'GENERAL',
  PRICING = 'PRICING',
  COMMISSION = 'COMMISSION',
  TRIPS = 'TRIPS',
  PAYMENTS = 'PAYMENTS',
}

export enum SystemSettingKey {
  PRICING_DEFAULT_CURRENCY = 'pricing.default_currency',
  PRICING_FUEL_CURRENT_PRICE = 'pricing.fuel.current_price',
  PRICING_DEMAND_DEFAULT_MULTIPLIER = 'pricing.demand.default_multiplier',
  PRICING_SURGE_DEFAULT_MULTIPLIER = 'pricing.surge.default_multiplier',

  PLATFORM_COMMISSION_PERCENT = 'platform.commission.percent',
  PLATFORM_COMMISSION_FIXED = 'platform.commission.fixed',
  PLATFORM_COMMISSION_MIN = 'platform.commission.min',
  PLATFORM_COMMISSION_MAX = 'platform.commission.max',

  TRIPS_ESTIMATED_SPEED_KMPH = 'trips.estimated_speed_kmph',
}

export interface SystemSetting {
  id: string;
  key: string;
  group: SystemSettingGroup;
  valueType: SystemSettingValueType;
  value: unknown;
  description: string | null;
  active: boolean;
  isPublic: boolean;
  isSecret: boolean;
  updatedBy: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemSettingsQuery {
  search?: string;
  group?: SystemSettingGroup | null;
  active?: boolean | null;
  isPublic?: boolean | null;
  page?: number;
  limit?: number;
}

export interface CreateSystemSettingPayload {
  key: string;
  group?: SystemSettingGroup;
  valueType: SystemSettingValueType;
  value: unknown;
  description?: string | null;
  active?: boolean;
  isPublic?: boolean;
  isSecret?: boolean;
  updatedBy?: string | null;
}

export interface UpdateSystemSettingPayload {
  group?: SystemSettingGroup;
  valueType?: SystemSettingValueType;
  value?: unknown;
  description?: string | null;
  active?: boolean;
  isPublic?: boolean;
  isSecret?: boolean;
  updatedBy?: string | null;
}

export interface SystemSettingFormValue extends Record<string, unknown> {
  key: string;
  group: SystemSettingGroup;
  valueType: SystemSettingValueType;
  valueText: string;
  valueBoolean: boolean;
  description: string | null;
  active: boolean;
  isPublic: boolean;
  isSecret: boolean;
}

export const SYSTEM_SETTING_GROUP_OPTIONS = [
  { label: 'General', value: SystemSettingGroup.GENERAL },
  { label: 'Precios', value: SystemSettingGroup.PRICING },
  { label: 'Comisiones', value: SystemSettingGroup.COMMISSION },
  { label: 'Viajes', value: SystemSettingGroup.TRIPS },
  { label: 'Pagos', value: SystemSettingGroup.PAYMENTS },
] as const;

export const SYSTEM_SETTING_VALUE_TYPE_OPTIONS = [
  { label: 'Texto', value: SystemSettingValueType.STRING },
  { label: 'Número', value: SystemSettingValueType.NUMBER },
  { label: 'Booleano', value: SystemSettingValueType.BOOLEAN },
  { label: 'JSON', value: SystemSettingValueType.JSON },
] as const;

export function getSystemSettingGroupLabel(
  group: SystemSettingGroup,
): string {
  return (
    SYSTEM_SETTING_GROUP_OPTIONS.find((item) => item.value === group)?.label ??
    group
  );
}

export function getSystemSettingValueTypeLabel(
  valueType: SystemSettingValueType,
): string {
  return (
    SYSTEM_SETTING_VALUE_TYPE_OPTIONS.find((item) => item.value === valueType)
      ?.label ?? valueType
  );
}

export function formatSystemSettingValue(setting: SystemSetting): string {
  if (setting.isSecret) {
    return '••••••';
  }

  if (setting.value === null || setting.value === undefined) {
    return '—';
  }

  if (setting.valueType === SystemSettingValueType.BOOLEAN) {
    return setting.value ? 'Sí' : 'No';
  }

  if (setting.valueType === SystemSettingValueType.JSON) {
    return JSON.stringify(setting.value);
  }

  return String(setting.value);
}
